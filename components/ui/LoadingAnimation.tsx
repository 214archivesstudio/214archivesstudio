"use client";

import { motion } from "framer-motion";
import { getCldImageUrl } from "next-cloudinary";

const logoUrl = getCldImageUrl({
  src: "214archives/background/logo",
  width: 400,
  height: 400,
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
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="h-32 w-auto md:h-48"
      />
    </motion.div>
  );
}
