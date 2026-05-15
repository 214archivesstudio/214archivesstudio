"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublishJobRow } from "@/types/database";
import { getJobStatus, triggerPublish } from "../_actions/publish";

interface PublishPanelProps {
  readonly canPublish: boolean;
  readonly drift: number;
  readonly initialJobs: ReadonlyArray<PublishJobRow>;
  readonly initialActiveJobId: string | null;
}

const POLL_INTERVAL_MS = 5_000;

export function PublishPanel({
  canPublish,
  drift,
  initialJobs,
  initialActiveJobId,
}: PublishPanelProps) {
  const router = useRouter();
  const [activeJobId, setActiveJobId] = useState<string | null>(initialActiveJobId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Poll the active job until it completes, then refresh the server-rendered
  // data so drift/jobs reflect the new reality.
  useEffect(() => {
    if (!activeJobId) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      const result = await getJobStatus(activeJobId);
      if (cancelled) return;
      if (!result.ok || !result.data) return;
      const status = result.data.status;
      if (status === "success" || status === "failed") {
        setActiveJobId(null);
        router.refresh();
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeJobId, router]);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await triggerPublish();
      if (!result.ok || !result.data) {
        setError(result.ok ? "트리거 실패" : result.error ?? "트리거 실패");
        return;
      }
      setActiveJobId(result.data.jobId);
      router.refresh();
    });
  }

  const driftLabel =
    drift === 0
      ? "사이트와 동기화됨"
      : `미반영 변경 ${drift}건`;

  const isPublishing = activeJobId !== null;

  return (
    <section className="border border-[#CCCCCC]/15 rounded p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-foreground">사이트 반영</h2>
          <p className="text-xs text-muted mt-0.5">
            {driftLabel}
            {isPublishing && (
              <span className="ml-2 text-yellow-300">· 빌드 진행 중…</span>
            )}
          </p>
        </div>
        {canPublish && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isPending || isPublishing}
            className="px-3 py-1.5 text-sm bg-foreground text-background rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending
              ? "트리거 중…"
              : isPublishing
                ? "빌드 진행 중"
                : "사이트에 반영"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}

      <JobsTable jobs={initialJobs} />
    </section>
  );
}

function JobsTable({ jobs }: { jobs: ReadonlyArray<PublishJobRow> }) {
  if (jobs.length === 0) {
    return <p className="text-xs text-muted">아직 발행 기록이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-muted">
          <tr className="text-left border-b border-[#CCCCCC]/10">
            <th className="py-1.5 pr-3 font-normal">시각</th>
            <th className="py-1.5 pr-3 font-normal">상태</th>
            <th className="py-1.5 pr-3 font-normal">메시지</th>
            <th className="py-1.5 pr-3 font-normal">run</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b border-[#CCCCCC]/5">
              <td className="py-1.5 pr-3 text-[#CCCCCC]">
                {new Date(j.created_at).toLocaleString("ko-KR")}
              </td>
              <td className="py-1.5 pr-3">
                <StatusBadge status={j.status} />
              </td>
              <td className="py-1.5 pr-3 text-[#CCCCCC]">
                {j.message ?? j.error ?? "—"}
              </td>
              <td className="py-1.5 pr-3">
                {j.github_run_url ? (
                  <a
                    href={j.github_run_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    GH ↗
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: PublishJobRow["status"] }) {
  const colors: Record<PublishJobRow["status"], string> = {
    pending: "text-yellow-300",
    running: "text-yellow-300",
    success: "text-green-300",
    failed: "text-red-300",
  };
  return <span className={colors[status]}>{status}</span>;
}
