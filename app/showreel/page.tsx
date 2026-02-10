"use client";

import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { SHOWREELS } from "@/data/showreels";

export default function ShowreelPage() {
  const gridItems = SHOWREELS.map((item) => ({
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
  }));

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Showreel
        </h1>
      </FadeIn>
      <ThumbnailGrid items={gridItems} basePath="/showreel" columns={3} />
    </div>
  );
}
