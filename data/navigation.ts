import type { NavItem, SocialLink } from "@/types";

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Showreel", href: "/showreel" },
  { label: "Archives", href: "/archives" },
  { label: "Film", href: "/film" },
  { label: "Photography", href: "/photography" },
  { label: "Personal Work", href: "/personal" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS: ReadonlyArray<SocialLink> = [
  {
    platform: "Instagram",
    url: "https://instagram.com/214archives",
    label: "@214archives",
  },
  {
    platform: "YouTube",
    url: "https://youtube.com/@214archives",
    label: "214 Archives",
  },
  {
    platform: "Vimeo",
    url: "https://vimeo.com/214archives",
    label: "214 Archives",
  },
] as const;

export const SITE_CONFIG = {
  name: "214 Archives Studio",
  tagline: "Visual Storyteller",
  url: "https://214archives.studio",
} as const;
