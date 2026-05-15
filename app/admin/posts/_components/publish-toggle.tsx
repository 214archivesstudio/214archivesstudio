"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublished } from "../_actions/posts";
import { cn } from "@/lib/utils";

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
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !published;
    setError(null);
    startTransition(async () => {
      const result = await togglePublished(postId, next);
      if (!result.ok) {
        setError(result.error ?? "변경에 실패했습니다");
        return;
      }
      setPublished(next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border border-accent/15 rounded p-4">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">
            {published ? "공개됨" : "Draft"}
          </div>
          <div className="text-xs text-muted">
            {canToggle
              ? "토글로 공개 상태를 변경합니다."
              : "관리자만 공개 상태를 변경할 수 있습니다."}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={published}
          aria-label={published ? "비공개로 변경" : "공개로 변경"}
          onClick={canToggle ? handleToggle : undefined}
          disabled={!canToggle || isPending}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            published ? "bg-green-500/70" : "bg-accent/20",
            (!canToggle || isPending) && "opacity-50 cursor-not-allowed",
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-foreground transition-transform",
              published ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
