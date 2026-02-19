"use client";

import { useEffect, useCallback, useMemo } from "react";
import { getCldImageUrl } from "next-cloudinary";
import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { useBackground } from "@/context/BackgroundContext";
import { ARCHIVES } from "@/data/archives";
import { formatArchiveYear } from "@/lib/utils";

function buildBgUrl(publicId: string) {
  return getCldImageUrl({
    src: publicId,
    width: 960,
    height: 540,
    quality: 60,
    format: "auto",
  });
}

export default function ArchivesPage() {
  const { setOverrideMedia } = useBackground();

  const bgUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of ARCHIVES) {
      map.set(item.id, buildBgUrl(item.thumbnail.publicId));
    }
    return map;
  }, []);

  useEffect(() => {
    for (const src of bgUrlMap.values()) {
      const img = new Image();
      img.src = src;
    }
  }, [bgUrlMap]);

  const gridItems = ARCHIVES.map((item) => ({
    id: item.id,
    title: `${item.city} ${formatArchiveYear(item.year)}`,
    thumbnail: item.thumbnail,
  }));

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

  useEffect(() => {
    return () => setOverrideMedia(null);
  }, [setOverrideMedia]);

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Archives
        </h1>
      </FadeIn>
      <ThumbnailGrid
        items={gridItems}
        basePath="/archives"
        columns={3}
        onHover={handleHover}
      />
    </div>
  );
}
