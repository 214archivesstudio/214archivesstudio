import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { getCurrentAdminUser } from "@/lib/auth";
import { AdminHeader } from "./_components/ui/AdminHeader";
import { UserPill } from "./_components/ui/UserPill";
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AdminHeader
        rightSlot={
          <>
            <DriftBadge />
            <Link
              href="/"
              className="hidden text-[12px] tracking-[0.05em] text-muted transition-colors duration-200 hover:text-foreground md:inline"
            >
              사이트 보기 ↗
            </Link>
            <UserPill email={user.email ?? "unknown"} role={user.role} />
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="text-[12px] tracking-[0.05em] text-muted transition-colors duration-200 hover:text-foreground"
              >
                Logout
              </button>
            </form>
          </>
        }
      />
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 md:px-12 md:pt-8">
        {children}
      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
