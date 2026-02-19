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
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const hasDragged = useRef(false);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    scrollStartLeft.current = scrollRef.current?.scrollLeft ?? 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStartLeft.current - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClickCapture={onClickCapture}
        className={`no-scrollbar scroll-snap-x flex gap-6 overflow-x-auto px-8 py-4 ${
          isDragging.current ? "cursor-grabbing" : "cursor-grab"
        }`}
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
