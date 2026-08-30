"use client";

import { useRef, useState } from "react";
import { Btn } from "../../../_components/ui/Btn";
import { CardLabel } from "../../../_components/ui/Card";
import type { PostMediaRow, PostSection } from "@/types/database";
import {
  addImageMedia,
  addVideoMedia,
  deleteMedia,
  reorderMedia,
  updateMediaAlt,
} from "../../_actions/media";
import { DeleteDialog } from "../delete-dialog";
import { AddImageButton } from "./AddImageButton";
import { AddVideoModal } from "./AddVideoModal";
import { MediaGrid } from "./MediaGrid";

interface MediaManagerProps {
  readonly postId: string;
  readonly section: PostSection;
  readonly initialMedia: ReadonlyArray<PostMediaRow>;
}

export function MediaManager({ postId, section, initialMedia }: MediaManagerProps) {
  const [media, setMedia] = useState<ReadonlyArray<PostMediaRow>>(initialMedia);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PostMediaRow | null>(null);
  // 배치 업로드 순서 보정: 서버 insert 가 모두 끝나고(pending 0) 위젯이 선택 순서를
  // 알려주면(batchOrder) 그 순서로 한 번 reorder 한다. 둘 중 늦게 오는 쪽이 finalize.
  const pendingUploads = useRef(0);
  const batchOrder = useRef<ReadonlyArray<string> | null>(null);
  // 렌더 밖(비동기 콜백)에서 최신 목록을 읽기 위한 미러. updateMedia 로만 갱신한다.
  const mediaRef = useRef(media);
  function updateMedia(next: ReadonlyArray<PostMediaRow>) {
    mediaRef.current = next;
    setMedia(next);
  }

  if (section === "showreel") {
    return (
      <div>
        <CardLabel>미디어</CardLabel>
        <p className="text-[13px] text-muted">
          쇼릴 섹션은 갤러리가 없습니다 — 영상 URL 한 개만 사용합니다.
        </p>
      </div>
    );
  }

  const allowVideo = section === "personal";

  async function finalizeBatchOrder() {
    const order = batchOrder.current;
    if (!order || pendingUploads.current > 0) return;
    batchOrder.current = null;
    const current = mediaRef.current;
    const batchIds = order
      .map((publicId) => current.find((x) => x.public_id === publicId)?.id)
      .filter((id): id is string => Boolean(id));
    if (batchIds.length < 2) return;
    const rest = current.filter((x) => !batchIds.includes(x.id)).map((x) => x.id);
    const orderedIds = [...rest, ...batchIds];
    const unchanged = orderedIds.every((id, i) => current[i]?.id === id);
    if (!unchanged) await handleReorder(orderedIds);
  }

  async function handleImageUploaded(input: {
    publicId: string;
    width: number;
    height: number;
    index: number;
  }) {
    setGlobalError(null);
    pendingUploads.current += 1;
    try {
      const result = await addImageMedia(postId, input);
      if (!result.ok || !result.data) {
        setGlobalError(
          result.ok
            ? "이미지 추가에 실패했습니다"
            : result.error ?? "이미지 추가에 실패했습니다",
        );
        return;
      }
      // 서버 응답 순서가 업로드 순서와 다를 수 있으므로 display_order 로 정렬한다.
      const added = result.data.media;
      const next = [...mediaRef.current, added].sort(
        (x, y) => x.display_order - y.display_order,
      );
      updateMedia(next);
    } finally {
      pendingUploads.current -= 1;
      void finalizeBatchOrder();
    }
  }

  function handleBatchComplete(publicIds: ReadonlyArray<string>) {
    batchOrder.current = publicIds;
    void finalizeBatchOrder();
  }

  async function handleVideoSubmit(url: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    const result = await addVideoMedia(postId, url);
    if (!result.ok || !result.data) {
      const msg = !result.ok
        ? result.fieldErrors?.url ?? result.error ?? "영상 추가에 실패했습니다"
        : "영상 추가에 실패했습니다";
      return { ok: false, error: msg };
    }
    updateMedia([...mediaRef.current, result.data!.media]);
    return { ok: true };
  }

  async function handleReorder(orderedIds: ReadonlyArray<string>) {
    const previous = mediaRef.current;
    const next: PostMediaRow[] = orderedIds
      .map((id, idx) => {
        const found = previous.find((m) => m.id === id);
        return found ? { ...found, display_order: idx } : null;
      })
      .filter((m): m is PostMediaRow => m !== null);

    updateMedia(next);
    setGlobalError(null);

    const result = await reorderMedia(postId, orderedIds);
    if (!result.ok) {
      updateMedia(previous);
      setGlobalError(result.error ?? "순서 변경에 실패했습니다");
    }
  }

  async function handleAltChange(mediaId: string, alt: string): Promise<void> {
    const result = await updateMediaAlt(mediaId, alt);
    if (!result.ok) {
      throw new Error(result.error ?? "alt 텍스트 저장에 실패했습니다");
    }
    updateMedia(
      mediaRef.current.map((m) =>
        m.id === mediaId ? { ...m, alt: alt.trim() || null } : m,
      ),
    );
  }

  async function handleDeleteConfirm(): Promise<{ ok: boolean; error?: string }> {
    if (!deleteTarget) return { ok: false, error: "삭제 대상이 없습니다" };
    const result = await deleteMedia(deleteTarget.id);
    if (!result.ok) {
      return { ok: false, error: result.error ?? "삭제에 실패했습니다" };
    }
    updateMedia(mediaRef.current.filter((m) => m.id !== deleteTarget.id));
    return { ok: true };
  }

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <CardLabel className="mb-0">미디어 · {media.length}</CardLabel>
        <div className="flex items-center gap-2">
          <AddImageButton
            onUploaded={handleImageUploaded}
            onBatchComplete={handleBatchComplete}
          />
          {allowVideo && (
            <Btn
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setVideoModalOpen(true)}
            >
              + 영상
            </Btn>
          )}
        </div>
      </div>

      <p className="mb-3 text-[11px] tracking-[0.05em] text-muted">
        썸네일을 드래그해 순서를 바꿀 수 있습니다. 1번 항목이 목록 썸네일로 사용됩니다.
      </p>

      {globalError && (
        <p className="mb-3 rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
          {globalError}
        </p>
      )}

      {media.length === 0 ? (
        <p className="rounded-[2px] border border-dashed border-[#3a3a3a] py-6 text-center text-[13px] text-muted">
          아직 미디어가 없습니다. 위의 업로드 버튼으로 추가하세요.
        </p>
      ) : (
        <MediaGrid
          media={media}
          onReorder={handleReorder}
          onAltChange={handleAltChange}
          onDeleteClick={(m) => setDeleteTarget(m)}
        />
      )}

      {videoModalOpen && (
        <AddVideoModal
          onSubmit={handleVideoSubmit}
          onClose={() => setVideoModalOpen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          title={deleteTarget.type === "video" ? "영상 삭제" : "사진 삭제"}
          description={
            deleteTarget.type === "video"
              ? `${deleteTarget.video_platform} · ${deleteTarget.video_id} 항목을 삭제합니다.`
              : `${deleteTarget.public_id} 항목을 삭제합니다.`
          }
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
