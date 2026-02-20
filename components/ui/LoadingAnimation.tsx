"use client";

import { motion } from "framer-motion";
import { getCldImageUrl } from "next-cloudinary";

const logoUrl = getCldImageUrl({
  src: "214archives/background/logo",
  width: 600,
  height: 600,
  quality: "auto",
  format: "auto",
});

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.0 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="relative overflow-hidden">
        <img
          src={logoUrl}
          alt="214 Archives Studio"
          className="h-48 w-auto brightness-0 invert md:h-72"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
          className="absolute inset-0 bg-black"
        />
      </div>
    </motion.div>
  );
}
