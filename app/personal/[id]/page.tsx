"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { PERSONAL_WORKS } from "@/data/personal";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import FadeIn from "@/components/common/FadeIn";
import VideoPlayer from "@/components/ui/VideoPlayer";
import type { CloudinaryImage, VideoEmbed } from "@/types";

function isVideoEmbed(media: CloudinaryImage | VideoEmbed): media is VideoEmbed {
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
        <h1 className="mb-8 text-2xl font-light tracking-[0.2em] text-foreground">
          {work.title}
        </h1>
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
              <img
                src={buildCloudinaryUrl(item.publicId, { width: 1200 })}
                alt={item.alt}
                className="w-full rounded-sm"
                loading="lazy"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
