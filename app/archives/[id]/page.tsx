"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ARCHIVES } from "@/data/archives";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { formatArchiveYear } from "@/lib/utils";
import FadeIn from "@/components/common/FadeIn";
import Lightbox from "@/components/ui/Lightbox";

export default function ArchiveDetailPage() {
  const params = useParams();
  const archive = ARCHIVES.find((a) => a.id === params.id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!archive) {
    notFound();
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-8 text-2xl font-light tracking-[0.2em] text-foreground">
          {archive.city} {formatArchiveYear(archive.year)}
        </h1>
      </FadeIn>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {archive.photos.map((photo, index) => (
          <motion.div
            key={photo.publicId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            <div className="group relative aspect-[3/2] overflow-hidden bg-background">
              <img
                src={buildCloudinaryUrl(photo.publicId, { width: 600 })}
                alt={photo.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={[...archive.photos]}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
