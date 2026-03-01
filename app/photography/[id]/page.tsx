"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { PHOTOGRAPHY } from "@/data/photography";
import { CldImage } from "next-cloudinary";
import { formatDate } from "@/lib/utils";
import FadeIn from "@/components/common/FadeIn";
import Lightbox from "@/components/ui/Lightbox";

export default function PhotographyDetailPage() {
  const params = useParams();
  const project = PHOTOGRAPHY.find((p) => p.id === params.id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!project) {
    notFound();
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-2 text-2xl font-light tracking-[0.2em] text-foreground">
          {project.title}
        </h1>
        <p className="mb-1 text-sm text-muted">{project.client}</p>
        <p className="mb-12 text-xs text-muted/60">
          {formatDate(project.date)}
        </p>
      </FadeIn>

      <div className="mx-auto max-w-4xl space-y-4">
        {project.photos.map((photo, index) => (
          <motion.div
            key={photo.publicId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            <CldImage
              src={photo.publicId}
              width={1200}
              height={800}
              alt={photo.alt}
              sizes="(max-width: 768px) 100vw, 896px"
              quality="auto"
              format="auto"
              priority={index === 0}
              className="w-full rounded-sm"
            />
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={[...project.photos]}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
