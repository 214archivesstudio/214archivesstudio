"use client";

import { useEffect, useCallback } from "react";
import { getCldImageUrl } from "next-cloudinary";
import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { useBackground } from "@/context/BackgroundContext";
import { ARCHIVES } from "@/data/archives";
import { formatArchiveYear } from "@/lib/utils";

export default function ArchivesPage() {
  const { setOverrideMedia } = useBackground();

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
      const archive = ARCHIVES.find((a) => a.id === id);
      if (!archive) return;
      const src = getCldImageUrl({
        src: archive.thumbnail.publicId,
        width: 1920,
        height: 1080,
        quality: "auto",
        format: "auto",
      });
      setOverrideMedia({ type: "image", src, overlayOpacity: 0.7 });
    },
    [setOverrideMedia]
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
