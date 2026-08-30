"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { youtubeThumbnailUrl } from "@/lib/video";
import type { PostMediaRow } from "@/types/database";

interface MediaCardProps {
  readonly media: PostMediaRow;
  readonly index: number;
  readonly onAltChange: (mediaId: string, alt: string) => Promise<void>;
  readonly onDeleteClick: (media: PostMediaRow) => void;
}

export function MediaCard({
  media,
  index,
  onAltChange,
  onDeleteClick,
}: MediaCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const isPrimary = index === 0;
  const isImage = media.type === "image";

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1.5">
      <div
        className={cn(
          "relative aspect-[3/2] overflow-hidden rounded-[2px] bg-[#1A1A1A] transition-transform duration-200 ease-out",
          isDragging && "rotate-[-1deg] scale-[1.02] outline outline-1 outline-foreground outline-offset-2",
          isPrimary && !isDragging && "outline outline-1 outline-white/40",
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
        >
          {isImage && media.public_id ? (
            <CldImage
              src={media.public_id}
              alt={media.alt ?? "untitled"}
              width={400}
              height={266}
              crop="fill"
              className="pointer-events-none h-full w-full object-cover"
            />
          ) : media.video_platform === "youtube" && media.video_id ? (
            <Image
              src={youtubeThumbnailUrl(media.video_id)}
              alt={media.video_title ?? "YouTube 영상"}
              width={320}
              height={180}
              unoptimized
              className="pointer-events-none h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-black/60 text-[11px] text-muted">
              <span className="uppercase tracking-[0.1em] text-accent">
                {media.video_platform}
              </span>
              <span className="font-mono text-[10px]">{media.video_id}</span>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute left-2 top-1.5 rounded-[2px] bg-black/55 px-1.5 py-0.5 text-[10px] tracking-[0.05em] text-foreground backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </div>

        {isPrimary && (
          <div className="pointer-events-none absolute right-1.5 top-1.5 rounded-[2px] bg-foreground px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#0d0d0d]">
            썸네일
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-b from-transparent to-black/70 px-2 py-1.5">
          <span className="text-[10px] tracking-[0.1em] text-white/60">⠿</span>
          <button
            type="button"
            onClick={() => onDeleteClick(media)}
            aria-label="이 미디어 삭제"
            className="pointer-events-auto text-[12px] leading-none text-white/70 transition-colors hover:text-[#e2a98c]"
          >
            ✕
          </button>
        </div>
      </div>

      {isImage ? (
        <AltInput media={media} onAltChange={onAltChange} />
      ) : (
        <span className="truncate text-[10px] uppercase tracking-[0.1em] text-muted">
          {media.video_platform} · {media.video_title ?? media.video_id}
        </span>
      )}
    </div>
  );
}

interface AltInputProps {
  readonly media: PostMediaRow;
  readonly onAltChange: (mediaId: string, alt: string) => Promise<void>;
}

function AltInput({ media, onAltChange }: AltInputProps) {
  const [alt, setAlt] = useState(media.alt ?? "");
  const [savedAlt, setSavedAlt] = useState(media.alt ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function handleBlur() {
    if (alt === savedAlt) return;
    setError(null);
    startTransition(async () => {
      try {
        await onAltChange(media.id, alt);
        setSavedAlt(alt);
        setJustSaved(true);
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setJustSaved(false), 1500);
      } catch (err) {
        setError((err as Error).message);
        setAlt(savedAlt);
      }
    });
  }

  return (
    <>
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={handleBlur}
        disabled={isPending}
        placeholder="alt 텍스트"
        className="w-full border-0 border-b border-[#2a2a2a] bg-transparent px-0 py-1 text-[11px] text-accent placeholder:text-[#555] outline-none transition-colors focus:border-foreground disabled:opacity-60"
      />
      {error && <p className="text-[10px] text-[#e2a98c]">{error}</p>}
      {justSaved && !error && (
        <p className="text-[10px] text-muted" aria-live="polite">
          저장됨
        </p>
      )}
    </>
  );
}
