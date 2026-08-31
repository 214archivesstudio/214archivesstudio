"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Btn } from "../../../_components/ui/Btn";
import { CardLabel } from "../../../_components/ui/Card";
import { parseVideoUrl } from "@/lib/video";
import type { PostMediaRow, PostSection } from "@/types/database";
import { DeleteDialog } from "../delete-dialog";
import { AddImageButton } from "./AddImageButton";
import { AddVideoModal } from "./AddVideoModal";
import { MediaGrid } from "./MediaGrid";

/**
 * 생성 폼의 대기 갤러리. 업로드는 즉시 Cloudinary 로 가고, 항목 목록은
 * hidden input(JSON) 으로 폼과 함께 제출돼 게시물과 동시에 저장된다.
 * DB 왕복이 없으므로 순서·alt·삭제는 전부 로컬 상태 조작이다.
 */
interface StagedMediaManagerProps {
  /** showreel 은 부모가 이 컴포넌트를 렌더하지 않는다. */
  readonly section: PostSection;
  readonly onDirty: () => void;
}

function makeImageRow(input: {
  publicId: string;
  width: number;
  height: number;
}): PostMediaRow {
  return {
    id: `staged-${crypto.randomUUID()}`,
    post_id: "",
    type: "image",
    public_id: input.publicId,
    width: input.width,
    height: input.height,
    alt: null,
    video_platform: null,
    video_id: null,
    video_title: null,
    display_order: 0,
    created_at: "",
  };
}

function makeVideoRow(video: {
  platform: "youtube" | "vimeo";
  videoId: string;
}): PostMediaRow {
  return {
    id: `staged-${crypto.randomUUID()}`,
    post_id: "",
    type: "video",
    public_id: null,
    width: null,
    height: null,
    alt: null,
    video_platform: video.platform,
    video_id: video.videoId,
    video_title: null,
    display_order: 0,
    created_at: "",
  };
}

export function StagedMediaManager({ section, onDirty }: StagedMediaManagerProps) {
  const [rows, setRows] = useState<ReadonlyArray<PostMediaRow>>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PostMediaRow | null>(null);
  // 비동기 콜백(업로드 완료)에서 최신 목록을 읽기 위한 미러. update 로만 갱신한다.
  const rowsRef = useRef(rows);
  function update(next: ReadonlyArray<PostMediaRow>) {
    rowsRef.current = next;
    setRows(next);
    onDirty();
  }

  const allowVideo = section === "personal";
  // personal 에서 담은 영상은 다른 섹션으로 바꾸면 제출·표시에서 제외한다
  // (personal 로 되돌리면 다시 나타난다).
  const visible = allowVideo ? rows : rows.filter((m) => m.type === "image");

  function handleImageUploaded(input: {
    publicId: string;
    width: number;
    height: number;
    index: number;
  }) {
    update([...rowsRef.current, makeImageRow(input)]);
  }

  // 위젯이 알려주는 선택 순서로 이번 배치를 재정렬 — 완료 순서는 병렬이라 뒤섞인다.
  function handleBatchComplete(publicIds: ReadonlyArray<string>) {
    const current = rowsRef.current;
    const batch = publicIds
      .map((pid) => current.find((m) => m.public_id === pid))
      .filter((m): m is PostMediaRow => Boolean(m));
    if (batch.length < 2) return;
    const rest = current.filter((m) => !batch.includes(m));
    update([...rest, ...batch]);
  }

  async function handleVideoSubmit(url: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const video = parseVideoUrl(url);
      if (!video) return { ok: false, error: "영상 URL이 비어있습니다" };
      update([...rowsRef.current, makeVideoRow(video)]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async function handleReorder(orderedIds: ReadonlyArray<string>) {
    const prev = rowsRef.current;
    const next = orderedIds
      .map((id) => prev.find((m) => m.id === id))
      .filter((m): m is PostMediaRow => Boolean(m));
    // 정렬 대상은 visible 뿐이므로 숨은 항목(비 personal 의 영상)은 뒤에 보존한다.
    const hidden = prev.filter((m) => !orderedIds.includes(m.id));
    update([...next, ...hidden]);
  }

  async function handleAltChange(mediaId: string, alt: string): Promise<void> {
    update(
      rowsRef.current.map((m) =>
        m.id === mediaId ? { ...m, alt: alt.trim() || null } : m,
      ),
    );
  }

  async function handleDeleteConfirm(): Promise<{ ok: boolean; error?: string }> {
    if (!deleteTarget) return { ok: false, error: "삭제 대상이 없습니다" };
    update(rowsRef.current.filter((m) => m.id !== deleteTarget.id));
    return { ok: true };
  }

  const serialized = JSON.stringify(
    visible.map((m) =>
      m.type === "image"
        ? {
            type: "image",
            public_id: m.public_id,
            width: m.width,
            height: m.height,
            alt: m.alt,
          }
        : {
            type: "video",
            video_platform: m.video_platform,
            video_id: m.video_id,
          },
    ),
  );

  return (
    <div
      // 갤러리 안 텍스트 입력(alt)에서 Enter 로 바깥 생성 폼이 제출되는 것 방지
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="staged_media" value={serialized} />

      <div className="mb-3.5 flex items-center justify-between">
        <CardLabel className="mb-0">갤러리 · {visible.length}</CardLabel>
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
        게시물을 생성할 때 함께 저장됩니다. 드래그로 순서를 바꿀 수 있습니다.
      </p>

      {visible.length === 0 ? (
        <p className="rounded-[2px] border border-dashed border-[#3a3a3a] py-6 text-center text-[13px] text-muted">
          아직 갤러리가 없습니다. 지금 추가하거나, 생성 후 편집 화면에서도 추가할 수 있습니다.
        </p>
      ) : (
        <MediaGrid
          media={visible}
          onReorder={handleReorder}
          onAltChange={handleAltChange}
          onDeleteClick={(m) => setDeleteTarget(m)}
        />
      )}

      {videoModalOpen &&
        createPortal(
          <AddVideoModal
            onSubmit={handleVideoSubmit}
            onClose={() => setVideoModalOpen(false)}
          />,
          document.body,
        )}

      {deleteTarget &&
        createPortal(
          <DeleteDialog
            title={deleteTarget.type === "video" ? "영상 삭제" : "사진 삭제"}
            description={
              deleteTarget.type === "video"
                ? `${deleteTarget.video_platform} · ${deleteTarget.video_id} 항목을 목록에서 뺍니다.`
                : `${deleteTarget.public_id} 항목을 목록에서 뺍니다.`
            }
            onConfirm={handleDeleteConfirm}
            onClose={() => setDeleteTarget(null)}
          />,
          document.body,
        )}
    </div>
  );
}
