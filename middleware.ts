import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /**
     * Match everything except:
     *  - _next/static, _next/image, favicon, common static assets
     *  - Cloudinary images already handled by Next.js image pipeline
     *
     * This keeps middleware lightweight; per-route logic lives in updateSession().
     */
    "/((?!_next/static|_next/image|favicon.ico|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
