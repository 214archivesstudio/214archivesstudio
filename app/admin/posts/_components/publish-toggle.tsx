"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { togglePublished } from "../_actions/posts";
import { Btn } from "../../_components/ui/Btn";
import { Card, CardLabel } from "../../_components/ui/Card";
import { StatusDot } from "../../_components/ui/StatusDot";
import { DeleteDialog } from "./delete-dialog";

interface PublishToggleProps {
  readonly postId: string;
  readonly initialPublished: boolean;
  readonly canToggle: boolean;
}

export function PublishToggle({
  postId,
  initialPublished,
  canToggle,
}: PublishToggleProps) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDraft, setConfirmingDraft] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function applyToggle(next: boolean): Promise<{ ok: boolean; error?: string }> {
    const result = await togglePublished(postId, next);
    if (!result.ok) return { ok: false, error: result.error ?? "변경에 실패했습니다" };
    setPublished(next);
    router.refresh();
    showToast(next);
    return { ok: true };
  }

  function handleToggle(next: boolean) {
    if (next === published) return;
    setError(null);
    if (!next) {
      // 공개 → 초안은 다음 게시 때 사이트에서 내려가므로 확인을 받는다.
      setConfirmingDraft(true);
      return;
    }
    startTransition(async () => {
      const result = await applyToggle(true);
      if (!result.ok) setError(result.error ?? null);
    });
  }

  function showToast(next: boolean) {
    toast.success(next ? "'공개'로 표시했어요" : "'초안'으로 표시했어요", {
      description: (
        <span>
          사이트에 반영하려면{" "}
          <Link
            href="/admin"
            className="underline text-foreground hover:opacity-80"
          >
            대시보드 → &apos;변경사항 게시&apos;
          </Link>
          를 눌러주세요.
        </span>
      ),
      duration: 8_000,
    });
  }

  return (
    <Card>
      <CardLabel>공개 상태</CardLabel>
      <div className="mb-3 flex items-center gap-2 text-[13px] text-foreground">
        <StatusDot
          status={published ? "published" : "draft"}
          label={published ? "공개" : "초안"}
        />
      </div>
      <p className="mb-4 text-[11px] tracking-[0.05em] text-muted">
        {canToggle
          ? "공개 상태를 변경하면 다음 게시에 반영됩니다."
          : "관리자만 공개 상태를 변경할 수 있습니다."}
      </p>
      {canToggle && (
        <div className="flex gap-2">
          <Btn
            variant={published ? "primary" : "ghost"}
            size="sm"
            type="button"
            disabled={isPending}
            onClick={() => handleToggle(true)}
          >
            공개
          </Btn>
          <Btn
            variant={!published ? "primary" : "ghost"}
            size="sm"
            type="button"
            disabled={isPending}
            onClick={() => handleToggle(false)}
          >
            초안
          </Btn>
        </div>
      )}
      {error && (
        <p className="mt-3 rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
          {error}
        </p>
      )}
      {confirmingDraft && (
        <DeleteDialog
          title="초안으로 전환할까요?"
          description="다음 게시 때 공개 사이트에서 이 게시물이 내려갑니다. 언제든 다시 '공개'로 되돌릴 수 있습니다."
          confirmLabel="초안으로 전환"
          pendingLabel="전환 중…"
          confirmVariant="secondary"
          onConfirm={() => applyToggle(false)}
          onClose={() => setConfirmingDraft(false)}
        />
      )}
    </Card>
  );
}
