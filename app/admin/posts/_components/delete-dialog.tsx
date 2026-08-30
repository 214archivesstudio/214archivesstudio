"use client";

import { useEffect, useState, useTransition } from "react";
import { Btn, type BtnVariant } from "../../_components/ui/Btn";

interface DeleteDialogProps {
  readonly title: string;
  readonly description?: string;
  readonly onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  readonly onClose: () => void;
  /** 확인 버튼 문구. 기본 "삭제" — 삭제 외 확인(초안 전환 등)에도 재사용한다. */
  readonly confirmLabel?: string;
  readonly pendingLabel?: string;
  readonly confirmVariant?: BtnVariant;
}

/**
 * Conditionally rendered modal — parent should mount/unmount via:
 *   {target && <DeleteDialog title=... onClose={() => setTarget(null)} />}
 * Mount/unmount resets internal state (error, pending) cleanly.
 */
export function DeleteDialog({
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = "삭제",
  pendingLabel = "삭제 중…",
  confirmVariant = "danger",
}: DeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.ok) {
        setError(result.error ?? `${confirmLabel}에 실패했습니다.`);
        return;
      }
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm border border-[#2a2a2a] bg-background rounded-[2px] p-6 space-y-5">
        <h2
          id="delete-dialog-title"
          className="text-[15px] font-normal tracking-[0.06em] text-foreground"
        >
          {title}
        </h2>
        {description && (
          <p className="text-[13px] text-accent leading-relaxed">{description}</p>
        )}
        {error && (
          <p className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="text" onClick={onClose} disabled={isPending}>
            취소
          </Btn>
          <Btn variant={confirmVariant} onClick={handleConfirm} disabled={isPending}>
            {isPending ? pendingLabel : confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
