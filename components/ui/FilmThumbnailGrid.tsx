"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useVideoPreload } from "@/context/VideoPreloadContext";
import VideoThumbnail from "@/components/ui/VideoThumbnail";
import type { FilmItem } from "@/types";

interface FilmThumbnailGridProps {
  readonly items: ReadonlyArray<FilmItem>;
  readonly basePath: string;
  readonly onHover?: (id: string | null) => void;
  readonly formatDate?: (date: string) => string;
}

export default function FilmThumbnailGrid({
  items,
  basePath,
  onHover,
  formatDate,
}: FilmThumbnailGridProps) {
  const { blobUrlMap } = useVideoPreload();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const blobUrl = blobUrlMap.get(item.id) ?? "";
        const originalUrl = item.videoThumbnailUrl ?? "";

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onMouseEnter={() => onHover?.(item.id)}
            onMouseLeave={() => onHover?.(null)}
          >
            <Link href={`${basePath}/${item.id}`} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-background">
                {(blobUrl || originalUrl) ? (
                  <VideoThumbnail
                    blobUrl={blobUrl}
                    originalUrl={originalUrl}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-background" />
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <p className="text-sm text-accent">{item.title}</p>
                {item.date && (
                  <p className="shrink-0 text-xs text-muted">
                    {formatDate ? formatDate(item.date) : item.date}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
