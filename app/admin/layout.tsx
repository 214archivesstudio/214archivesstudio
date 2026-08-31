import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { getCurrentAdminUser } from "@/lib/auth";
import { getMissingAdminEnv } from "@/lib/env";
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

  const missingEnv = getMissingAdminEnv();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AdminHeader
        rightSlot={
          <>
            <DriftBadge />
            {/* 정적 단일 파일(public/admin/manual.html)이라 Link 대신 <a> 사용 */}
            <a
              href="/admin/manual.html"
              target="_blank"
              rel="noreferrer"
              className="hidden text-[12px] tracking-[0.05em] text-muted transition-colors duration-200 hover:text-foreground md:inline"
            >
              가이드 ↗
            </a>
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
        {missingEnv.length > 0 && (
          <p className="mb-6 rounded-[2px] border border-[#3a2e1f] bg-[#d6a877]/[0.08] px-4 py-3 text-[12px] text-[#d6a877]">
            업로드 환경 변수가 비어 있어 이미지·영상 업로드가 동작하지 않습니다:{" "}
            <code className="font-mono">{missingEnv.join(", ")}</code> — docs/admin-setup.md §7 참고.
          </p>
        )}
        {children}
      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
