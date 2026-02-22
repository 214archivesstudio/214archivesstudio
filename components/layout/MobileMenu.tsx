"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "@/data/navigation";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm lg:hidden"
        >
          <nav className="flex flex-col items-center gap-8">
            {NAV_ITEMS.map((item, index) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "text-xl tracking-widest transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
