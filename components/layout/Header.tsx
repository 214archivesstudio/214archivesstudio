"use client";

import { useState, useEffect, useCallback } from "react";
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

const SCROLL_THRESHOLD = 10;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-colors duration-300 md:px-12",
          scrolled && "bg-black/60 backdrop-blur-md",
        )}
      >
        {/* Studio Name */}
        <Link href="/" className="flex flex-col items-center">
          <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            214Archives Studio
          </span>
          <span className="text-[8px] font-light tracking-[0.08em] text-foreground/80 md:text-[8px] md:tracking-[0.1em]">
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
              mobileMenuOpen && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "h-px w-5 bg-foreground transition-all duration-300",
              mobileMenuOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "h-px w-5 bg-foreground transition-all duration-300",
              mobileMenuOpen && "-translate-y-[7px] -rotate-45",
            )}
          />
        </button>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMenu} />
    </>
  );
}
