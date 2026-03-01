"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/common/FadeIn";
import { SOCIAL_LINKS } from "@/data/navigation";
import { CldImage } from "next-cloudinary";

export default function ContactPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6">
      <FadeIn>
        <div className="flex flex-col items-center">
          <CldImage
            src="214archives/contact/silhouette-2"
            width={400}
            height={600}
            alt="Silhouette"
            sizes="400px"
            quality="auto"
            format="auto"
            priority
            className="h-64 w-auto object-contain opacity-80 md:h-96"
          />

          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="text-sm tracking-wider text-muted">
              Director | Cinematographer
            </p>
            <p className="text-sm tracking-wider text-muted">
              Based in Seoul S.Korea
            </p>
          </div>

          <div className="mt-8 flex items-center gap-10">
            {SOCIAL_LINKS.map((link, index) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target={link.platform === "Phone" ? undefined : "_blank"}
                rel={
                  link.platform === "Phone"
                    ? undefined
                    : "noopener noreferrer"
                }
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="transition-opacity hover:opacity-70"
              >
                <CldImage
                  src={link.iconPublicId}
                  width={80}
                  height={80}
                  alt={link.platform}
                  sizes="32px"
                  quality="auto"
                  format="auto"
                  className="h-7 w-7 brightness-0 invert md:h-8 md:w-8"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
