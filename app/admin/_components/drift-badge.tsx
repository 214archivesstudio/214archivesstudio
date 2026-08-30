import Link from "next/link";
import { getDriftCount, getLastSuccessAt } from "@/lib/repos/publish-jobs";
import { Pill } from "./ui/Pill";

export async function DriftBadge() {
  const [drift, lastSuccess] = await Promise.all([
    getDriftCount(),
    getLastSuccessAt(),
  ]);

  if (drift === 0) return null;

  const isFirstPublish = lastSuccess === null;
  const label = isFirstPublish
    ? `최초 반영 ${drift}건 대기`
    : `DRIFT · ${drift}`;
  // First publish is "informational warm" not "drift warning"; both still warm,
  // both use Pill tone="warn" per the new design system (no green semantics).
  return (
    <Link
      href="/admin"
      title="대시보드의 '변경사항 게시' 버튼으로 공개 사이트에 반영하세요"
      className="transition-opacity duration-200 hover:opacity-80"
    >
      <Pill tone="warn">{label}</Pill>
    </Link>
  );
}
