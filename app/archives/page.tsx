"use client";

import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { ARCHIVES } from "@/data/archives";
import { formatArchiveYear } from "@/lib/utils";

export default function ArchivesPage() {
  const gridItems = ARCHIVES.map((item) => ({
    id: item.id,
    title: `${item.city} ${formatArchiveYear(item.year)}`,
    thumbnail: item.thumbnail,
  }));

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Archives
        </h1>
      </FadeIn>
      <ThumbnailGrid items={gridItems} basePath="/archives" columns={3} />
    </div>
  );
}
