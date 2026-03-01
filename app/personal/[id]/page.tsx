"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { PERSONAL_WORKS } from "@/data/personal";
import { CldImage } from "next-cloudinary";
import { formatDate } from "@/lib/utils";
import FadeIn from "@/components/common/FadeIn";
import VideoPlayer from "@/components/ui/VideoPlayer";
import type { CloudinaryImage, VideoEmbed } from "@/types";

function isVideoEmbed(
  media: CloudinaryImage | VideoEmbed,
): media is VideoEmbed {
  return "platform" in media;
}

export default function PersonalDetailPage() {
  const params = useParams();
  const work = PERSONAL_WORKS.find((w) => w.id === params.id);

  if (!work) {
    notFound();
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-2 text-2xl font-light tracking-[0.2em] text-foreground">
          {work.title}
        </h1>
        <p className="mb-8 text-sm text-muted">{formatDate(work.date)}</p>
      </FadeIn>

      {work.description && (
        <FadeIn delay={0.2}>
          <p className="mb-12 max-w-2xl text-sm leading-relaxed text-accent">
            {work.description}
          </p>
        </FadeIn>
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        {work.media.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {isVideoEmbed(item) ? (
              <VideoPlayer video={item} />
            ) : (
              <CldImage
                src={item.publicId}
                width={1200}
                height={800}
                alt={item.alt}
                sizes="(max-width: 768px) 100vw, 896px"
                quality="auto"
                format="auto"
                priority={index === 0}
                className="w-full rounded-sm"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
