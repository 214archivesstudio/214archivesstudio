"use client";

import { motion } from "framer-motion";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { SITE_CONFIG } from "@/data/navigation";

export default function HomePage() {
  return (
    <>
      <LoadingAnimation />
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.8 }}
          className="text-4xl font-light tracking-[0.3em] text-foreground md:text-6xl"
        >
          {SITE_CONFIG.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.4 }}
          className="mt-4 text-sm tracking-[0.2em] text-muted"
        >
          {SITE_CONFIG.tagline}
        </motion.p>
      </div>
    </>
  );
}
