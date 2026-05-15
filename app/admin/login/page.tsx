"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const queryError = searchParams.get("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const message = mapAuthError(error.message);
      setStatus({ kind: "error", message });
      return;
    }

    const next = searchParams.get("next") ?? "/admin";
    const safeNext = next.startsWith("/") ? next : "/admin";
    router.replace(safeNext);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">214 Archives — Admin</h1>
          <p className="text-sm text-muted">
            등록된 어드민 계정으로 로그인합니다.
          </p>
        </div>

        {queryError === "no_role" && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2 rounded">
            이 계정에 어드민 권한이 없습니다. 관리자에게 초대를 요청하세요.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-accent">이메일</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              className="mt-1 w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm outline-none focus:border-foreground"
              disabled={status.kind === "submitting"}
            />
          </label>

          <label className="block">
            <span className="text-sm text-accent">비밀번호</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm outline-none focus:border-foreground"
              disabled={status.kind === "submitting"}
            />
          </label>

          {status.kind === "error" && (
            <p className="text-sm text-red-400">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={
              status.kind === "submitting" ||
              email.length === 0 ||
              password.length === 0
            }
            className="w-full bg-foreground text-background font-medium py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {status.kind === "submitting" ? "로그인 중…" : "로그인"}
          </button>

          <p className="text-xs text-muted text-center pt-2">
            비밀번호를 잊으셨다면 관리자에게 재설정을 요청하세요.
          </p>
        </form>
      </div>
    </div>
  );
}

function mapAuthError(message: string): string {
  // Supabase returns "Invalid login credentials" for both wrong email and wrong password.
  // Don't reveal which is wrong — same message either way.
  if (/invalid login credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (/email not confirmed/i.test(message)) {
    return "이메일 인증이 완료되지 않았습니다. 관리자에게 문의하세요.";
  }
  if (/rate.limit/i.test(message)) {
    return "잠시 후 다시 시도해 주세요. 너무 많은 요청이 있었습니다.";
  }
  return message;
}
