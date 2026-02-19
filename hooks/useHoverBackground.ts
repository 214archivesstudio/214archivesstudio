"use client";

import { useEffect, useCallback, useMemo } from "react";
import { getCldImageUrl } from "next-cloudinary";
import { useBackground } from "@/context/BackgroundContext";
import type { CloudinaryImage } from "@/types";

interface HoverBackgroundItem {
  readonly id: string;
  readonly thumbnail: CloudinaryImage;
}

function buildBgUrl(publicId: string) {
  return getCldImageUrl({
    src: publicId,
    width: 960,
    height: 540,
    quality: 60,
    format: "auto",
  });
}

export function useHoverBackground(items: ReadonlyArray<HoverBackgroundItem>) {
  const { setOverrideMedia } = useBackground();

  const bgUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.id, buildBgUrl(item.thumbnail.publicId));
    }
    return map;
  }, [items]);

  useEffect(() => {
    for (const src of bgUrlMap.values()) {
      const img = new Image();
      img.src = src;
    }
  }, [bgUrlMap]);

  useEffect(() => {
    return () => setOverrideMedia(null);
  }, [setOverrideMedia]);

  const handleHover = useCallback(
    (id: string | null) => {
      if (!id) {
        setOverrideMedia(null);
        return;
      }
      const src = bgUrlMap.get(id);
      if (!src) return;
      setOverrideMedia({ type: "image", src, overlayOpacity: 0.7 });
    },
    [setOverrideMedia, bgUrlMap]
  );

  return handleHover;
}
