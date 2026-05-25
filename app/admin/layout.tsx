import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { getCurrentAdminUser } from "@/lib/auth";
import { DriftBadge } from "./_components/drift-badge";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isLoginPage = pathname.endsWith("/admin/login");

  // Login page renders standalone (no shell, no auth fetch).
  if (isLoginPage) return <>{children}</>;

  const user = await getCurrentAdminUser();

  // Middleware should have redirected; this is a safety net.
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-[#CCCCCC]/15 px-6 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold tracking-tight">
            214 Admin
          </Link>
          <nav className="flex gap-4 text-[#CCCCCC]">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/posts" className="hover:text-foreground transition-colors">
              Posts
            </Link>
            {user.role === "admin" && (
              <Link href="/admin/team" className="hover:text-foreground transition-colors">
                Team
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[#888888]">
          <DriftBadge />
          <span>
            {user.email} <span className="text-[#555555]">·</span> {user.role}
          </span>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
