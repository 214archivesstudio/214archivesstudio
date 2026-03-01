"use client";

import { useState, useEffect, useRef } from "react";
import { getCldImageUrl } from "next-cloudinary";

const logoUrl = getCldImageUrl({
  src: "214archives/background/logo",
  width: 600,
  height: 600,
  quality: "auto",
  format: "auto",
});

const MIN_ANIMATION_MS = 1500;
const SAFETY_TIMEOUT_MS = 15000;
const FADE_DURATION_MS = 500;

interface LoadingAnimationProps {
  readonly progress: number;
  readonly isLoaded: boolean;
}

export default function LoadingAnimation({
  progress,
  isLoaded,
}: LoadingAnimationProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);

  // Animate displayProgress: lerp toward real progress, but enforce min duration
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeFraction = Math.min(elapsed / MIN_ANIMATION_MS, 1);

      // displayProgress can't exceed either the time fraction or real progress
      // This ensures: (1) at least 1.5s to reach 1.0, (2) never ahead of real download
      const target = Math.min(progress, timeFraction);
      setDisplayProgress(target);

      if (target < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimationDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress]);

  // Safety timeout — force dismiss after 15s
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Trigger fade-out when both loaded and animation complete
  useEffect(() => {
    if (isLoaded && animationDone && !fadingOut) {
      setFadingOut(true);
    }
  }, [isLoaded, animationDone, fadingOut]);

  // Remove from DOM after fade-out completes
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setRemoved(true), FADE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  if (removed) return null;

  const coverTranslateY = -displayProgress * 100;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={logoUrl}
          alt="214 Archives Studio"
          className="h-48 w-auto brightness-0 invert md:h-72"
        />
        <div
          className="absolute inset-0 bg-black"
          style={{
            transform: `translateY(${coverTranslateY}%)`,
            transition: "transform 100ms linear",
          }}
        />
      </div>
    </div>
  );
}
