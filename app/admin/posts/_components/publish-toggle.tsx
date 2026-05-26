"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { togglePublished } from "../_actions/posts";
import { Btn } from "../../_components/ui/Btn";
import { Card, CardLabel } from "../../_components/ui/Card";
import { StatusDot } from "../../_components/ui/StatusDot";

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

  function handleToggle(next: boolean) {
    if (next === published) return;
    setError(null);
    startTransition(async () => {
      const result = await togglePublished(postId, next);
      if (!result.ok) {
        setError(result.error ?? "변경에 실패했습니다");
        return;
      }
      setPublished(next);
      router.refresh();
      toast.success(
        next ? "'공개'로 표시했어요" : "'Draft'로 표시했어요",
        {
          description: (
            <span>
              사이트에 반영하려면{" "}
              <Link
                href="/admin"
                className="underline text-foreground hover:opacity-80"
              >
                대시보드 → '변경사항 게시'
              </Link>
              를 눌러주세요.
            </span>
          ),
          duration: 8_000,
        },
      );
    });
  }

  return (
    <Card>
      <CardLabel>공개 상태</CardLabel>
      <div className="mb-3 flex items-center gap-2 text-[13px] text-foreground">
        <StatusDot status={published ? "published" : "draft"} />
        {published ? "공개됨" : "Draft"}
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
            Draft
          </Btn>
        </div>
      )}
      {error && (
        <p className="mt-3 rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
          {error}
        </p>
      )}
    </Card>
  );
}
