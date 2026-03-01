"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { preloadVideos } from "@/lib/videoPreloader";
import type { FilmItem, VideoPreloadState } from "@/types";

const VideoPreloadContext = createContext<VideoPreloadState | null>(null);

interface VideoPreloadProviderProps {
  readonly films: ReadonlyArray<FilmItem>;
  readonly children: React.ReactNode;
}

export function VideoPreloadProvider({
  films,
  children,
}: VideoPreloadProviderProps) {
  const [blobUrlMap, setBlobUrlMap] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const entries = films
      .filter((film) => film.videoThumbnailUrl)
      .map((film) => ({
        id: film.id,
        url: film.videoThumbnailUrl,
      }));

    if (entries.length === 0) {
      setIsLoaded(true);
      return;
    }

    const { promise, abort } = preloadVideos(entries, (p) => {
      setProgress(p);
    });

    promise
      .then((result) => {
        setBlobUrlMap(result.blobUrlMap);
        cleanupRef.current = result.cleanup;
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });

    return () => {
      abort();
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [films]);

  return (
    <VideoPreloadContext value={{ blobUrlMap, progress, isLoaded }}>
      {children}
    </VideoPreloadContext>
  );
}

export function useVideoPreload(): VideoPreloadState {
  const context = useContext(VideoPreloadContext);
  if (!context) {
    throw new Error(
      "useVideoPreload must be used within a VideoPreloadProvider",
    );
  }
  return context;
}
