import type { ShowreelItem } from "@/types";

export const SHOWREELS: ReadonlyArray<ShowreelItem> = [
  {
    id: "2025-showreel",
    title: "2025 Showreel",
    year: 2025,
    date: "2026-02-23",
    thumbnail: {
      publicId: "214archives/showreel/2025-thumb",
      alt: "2025 Showreel Thumbnail",
      width: 1920,
      height: 1080,
    },
    video: {
      platform: "youtube",
      videoId: "gpMopox52mE",
      title: "214 Archives 2025 Showreel",
    },
    description: "A collection of the best work from 2025.",
  },
] as const;
