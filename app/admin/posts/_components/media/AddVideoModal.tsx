"use client";

import { useEffect, useState, useTransition } from "react";
import { Btn } from "../../../_components/ui/Btn";
import { Field } from "../../../_components/ui/Field";
import { Input } from "../../../_components/ui/Input";

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
        className="w-full max-w-md rounded-[2px] border border-[#2a2a2a] bg-background p-6 space-y-5"
      >
        <h2
          id="add-video-title"
          className="text-[15px] font-normal tracking-[0.06em] text-foreground"
        >
          영상 항목 추가
        </h2>
        <Field label="YouTube 또는 Vimeo URL" required>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtu.be/…"
            autoFocus
          />
        </Field>
        {error && (
          <p className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="text" type="button" onClick={onClose} disabled={isPending}>
            취소
          </Btn>
          <Btn
            variant="primary"
            type="submit"
            disabled={isPending || !url.trim()}
          >
            {isPending ? "추가 중…" : "추가"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
