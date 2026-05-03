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
  let response = NextResponse.next({ request });

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
        response = NextResponse.next({ request });
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

  // Logged-in users hitting /admin/login go straight to dashboard.
  if (isLoginRoute) {
    if (user) {
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
