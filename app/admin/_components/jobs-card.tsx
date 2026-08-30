import { Card, CardLabel } from "./ui/Card";
import { Pill } from "./ui/Pill";
import type { PublishJobRow } from "@/types/database";

interface JobsCardProps {
  readonly jobs: ReadonlyArray<PublishJobRow>;
}

const STATUS_LABEL: Record<PublishJobRow["status"], string> = {
  success: "완료",
  failed: "실패",
  pending: "대기",
  running: "진행 중",
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) {
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobsCard({ jobs }: JobsCardProps) {
  return (
    <Card padded={false}>
      <div className="flex items-baseline justify-between px-6 pb-4 pt-5">
        <CardLabel className="mb-0">최근 활동</CardLabel>
      </div>

      {jobs.length === 0 ? (
        <p className="px-6 pb-6 text-[12px] text-muted">
          아직 발행 기록이 없습니다.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-[#666]">
              <th className="px-6 py-2.5 font-normal">시간</th>
              <th className="px-6 py-2.5 font-normal">상태</th>
              <th className="px-6 py-2.5 font-normal">메시지</th>
              <th className="px-6 py-2.5 text-right font-normal">로그</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-[#2a2a2a]">
                <td className="whitespace-nowrap px-6 py-4 align-middle text-[12px] text-muted">
                  {fmtTime(j.created_at)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 align-middle">
                  <Pill
                    tone={
                      j.status === "failed"
                        ? "danger"
                        : j.status === "success"
                          ? "default"
                          : "warn"
                    }
                  >
                    {STATUS_LABEL[j.status]}
                  </Pill>
                </td>
                <td className="px-6 py-4 align-middle">
                  <span className="line-clamp-2 text-[12px] text-accent">
                    {j.message || j.error || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right align-middle">
                  {j.github_run_url ? (
                    <a
                      href={j.github_run_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-muted underline-offset-2 hover:text-foreground hover:underline"
                    >
                      실행 로그 ↗
                    </a>
                  ) : (
                    <span className="text-[12px] text-[#444]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
