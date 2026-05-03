"use client";

import { useEffect, useState, useTransition } from "react";

interface DeleteDialogProps {
  readonly title: string;
  readonly description?: string;
  readonly onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  readonly onClose: () => void;
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
        setError(result.error ?? "삭제에 실패했습니다.");
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
      <div className="w-full max-w-sm bg-background border border-accent/30 rounded p-5 space-y-4">
        <h2 id="delete-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-accent">{description}</p>
        )}
        {error && (
          <p className="text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            autoFocus
            className="px-3 py-1.5 text-sm border border-accent/30 rounded hover:border-foreground transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="px-3 py-1.5 text-sm bg-red-500/90 text-white rounded hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {isPending ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
