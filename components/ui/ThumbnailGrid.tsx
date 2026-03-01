"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import type { ThumbnailGridProps } from "@/types";

const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

const columnSizes = {
  2: "(max-width: 768px) 100vw, 50vw",
  3: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  4: "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
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
              <CldImage
                src={item.thumbnail.publicId}
                width={600}
                height={400}
                alt={item.thumbnail.alt}
                sizes={columnSizes[columns]}
                quality="auto"
                format="auto"
                priority={index < columns}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-sm text-accent">{item.title}</p>
              {item.date && (
                <p className="shrink-0 text-xs text-muted">{item.date}</p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
