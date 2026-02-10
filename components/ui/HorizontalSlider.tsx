"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { HorizontalSliderProps } from "@/types";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

export default function HorizontalSlider({
  items,
  basePath,
}: HorizontalSliderProps) {
  return (
    <div className="no-scrollbar scroll-snap-x flex gap-6 overflow-x-auto px-8 py-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="scroll-snap-center flex-shrink-0"
        >
          <Link href={`${basePath}/${item.id}`} className="group block">
            <div className="relative h-[60vh] w-[40vw] min-w-[280px] overflow-hidden rounded-sm bg-background">
              <img
                src={buildCloudinaryUrl(item.thumbnail.publicId, {
                  width: 800,
                })}
                alt={item.thumbnail.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
            <p className="mt-3 text-sm text-accent">{item.title}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
