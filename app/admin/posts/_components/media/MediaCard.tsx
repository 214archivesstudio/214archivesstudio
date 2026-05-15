"use client";

import { useState, useTransition } from "react";
import { CldImage } from "next-cloudinary";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PostMediaRow } from "@/types/database";

interface MediaCardProps {
  readonly media: PostMediaRow;
  readonly onAltChange: (mediaId: string, alt: string) => Promise<void>;
  readonly onDeleteClick: (media: PostMediaRow) => void;
}

export function MediaCard({ media, onAltChange, onDeleteClick }: MediaCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (media.type === "video") {
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <VideoCardInner
          media={media}
          dragHandle={{ ...attributes, ...listeners }}
          onDeleteClick={onDeleteClick}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <ImageCardInner
        media={media}
        dragHandle={{ ...attributes, ...listeners }}
        onAltChange={onAltChange}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
}

interface DragHandle {
  readonly [key: string]: unknown;
}

interface ImageCardInnerProps {
  readonly media: PostMediaRow;
  readonly dragHandle: DragHandle;
  readonly onAltChange: (mediaId: string, alt: string) => Promise<void>;
  readonly onDeleteClick: (media: PostMediaRow) => void;
}

function ImageCardInner({
  media,
  dragHandle,
  onAltChange,
  onDeleteClick,
}: ImageCardInnerProps) {
  const [alt, setAlt] = useState(media.alt ?? "");
  const [savedAlt, setSavedAlt] = useState(media.alt ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAltBlur() {
    if (alt === savedAlt) return;
    setError(null);
    startTransition(async () => {
      try {
        await onAltChange(media.id, alt);
        setSavedAlt(alt);
      } catch (err) {
        setError((err as Error).message);
        setAlt(savedAlt);
      }
    });
  }

  return (
    <div className="group border border-accent/15 rounded overflow-hidden bg-white/[0.02]">
      <div
        {...dragHandle}
        className="relative aspect-[3/2] cursor-grab active:cursor-grabbing select-none"
      >
        {media.public_id && (
          <CldImage
            src={media.public_id}
            alt={alt || "untitled"}
            width={320}
            height={213}
            crop="fill"
            className="w-full h-full object-cover pointer-events-none"
          />
        )}
        <button
          type="button"
          onClick={() => onDeleteClick(media)}
          className="absolute top-1.5 right-1.5 px-2 py-0.5 text-xs bg-black/70 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="이 사진 삭제"
        >
          삭제
        </button>
      </div>
      <div className="p-2 space-y-1">
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={handleAltBlur}
          disabled={isPending}
          placeholder="alt 텍스트"
          className="w-full bg-transparent border border-accent/20 rounded px-2 py-1 text-xs focus:outline-none focus:border-foreground disabled:opacity-60"
        />
        {error && <p className="text-[10px] text-red-400">{error}</p>}
      </div>
    </div>
  );
}

interface VideoCardInnerProps {
  readonly media: PostMediaRow;
  readonly dragHandle: DragHandle;
  readonly onDeleteClick: (media: PostMediaRow) => void;
}

function VideoCardInner({ media, dragHandle, onDeleteClick }: VideoCardInnerProps) {
  return (
    <div className="group border border-accent/15 rounded overflow-hidden bg-white/[0.02]">
      <div
        {...dragHandle}
        className="relative aspect-[3/2] cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center text-xs text-muted gap-1 bg-black/40"
      >
        <span className="text-[10px] uppercase tracking-wider text-accent">
          {media.video_platform}
        </span>
        <span className="font-mono text-[10px]">{media.video_id}</span>
        <button
          type="button"
          onClick={() => onDeleteClick(media)}
          className="absolute top-1.5 right-1.5 px-2 py-0.5 text-xs bg-black/70 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="이 영상 삭제"
        >
          삭제
        </button>
      </div>
      <div className="p-2">
        <span className="text-[10px] text-muted">embedded video</span>
      </div>
    </div>
  );
}
