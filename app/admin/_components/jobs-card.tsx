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

// 서버 컴포넌트라 호스트 TZ(Vercel = UTC)를 따르면 9시간 어긋난다. 운영은 한국 고정.
const TIME_ZONE = "Asia/Seoul";

/** KST 기준 연·월·일·시·분. ICU 데이터에 따라 "오후"가 "PM"으로 나오는 문제를 피하려 직접 조립한다. */
function kstParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: get("minute"),
  };
}

function fmtTime(iso: string): string {
  const t = kstParts(new Date(iso));
  const period = t.hour < 12 ? "오전" : "오후";
  const hour12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const time = `${period} ${hour12}:${t.minute}`;
  const isToday = t.ymd === kstParts(new Date()).ymd;
  return isToday ? time : `${t.month}월 ${t.day}일 ${time}`;
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-[#666]">
                <th className="px-4 py-2.5 font-normal md:px-6">시간</th>
                <th className="px-4 py-2.5 font-normal md:px-6">상태</th>
                <th className="px-4 py-2.5 font-normal md:px-6">메시지</th>
                <th className="px-4 py-2.5 text-right font-normal md:px-6">
                  로그
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-[#2a2a2a]">
                  <td className="whitespace-nowrap px-4 py-4 align-middle text-[12px] text-muted md:px-6">
                    {fmtTime(j.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-middle md:px-6">
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
                  <td className="min-w-[200px] px-4 py-4 align-middle md:px-6">
                    <span
                      className="line-clamp-2 text-[12px] text-accent"
                      title={j.message && j.error ? j.error : undefined}
                    >
                      {j.message || j.error || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right align-middle md:px-6">
                    {j.github_run_url ? (
                      <a
                        href={j.github_run_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap text-[12px] text-muted underline-offset-2 hover:text-foreground hover:underline"
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
        </div>
      )}
    </Card>
  );
}
