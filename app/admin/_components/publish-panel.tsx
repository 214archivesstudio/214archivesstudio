"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getJobStatus, markJobTimedOut, triggerPublish } from "../_actions/publish";
import { Btn } from "./ui/Btn";
import { Card, CardLabel } from "./ui/Card";
import { Pill } from "./ui/Pill";
import type { DriftItem } from "@/lib/repos/publish-jobs";
import { SECTION_LABEL } from "@/lib/sections";
import type { PostSection } from "@/types/database";

interface PublishPanelProps {
  readonly canPublish: boolean;
  readonly drift: number;
  readonly driftItems: ReadonlyArray<DriftItem>;
  readonly lastSuccessAt: string | null;
  readonly initialActiveJobId: string | null;
}

const POLL_INTERVAL_MS = 5_000;
/** 실측 빌드 2–3분. 초과 시 stuck 으로 간주하고 failed 로 기록한다. */
const PUBLISH_TIMEOUT_MS = 10 * 60_000;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.round(hours / 24);
  return `${days}일 전`;
}

export function PublishPanel({
  canPublish,
  drift,
  driftItems,
  lastSuccessAt,
  initialActiveJobId,
}: PublishPanelProps) {
  const router = useRouter();
  const [activeJobId, setActiveJobId] = useState<string | null>(initialActiveJobId);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!activeJobId) return;
    const jobId = activeJobId;
    let cancelled = false;

    async function poll() {
      const result = await getJobStatus(jobId);
      if (cancelled || !result.ok || !result.data) return;
      const job = result.data;
      if (job.status === "success" || job.status === "failed") {
        setActiveJobId(null);
        router.refresh();
        return;
      }
      const elapsed = Date.now() - new Date(job.created_at).getTime();
      if (elapsed < PUBLISH_TIMEOUT_MS) return;
      // 서버 기록이 실패해도(권한·네트워크) UI 는 반드시 타임아웃으로 전환한다.
      try {
        await markJobTimedOut(job.id);
      } catch {
        // 기록 실패는 무시 — 행은 남지만 다음 로드에서 다시 타임아웃 처리된다.
      }
      if (cancelled) return;
      setActiveJobId(null);
      setTimedOut(true);
      router.refresh();
    }

    void poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeJobId, router]);

  function handleClick() {
    setError(null);
    setTimedOut(false);
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

  const isPublishing = activeJobId !== null;
  const inSync = drift === 0 && !isPublishing;
  const isFirstPublish = lastSuccessAt === null;

  const pillLabel = isPublishing
    ? "PUBLISHING"
    : timedOut
      ? "TIMEOUT"
      : inSync
        ? "IN SYNC"
        : isFirstPublish
          ? `INITIAL · ${drift}`
          : `DRIFT · ${drift}`;
  const pillTone = isPublishing || inSync
    ? "default"
    : timedOut
      ? "danger"
      : "warn";

  const description = isPublishing
    ? "사이트 빌드가 진행 중입니다. 완료되면 자동으로 새로고침됩니다."
    : timedOut
      ? "10분 안에 게시가 끝나지 않아 실패로 기록했습니다. 아래 최근 활동의 실행 로그에서 원인을 확인한 뒤 다시 시도해 주세요."
      : inSync
        ? "모든 변경사항이 사이트에 반영되어 있습니다."
        : `${drift}건의 변경사항이 아직 사이트에 반영되지 않았습니다. 게시를 누르면 사이트 빌드가 시작됩니다.`;

  return (
    <Card className="flex flex-col gap-5">
      <CardLabel>게시 패널</CardLabel>

      <div>
        <div className="mb-2 flex items-center gap-2.5">
          <Pill tone={pillTone}>{pillLabel}</Pill>
          <span className="text-[11px] text-muted">저장됨 → 공개 사이트</span>
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-accent">{description}</p>
      </div>

      {driftItems.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {driftItems.map((d) => (
            <div
              key={d.id}
              className="flex justify-between gap-3 rounded-[2px] border border-[#2a2a2a] bg-white/[0.03] px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.1em] text-muted">
                  {SECTION_LABEL[d.section as PostSection] ?? d.section}
                </div>
                <div className="mt-1 truncate text-[13px] text-foreground">
                  {d.title}
                </div>
              </div>
              <div
                className="shrink-0 whitespace-nowrap text-[11px] text-[#666]"
                suppressHydrationWarning
              >
                {relativeTime(d.updated_at)}
              </div>
            </div>
          ))}
          {drift > driftItems.length && (
            <Link
              href="/admin/posts"
              className="text-[12px] text-muted transition-colors hover:text-foreground"
            >
              외 {drift - driftItems.length}건 · 전체 목록 →
            </Link>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
          {error}
        </p>
      )}

      <div className="mt-1 flex flex-col gap-3 border-t border-[#2a2a2a] pt-4">
        <div className="flex justify-between text-[12px] text-muted">
          <span>마지막 게시</span>
          {/* 상대 시각은 서버·클라이언트 시계 차로 "방금"/"1분 전"이 갈릴 수 있어 하이드레이션 경고를 억제 (React #418) */}
          <span className="text-accent" suppressHydrationWarning>
            {lastSuccessAt ? relativeTime(lastSuccessAt) : "기록 없음"}
          </span>
        </div>
        {canPublish && (
          <Btn
            variant="primary"
            size="lg"
            onClick={handleClick}
            disabled={isPending || isPublishing}
          >
            {isPending
              ? "트리거 중…"
              : isPublishing
                ? "빌드 진행 중"
                : timedOut
                  ? "다시 게시"
                  : "변경사항 게시"}
          </Btn>
        )}
        {!canPublish && (
          <p className="text-[12px] text-muted">
            관리자만 게시할 수 있습니다.
          </p>
        )}
      </div>
    </Card>
  );
}
