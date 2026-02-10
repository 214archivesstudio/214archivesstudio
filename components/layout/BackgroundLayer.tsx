"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BackgroundMedia } from "@/types";

interface BackgroundLayerProps {
  readonly media?: BackgroundMedia;
}

export default function BackgroundLayer({ media }: BackgroundLayerProps) {
  const overlayOpacity = media?.overlayOpacity ?? 0.6;

  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence mode="wait">
        {media?.type === "video" ? (
          <motion.video
            key={media.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            src={media.src}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : media?.type === "image" ? (
          <motion.img
            key={media.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            src={media.src}
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
