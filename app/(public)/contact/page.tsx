"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/common/FadeIn";
import { SOCIAL_LINKS } from "@/data/navigation";
import { CldImage } from "next-cloudinary";

const PHONE_NUMBER = "010-7476-3245";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PHONE_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = PHONE_NUMBER;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

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
            {SOCIAL_LINKS.map((link, index) => {
              const isPhone = link.platform === "Phone";

              const icon = (
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
              );

              if (isPhone) {
                return (
                  <motion.button
                    key={link.platform}
                    onClick={handleCopyPhone}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="relative cursor-pointer transition-opacity hover:opacity-70"
                  >
                    {icon}
                    <AnimatePresence>
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-foreground"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              }

              return (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="transition-opacity hover:opacity-70"
                >
                  {icon}
                </motion.a>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
