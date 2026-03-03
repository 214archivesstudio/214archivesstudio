"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface UseVideoAutoplayParams {
  readonly blobUrl: string;
  readonly originalUrl: string;
  readonly enabled: boolean;
}

interface UseVideoAutoplayReturn {
  readonly videoRef: React.RefCallback<HTMLVideoElement>;
  readonly currentSrc: string;
  readonly isPlaying: boolean;
  readonly handleLoadedData: () => void;
}

export function useVideoAutoplay({
  blobUrl,
  originalUrl,
  enabled,
}: UseVideoAutoplayParams): UseVideoAutoplayReturn {
  const elementRef = useRef<HTMLVideoElement | null>(null);
  const enabledRef = useRef(enabled);
  const [currentSrc, setCurrentSrc] = useState(blobUrl || originalUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const gestureCleanupRef = useRef<(() => void) | null>(null);
  const fellBackRef = useRef(false);

  enabledRef.current = enabled;

  const waitForGesture = useCallback((video: HTMLVideoElement) => {
    gestureCleanupRef.current?.();

    const handler = () => {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("click", handler);
      gestureCleanupRef.current = null;
    };

    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("click", handler, { once: true });
    gestureCleanupRef.current = cleanup;
  }, []);

  const attemptPlay = useCallback(
    async (video: HTMLVideoElement) => {
      if (!enabledRef.current) return;

      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        if (!(error instanceof DOMException)) return;

        if (error.name === "NotSupportedError" && blobUrl && !fellBackRef.current) {
          fellBackRef.current = true;
          setCurrentSrc(originalUrl);
        } else if (error.name === "NotAllowedError") {
          waitForGesture(video);
        }
        // AbortError (src change race) is safe to ignore —
        // onLoadedData will retry when the new source is ready
      }
    },
    [blobUrl, originalUrl, waitForGesture],
  );

  // Called by <video onLoadedData> — fires every time a new src finishes loading
  const handleLoadedData = useCallback(() => {
    const video = elementRef.current;
    if (video && enabledRef.current) {
      attemptPlay(video);
    }
  }, [attemptPlay]);

  // Play/pause based on visibility
  useEffect(() => {
    const video = elementRef.current;
    if (!video) return;

    if (enabled) {
      attemptPlay(video);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [enabled, attemptPlay]);

  // Sync src when blobUrl arrives after mount
  useEffect(() => {
    if (fellBackRef.current) return;
    const nextSrc = blobUrl || originalUrl;
    setCurrentSrc(nextSrc);
  }, [blobUrl, originalUrl]);

  // Cleanup gesture listeners on unmount
  useEffect(() => {
    return () => {
      gestureCleanupRef.current?.();
    };
  }, []);

  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      elementRef.current = node;
    },
    [],
  );

  return { videoRef, currentSrc, isPlaying, handleLoadedData };
}
