"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/data/navigation";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <motion.div
            key={item.href}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href={item.href}
              className={cn(
                "text-sm tracking-wider transition-colors duration-200",
                isActive ? "text-foreground" : "text-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
