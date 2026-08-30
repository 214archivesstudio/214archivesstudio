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
  // Once the blob URL fails (NotSupportedError) we permanently fall back to the
  // original URL. State drives the derived `currentSrc`; the ref guards the
  // async retry path without a stale closure.
  const [fellBack, setFellBack] = useState(false);
  const fellBackRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const gestureCleanupRef = useRef<(() => void) | null>(null);

  const currentSrc = fellBack ? originalUrl : blobUrl || originalUrl;
  const isPlaying = playing && enabled;

  // Mirror `enabled` into a ref for async callbacks. Declared before the
  // play/pause effect below so it is up to date when that effect runs.
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const waitForGesture = useCallback((video: HTMLVideoElement) => {
    gestureCleanupRef.current?.();

    const handler = () => {
      video.play().then(() => setPlaying(true)).catch(() => {});
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
        setPlaying(true);
      } catch (error) {
        if (!(error instanceof DOMException)) return;

        if (error.name === "NotSupportedError" && blobUrl && !fellBackRef.current) {
          fellBackRef.current = true;
          setFellBack(true);
        } else if (error.name === "NotAllowedError") {
          waitForGesture(video);
        }
        // AbortError (src change race) is safe to ignore —
        // onLoadedData will retry when the new source is ready
      }
    },
    [blobUrl, waitForGesture],
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
      // `isPlaying` is derived as playing && enabled, so no setState needed here.
      video.pause();
    }
  }, [enabled, attemptPlay]);

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
