import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the user's session and gates /admin/* routes by role.
 *
 * Routing rules:
 *  - /admin/login        — public (must allow unauthenticated access)
 *  - /admin/*            — requires authenticated user with admin or editor role
 *  - /auth/callback      — public (magic link exchange)
 *  - everything else     — public (passes through)
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // app/admin/layout.tsx 가 로그인 페이지 여부를 판단할 때 읽는 요청 헤더.
  // (요청 헤더에 넣어야 서버 컴포넌트의 headers() 에서 보인다 — 응답 헤더는 안 보임)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const nextWithHeaders = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = nextWithHeaders();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Don't break the public site if env is missing — only fail loud on /admin.
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return new NextResponse(
        "Server misconfigured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing.",
        { status: 500 },
      );
    }
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = nextWithHeaders();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: must call getUser() to refresh expired sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (!isAdminRoute) return response;

  // Logged-in users hitting /admin/login go straight to dashboard,
  // unless an error query param is present (e.g. ?error=no_role) — in that
  // case render the login page so the user can see why access was denied.
  if (isLoginRoute) {
    const hasError = request.nextUrl.searchParams.has("error");
    if (user && !hasError) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // /admin/* (other than /admin/login) — require auth + role.
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!roleRow) {
    // Authenticated but not authorized — sign out and bounce to login with notice.
    const deniedUrl = new URL("/admin/login", request.url);
    deniedUrl.searchParams.set("error", "no_role");
    return NextResponse.redirect(deniedUrl);
  }

  return response;
}
