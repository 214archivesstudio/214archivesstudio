"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface CreatedToastProps {
  readonly postId: string;
  /** 생성 시 함께 저장된 갤러리 항목 수 — 안내 문구를 상황에 맞춘다. */
  readonly mediaCount?: number;
}

/**
 * Shown once right after createPost redirects with `?created=1`.
 *
 * The query is left in place on purpose: rewriting the URL with
 * history.replaceState gets undone by the router on the next server-action
 * revalidate, which re-mounted this component and re-fired the toast. A
 * per-post sessionStorage flag makes the toast fire exactly once per tab.
 */
export function CreatedToast({ postId, mediaCount = 0 }: CreatedToastProps) {
  useEffect(() => {
    const key = `admin:post-created:${postId}`;
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(key) === "1";
      sessionStorage.setItem(key, "1");
    } catch {
      // storage unavailable — fall through and just show the toast
    }
    if (alreadyShown) return;
    // 자식 effect 가 layout 의 <Toaster> 구독보다 먼저 돌 수 있어(하드 로드) 한 틱 미룬다.
    const timer = setTimeout(() => {
      toast.success("썸네일·기본 정보가 저장됐어요", {
        id: "post-created",
        description:
          mediaCount > 0
            ? `갤러리 ${mediaCount}개도 함께 저장됐어요.`
            : "이제 오른쪽 미디어 패널에서 갤러리를 추가하세요.",
        duration: 6_000,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [postId, mediaCount]);

  return null;
}
