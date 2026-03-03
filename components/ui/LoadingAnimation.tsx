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

const MIN_ANIMATION_MS = 3000;
const LOGO_REVEAL_HOLD_MS = 500;
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
  const [animationDone, setAnimationDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const revealCompleteTimeRef = useRef<number | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);

  progressRef.current = progress;

  // Animate cover via direct DOM manipulation — no React re-renders per frame
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeFraction = Math.min(elapsed / MIN_ANIMATION_MS, 1);
      const target = Math.min(progressRef.current, timeFraction);

      if (coverRef.current) {
        coverRef.current.style.transform = `translateY(${-target * 100}%)`;
      }

      if (target < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (revealCompleteTimeRef.current === null) {
          revealCompleteTimeRef.current = Date.now();
        }
        const sinceReveal = Date.now() - revealCompleteTimeRef.current;
        if (sinceReveal >= LOGO_REVEAL_HOLD_MS) {
          setAnimationDone(true);
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
          ref={coverRef}
          className="absolute inset-0 bg-black will-change-transform"
          style={{ transform: "translateY(0%)" }}
        />
      </div>
    </div>
  );
}
