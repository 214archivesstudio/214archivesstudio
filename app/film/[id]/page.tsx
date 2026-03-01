"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { CldImage } from "next-cloudinary";
import { FILMS } from "@/data/films";
import { formatDate } from "@/lib/utils";
import FadeIn from "@/components/common/FadeIn";
import VideoPlayer from "@/components/ui/VideoPlayer";

export default function FilmDetailPage() {
  const params = useParams();
  const film = FILMS.find((f) => f.id === params.id);

  if (!film) {
    notFound();
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-2 text-2xl font-light tracking-[0.2em] text-foreground">
          {film.title}
        </h1>
        <p className="mb-8 text-sm text-muted">{formatDate(film.date)}</p>
      </FadeIn>

      <div className="mx-auto max-w-4xl space-y-6">
        <FadeIn delay={0.2}>
          <VideoPlayer video={film.video} />
        </FadeIn>

        {film.photos.map((photo, index) => (
          <motion.div
            key={photo.publicId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <CldImage
              src={photo.publicId}
              width={1200}
              height={800}
              alt={photo.alt}
              sizes="(max-width: 768px) 100vw, 896px"
              quality="auto"
              priority={index === 0}
              className="w-full rounded-sm"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
