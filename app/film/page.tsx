"use client";

import FadeIn from "@/components/common/FadeIn";
import ThumbnailGrid from "@/components/ui/ThumbnailGrid";
import { useHoverBackground } from "@/hooks/useHoverBackground";
import { FILMS } from "@/data/films";
import { formatDate } from "@/lib/utils";

export default function FilmPage() {
  const handleHover = useHoverBackground(FILMS);

  const gridItems = FILMS.map((item) => ({
    id: item.id,
    title: item.title,
    date: formatDate(item.date),
    thumbnail: item.thumbnail,
  }));

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Film
        </h1>
      </FadeIn>
      <ThumbnailGrid
        items={gridItems}
        basePath="/film"
        columns={3}
        onHover={handleHover}
      />
    </div>
  );
}
