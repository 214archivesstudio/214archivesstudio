"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/common/FadeIn";
import { SOCIAL_LINKS } from "@/data/navigation";
import { CldImage } from "next-cloudinary";

export default function ContactPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6">
      <FadeIn>
        <div className="mb-12 flex flex-col items-center gap-8">
          <CldImage
            src="214archives/contact/silhouette"
            width={400}
            height={600}
            alt="Silhouette"
            sizes="400px"
            quality="auto"
            priority
            className="h-48 w-auto object-contain opacity-80 md:h-64"
          />
          <h1 className="text-2xl font-light tracking-[0.2em] text-foreground">
            Contact
          </h1>
        </div>
      </FadeIn>

      <div className="flex flex-col items-center gap-6">
        {SOCIAL_LINKS.map((link, index) => (
          <motion.a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            className="group flex flex-col items-center gap-1"
          >
            <span className="text-sm tracking-wider text-muted transition-colors group-hover:text-foreground">
              {link.platform}
            </span>
            <span className="text-xs text-accent/60 transition-colors group-hover:text-accent">
              {link.label}
            </span>
          </motion.a>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 text-xs text-muted/50"
      >
        &copy; 2025 214 Archives Studio
      </motion.p>
    </div>
  );
}
