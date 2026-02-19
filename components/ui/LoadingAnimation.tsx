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
      transition={{ duration: 0.5, delay: 1.5 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.img
        src={logoUrl}
        alt="214 Archives Studio"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: "inset(0% 0 0 0)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="h-48 w-auto brightness-0 invert md:h-72"
      />
    </motion.div>
  );
}
