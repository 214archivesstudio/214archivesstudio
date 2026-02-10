"use client";

import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { PERSONAL_WORKS } from "@/data/personal";

export default function PersonalPage() {
  const gridItems = PERSONAL_WORKS.map((item) => ({
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
  }));

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Personal Work
        </h1>
      </FadeIn>
      <ThumbnailGrid items={gridItems} basePath="/personal" columns={2} />
    </div>
  );
}
