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

// Smoothing factor per frame — lower = smoother but slower to catch up
const LERP_SPEED = 0.08;
// Snap to target when difference is negligible (avoids infinite trailing)
const SNAP_THRESHOLD = 0.001;

/** Ease-out cubic: fast start, gentle deceleration */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

interface LoadingAnimationProps {
  readonly progress: number;
  readonly isLoaded: boolean;
  readonly onComplete?: () => void;
}

export default function LoadingAnimation({
  progress,
  isLoaded,
  onComplete,
}: LoadingAnimationProps) {
  const [animationDone, setAnimationDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const revealCompleteTimeRef = useRef<number | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const currentPosRef = useRef(0);

  progressRef.current = progress;

  // Animate cover via direct DOM manipulation — no React re-renders per frame
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const timeFraction = Math.min(elapsed / MIN_ANIMATION_MS, 1);
      const easedTime = easeOutCubic(timeFraction);
      const target = Math.min(progressRef.current, easedTime);

      // Lerp: smoothly interpolate toward the target to absorb progress jumps
      const prev = currentPosRef.current;
      const next =
        Math.abs(target - prev) < SNAP_THRESHOLD
          ? target
          : prev + (target - prev) * LERP_SPEED;
      currentPosRef.current = next;

      if (coverRef.current) {
        coverRef.current.style.transform = `translateY(${-next * 100}%)`;
      }

      if (next < 1 - SNAP_THRESHOLD) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Ensure cover is fully off-screen
        currentPosRef.current = 1;
        if (coverRef.current) {
          coverRef.current.style.transform = "translateY(-100%)";
        }
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

  // Lock body scroll while loading overlay is visible
  useEffect(() => {
    if (removed) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [removed]);

  // Remove from DOM after fade-out completes
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => {
      setRemoved(true);
      onComplete?.();
    }, FADE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fadingOut, onComplete]);

  if (removed) return null;

  return (
    <div
      className="loading-overlay pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
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
          className="absolute bg-black will-change-transform"
          style={{
            /* 1px extra on each edge prevents sub-pixel gap between cover and logo */
            inset: "-1px",
            transform: "translateY(0%)",
          }}
        />
      </div>
    </div>
  );
}
