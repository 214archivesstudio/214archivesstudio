"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import { cn } from "@/lib/utils";
import { getCldImageUrl } from "next-cloudinary";

const logoUrl = getCldImageUrl({
  src: "214archives/background/logo",
  width: 240,
  height: 240,
  quality: "auto",
  format: "auto",
});

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
        {/* Studio Name */}
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            214Archives Studio
          </span>
          <span className="text-[10px] font-light italic tracking-wide text-foreground/80 md:text-xs">
            Every moment happens once. We archive it!
          </span>
        </Link>

        {/* Desktop Navigation */}
        <Navigation />

        {/* Logo */}
        <Link href="/" className="hidden lg:block">
          <img
            src={logoUrl}
            alt="214 Archives Studio"
            className="h-24 w-24 brightness-0 invert"
          />
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={cn(
              "h-px w-5 bg-foreground transition-all duration-300",
              mobileMenuOpen && "translate-y-[7px] rotate-45"
            )}
          />
          <span
            className={cn(
              "h-px w-5 bg-foreground transition-all duration-300",
              mobileMenuOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "h-px w-5 bg-foreground transition-all duration-300",
              mobileMenuOpen && "-translate-y-[7px] -rotate-45"
            )}
          />
        </button>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMenu} />
    </>
  );
}
