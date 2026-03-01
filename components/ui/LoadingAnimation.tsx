"use client";

import { useState, useEffect } from "react";
import { getCldImageUrl } from "next-cloudinary";

const logoUrl = getCldImageUrl({
  src: "214archives/background/logo",
  width: 600,
  height: 600,
  quality: "auto",
  format: "auto",
});

const MIN_DISPLAY_MS = 1000;
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
  const [canDismiss, setCanDismiss] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  // Minimum display time
  useEffect(() => {
    const timer = setTimeout(() => setCanDismiss(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Safety timeout — force dismiss after 15s
  useEffect(() => {
    const timer = setTimeout(() => setCanDismiss(true), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Trigger fade-out when both loaded and min time elapsed
  useEffect(() => {
    if (isLoaded && canDismiss && !fadingOut) {
      setFadingOut(true);
    }
  }, [isLoaded, canDismiss, fadingOut]);

  // Remove from DOM after fade-out completes
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setRemoved(true), FADE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  if (removed) return null;

  const coverTranslateY = -progress * 100;

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
            transition: "transform 150ms ease-out",
          }}
        />
      </div>
    </div>
  );
}
