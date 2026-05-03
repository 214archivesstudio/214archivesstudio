"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const queryError = searchParams.get("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "sending" });

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const next = searchParams.get("next") ?? "/admin";
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false, // 어드민은 미리 등록된 사용자만. 자동 가입 차단.
      },
    });

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    setStatus({ kind: "sent", email });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">214 Archives — Admin</h1>
          <p className="text-sm text-[#888888]">
            매직 링크로 로그인합니다. 등록된 어드민 이메일만 허용됩니다.
          </p>
        </div>

        {queryError === "no_role" && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2 rounded">
            이 계정에 어드민 권한이 없습니다. 관리자에게 초대를 요청하세요.
          </div>
        )}

        {status.kind === "sent" ? (
          <div className="border border-[#CCCCCC]/30 bg-[#CCCCCC]/5 text-sm px-4 py-4 rounded space-y-2">
            <p>
              <strong>{status.email}</strong>로 로그인 링크를 보냈습니다.
            </p>
            <p className="text-[#888888]">
              메일함을 확인하고 링크를 클릭하세요. 링크는 1시간 동안 유효합니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-[#CCCCCC]">이메일</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full bg-transparent border border-[#CCCCCC]/30 rounded px-3 py-2 text-sm outline-none focus:border-foreground"
                disabled={status.kind === "sending"}
              />
            </label>

            {status.kind === "error" && (
              <p className="text-sm text-red-400">{status.message}</p>
            )}

            <button
              type="submit"
              disabled={status.kind === "sending" || email.length === 0}
              className="w-full bg-foreground text-background font-medium py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {status.kind === "sending" ? "전송 중…" : "매직 링크 받기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
