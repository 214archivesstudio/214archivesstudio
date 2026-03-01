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
            width={500}
            height={750}
            alt="Silhouette"
            sizes="500px"
            quality="auto"
            format="auto"
            priority
            className="h-80 w-auto object-contain opacity-80 md:h-[480px]"
          />

          <div className="mt-8 flex flex-col items-center gap-1.5">
            <p className="text-base tracking-wider text-muted md:text-lg">
              Director | Cinematographer
            </p>
            <p className="text-base tracking-wider text-muted md:text-lg">
              Based in Seoul S.Korea
            </p>
          </div>

          <div className="mt-10 flex items-center gap-12">
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
                  width={100}
                  height={100}
                  alt={link.platform}
                  sizes="40px"
                  quality="auto"
                  format="auto"
                  className="h-9 w-auto brightness-0 invert md:h-10"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
