"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

/**
 * Shown once right after createPost redirects with `?created=1`. Fires a toast
 * and strips the query so the message doesn't reappear on every later render.
 */
export function CreatedToast() {
  const pathname = usePathname();

  useEffect(() => {
    // 자식 effect 가 layout 의 <Toaster> 구독보다 먼저 돌 수 있어(하드 로드) 한 틱 미룬다.
    // id 로 중복 제거 (dev StrictMode 의 effect 2회 실행 대비).
    const timer = setTimeout(() => {
      toast.success("썸네일·기본 정보가 저장됐어요", {
        id: "post-created",
        description: "이제 오른쪽 미디어 패널에서 갤러리를 추가하세요.",
        duration: 6_000,
      });
    }, 0);
    // 서버 액션 redirect 직후엔 router.replace 가 무시될 수 있어 네이티브 history 로 쿼리를 지운다.
    // (Next 14.1+ 는 history.replaceState 를 라우터 상태와 동기화한다)
    window.history.replaceState(window.history.state, "", pathname);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
