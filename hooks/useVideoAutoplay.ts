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
}

export function useVideoAutoplay({
  blobUrl,
  originalUrl,
  enabled,
}: UseVideoAutoplayParams): UseVideoAutoplayReturn {
  const elementRef = useRef<HTMLVideoElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState(blobUrl || originalUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const gestureCleanupRef = useRef<(() => void) | null>(null);

  const attemptPlay = useCallback(
    async (video: HTMLVideoElement) => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        if (error instanceof DOMException) {
          if (
            error.name === "NotSupportedError" &&
            blobUrl &&
            video.src !== originalUrl
          ) {
            // Blob URL not supported — fall back to original Cloudinary URL
            setCurrentSrc(originalUrl);
            video.src = originalUrl;
            video.load();
            try {
              await video.play();
              setIsPlaying(true);
            } catch {
              // Fallback also failed — wait for user gesture
              waitForGesture(video);
            }
          } else if (error.name === "NotAllowedError") {
            // Data-saver / low-power mode — wait for first touch/click
            waitForGesture(video);
          }
        }
      }
    },
    [blobUrl, originalUrl],
  );

  const waitForGesture = useCallback((video: HTMLVideoElement) => {
    // Clean up any previous listener
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

  // Play/pause based on enabled (visibility)
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

  // Sync src when blobUrl changes (e.g. preload completes after mount)
  useEffect(() => {
    const nextSrc = blobUrl || originalUrl;
    setCurrentSrc((prev) => {
      // Don't revert to blob if we already fell back to original
      if (!blobUrl && prev === originalUrl) return prev;
      return nextSrc;
    });
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
      if (node && enabled) {
        attemptPlay(node);
      }
    },
    [enabled, attemptPlay],
  );

  return { videoRef, currentSrc, isPlaying };
}
