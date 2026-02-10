"use client";

import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.span
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-5xl font-light tracking-[0.3em] text-foreground md:text-7xl"
      >
        214
      </motion.span>
    </motion.div>
  );
}
