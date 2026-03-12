"use client";

import { useCallback, useState } from "react";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import FilmThumbnailGrid from "@/components/ui/FilmThumbnailGrid";
import FadeIn from "@/components/common/FadeIn";
import {
  VideoPreloadProvider,
  useVideoPreload,
} from "@/context/VideoPreloadContext";
import { useHoverBackgroundVideo } from "@/hooks/useHoverBackgroundVideo";
import { FILMS } from "@/data/films";
import { formatDate } from "@/lib/utils";

function HomeContent() {
  const { progress, isLoaded } = useVideoPreload();
  const handleHover = useHoverBackgroundVideo(FILMS);
  const [contentVisible, setContentVisible] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setContentVisible(true);
  }, []);

  return (
    <>
      <LoadingAnimation
        progress={progress}
        isLoaded={isLoaded}
        onComplete={handleLoadingComplete}
      />
      <div
        className="px-6 py-12 md:px-12"
        style={{ visibility: contentVisible ? "visible" : "hidden" }}
      >
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
    </>
  );
}

export default function HomePage() {
  return (
    <VideoPreloadProvider films={FILMS}>
      <HomeContent />
    </VideoPreloadProvider>
  );
}
