"use client";

import { useRef, useState, useEffect } from "react";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

interface VideoThumbnailProps {
  readonly blobUrl: string;
  readonly originalUrl: string;
  readonly className?: string;
}

export default function VideoThumbnail({
  blobUrl,
  originalUrl,
  className,
}: VideoThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { videoRef, currentSrc } = useVideoAutoplay({
    blobUrl,
    originalUrl,
    enabled: isVisible,
  });

  return (
    <div ref={containerRef} className={className}>
      {(blobUrl || originalUrl) && (
        <video
          ref={videoRef}
          src={currentSrc}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
