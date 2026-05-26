"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn } from "../_components/ui/Btn";
import { Field } from "../_components/ui/Field";
import { Input } from "../_components/ui/Input";

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

  const submitting = status.kind === "submitting";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(255,255,255,0.04),_transparent_60%)]" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative flex w-[380px] flex-col gap-8">
        <div className="text-center">
          <div className="text-[56px] font-light leading-none tracking-[0.1em] text-foreground">
            214
          </div>
          <div className="mt-3.5 text-[11px] uppercase tracking-[0.3em] text-muted">
            Studio Admin
          </div>
        </div>

        {queryError === "no_role" && (
          <div className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[13px] text-[#e2a98c]">
            이 계정에 어드민 권한이 없습니다. 관리자에게 초대를 요청하세요.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="이메일" required>
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="studio@214archives.com"
              autoComplete="username"
              disabled={submitting}
            />
          </Field>

          <Field label="비밀번호" required>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </Field>

          {status.kind === "error" && (
            <p className="mb-3 text-[13px] text-[#e2a98c]">{status.message}</p>
          )}

          <div className="mt-2 flex flex-col gap-3">
            <Btn
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={
                submitting || email.length === 0 || password.length === 0
              }
            >
              {submitting ? "로그인 중…" : "로그인"}
            </Btn>
          </div>
        </form>

        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-[#666]">
          승인된 운영자만 접근할 수 있습니다
        </div>
      </div>
    </div>
  );
}

function mapAuthError(message: string): string {
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
