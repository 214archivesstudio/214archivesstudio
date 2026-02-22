"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import type { HorizontalSliderProps } from "@/types";

export default function HorizontalSlider({
  items,
  basePath,
}: HorizontalSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scrollBy = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>("[data-slide]");
    const distance = item ? item.offsetWidth + 24 : el.clientWidth * 0.6;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!scrollRef.current || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    scrollRef.current.scrollBy({ left: e.deltaY * 2, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onWheel={onWheel}
        className="no-scrollbar scroll-snap-x flex gap-6 overflow-x-auto px-8 py-4"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            data-slide
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.3) }}
            className="scroll-snap-center flex-shrink-0"
          >
            <Link
              href={`${basePath}/${item.id}`}
              className="group block"
              draggable={false}
            >
              <div className="relative h-[60vh] w-[45vh] min-w-[280px] overflow-hidden rounded-sm bg-background">
                <CldImage
                  src={item.thumbnail.publicId}
                  fill
                  sizes="(max-width: 640px) 280px, 486px"
                  quality="auto"
                  format="auto"
                  priority={index < 2}
                  alt={item.thumbnail.alt}
                  draggable={false}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </div>
              <p className="mt-3 text-sm text-accent">{item.title}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          &#8249;
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          &#8250;
        </button>
      )}
    </div>
  );
}
