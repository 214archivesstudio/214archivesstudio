"use client";

import { useEffect, useState, useTransition } from "react";

interface AddVideoModalProps {
  readonly onSubmit: (url: string) => Promise<{ ok: boolean; error?: string }>;
  readonly onClose: () => void;
}

export function AddVideoModal({ onSubmit, onClose }: AddVideoModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(url);
      if (!result.ok) {
        setError(result.error ?? "추가에 실패했습니다");
        return;
      }
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-video-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-background border border-accent/30 rounded p-5 space-y-4"
      >
        <h2 id="add-video-title" className="text-base font-semibold">
          영상 항목 추가
        </h2>
        <label className="block space-y-1">
          <span className="text-sm text-accent">YouTube 또는 Vimeo URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            autoFocus
            className="w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
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
            className="px-3 py-1.5 text-sm border border-accent/30 rounded hover:border-foreground transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="px-3 py-1.5 text-sm bg-foreground text-background rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "추가 중…" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
}
