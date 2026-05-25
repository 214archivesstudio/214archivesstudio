import Link from "next/link";
import { getDriftCount, getLastSuccessAt } from "@/lib/repos/publish-jobs";

export async function DriftBadge() {
  const [drift, lastSuccess] = await Promise.all([
    getDriftCount(),
    getLastSuccessAt(),
  ]);

  if (drift === 0) return null;

  const isFirstPublish = lastSuccess === null;
  const label = isFirstPublish
    ? `최초 반영 ${drift}건 대기`
    : `미반영 ${drift}건`;
  const colorClasses = isFirstPublish
    ? "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20"
    : "border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20";

  return (
    <Link
      href="/admin"
      title="대시보드의 '사이트에 반영' 버튼으로 공개 사이트에 배포하세요"
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${colorClasses}`}
    >
      {label}
    </Link>
  );
}
