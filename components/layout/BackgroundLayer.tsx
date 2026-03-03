"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBackground } from "@/context/BackgroundContext";
import type { BackgroundMedia } from "@/types";

interface BackgroundLayerProps {
  readonly media?: BackgroundMedia;
}

export default function BackgroundLayer({ media }: BackgroundLayerProps) {
  const { overrideMedia } = useBackground();
  const activeMedia = overrideMedia ?? media;
  const overlayOpacity = activeMedia?.overlayOpacity ?? 0.6;

  const videoRefCallback = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node) {
        node.play().catch(() => {});
      }
    },
    [],
  );

  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence mode="wait">
        {activeMedia?.type === "video" ? (
          <motion.video
            key={activeMedia.src}
            ref={videoRefCallback}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            src={activeMedia.src}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : activeMedia?.type === "image" ? (
          <motion.img
            key={activeMedia.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            src={activeMedia.src}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />
    </div>
  );
}
