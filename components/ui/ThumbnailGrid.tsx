"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ThumbnailGridProps } from "@/types";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

export default function ThumbnailGrid({
  items,
  basePath,
  columns = 3,
  onHover,
}: ThumbnailGridProps) {
  return (
    <div className={`grid ${columnClasses[columns]} gap-4`}>
      {items.map((item, index) => (
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
              <img
                src={buildCloudinaryUrl(item.thumbnail.publicId, {
                  width: 600,
                })}
                alt={item.thumbnail.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
            <p className="mt-2 text-sm text-accent">{item.title}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
