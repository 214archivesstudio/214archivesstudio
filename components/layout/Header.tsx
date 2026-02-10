"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import { cn } from "@/lib/utils";

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
        <Link
          href="/"
          className="text-sm font-light tracking-[0.2em] text-foreground"
        >
          214 ARCHIVES
        </Link>

        {/* Desktop Navigation */}
        <Navigation />

        {/* Logo */}
        <Link href="/" className="hidden md:block">
          <Image
            src="/logo/214-logo.svg"
            alt="214 Archives Studio"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
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
