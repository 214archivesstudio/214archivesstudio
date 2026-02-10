"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/common/FadeIn";

export default function FilmPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6">
      <FadeIn>
        <h1 className="mb-6 text-2xl font-light tracking-[0.2em] text-foreground">
          Film
        </h1>
      </FadeIn>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm tracking-wider text-muted"
      >
        Coming Soon
      </motion.p>
    </div>
  );
}
