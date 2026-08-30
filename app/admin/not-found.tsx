import Link from "next/link";
import { Btn } from "./_components/ui/Btn";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted">404</p>
      <h1 className="mt-3 text-[22px] font-light text-foreground">
        찾을 수 없는 페이지입니다
      </h1>
      <p className="mt-3 text-[13px] leading-relaxed text-accent">
        삭제됐거나 주소가 잘못됐을 수 있어요.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/admin/posts">
          <Btn variant="primary">포스트 목록으로</Btn>
        </Link>
        <Link href="/admin">
          <Btn variant="ghost">대시보드</Btn>
        </Link>
      </div>
    </div>
  );
}
