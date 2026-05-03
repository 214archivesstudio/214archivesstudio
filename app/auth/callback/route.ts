import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic link callback. Exchanges the OTP `code` for a session cookie,
 * then redirects to `next` (defaults to /admin).
 *
 * Failure modes:
 *  - missing code → bounce to login with error=missing_code
 *  - exchange fails → bounce to login with error=exchange_failed
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=exchange_failed&message=${encodeURIComponent(error.message)}`,
    );
  }

  // Only allow redirects to internal paths to prevent open-redirect.
  const safeNext = next.startsWith("/") ? next : "/admin";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
