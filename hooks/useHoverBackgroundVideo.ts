"use client";

import { useEffect, useCallback } from "react";
import { useBackground } from "@/context/BackgroundContext";
import { useVideoPreload } from "@/context/VideoPreloadContext";
import type { FilmItem } from "@/types";

export function useHoverBackgroundVideo(
  items: ReadonlyArray<FilmItem>,
) {
  const { setOverrideMedia } = useBackground();
  const { blobUrlMap } = useVideoPreload();

  useEffect(() => {
    return () => setOverrideMedia(null);
  }, [setOverrideMedia]);

  const handleHover = useCallback(
    (id: string | null) => {
      if (!id) {
        setOverrideMedia(null);
        return;
      }

      const blobUrl = blobUrlMap.get(id);
      const item = items.find((f) => f.id === id);
      const src = blobUrl || item?.videoThumbnailUrl;

      if (!src) return;
      setOverrideMedia({ type: "video", src, overlayOpacity: 0.7 });
    },
    [setOverrideMedia, blobUrlMap, items],
  );

  return handleHover;
}
