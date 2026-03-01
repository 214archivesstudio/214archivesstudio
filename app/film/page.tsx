"use client";

import FadeIn from "@/components/common/FadeIn";
import FilmThumbnailGrid from "@/components/ui/FilmThumbnailGrid";
import { VideoPreloadProvider } from "@/context/VideoPreloadContext";
import { useHoverBackgroundVideo } from "@/hooks/useHoverBackgroundVideo";
import { FILMS } from "@/data/films";
import { formatDate } from "@/lib/utils";

function FilmContent() {
  const handleHover = useHoverBackgroundVideo(FILMS);

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
          Film
        </h1>
      </FadeIn>
      <FilmThumbnailGrid
        items={FILMS}
        basePath="/film"
        onHover={handleHover}
        formatDate={formatDate}
      />
    </div>
  );
}

export default function FilmPage() {
  return (
    <VideoPreloadProvider films={FILMS}>
      <FilmContent />
    </VideoPreloadProvider>
  );
}
