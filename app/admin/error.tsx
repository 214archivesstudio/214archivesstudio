"use client";

import Link from "next/link";
import { Btn } from "./_components/ui/Btn";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted">
        문제가 발생했어요
      </p>
      <h1 className="mt-3 text-[22px] font-light text-foreground">
        이 화면을 불러오지 못했습니다
      </h1>
      <p className="mt-3 text-[13px] leading-relaxed text-accent">
        잠시 후 다시 시도해 주세요. 계속 반복되면 아래 코드를 관리자에게
        전달해 주세요.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-[#666]">{error.digest}</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Btn variant="primary" onClick={reset}>
          다시 시도
        </Btn>
        <Link href="/admin/posts">
          <Btn variant="ghost">포스트 목록으로</Btn>
        </Link>
      </div>
    </div>
  );
}
