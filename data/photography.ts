import type { PhotographyItem } from "@/types";

const createPhotographyItem = (
  id: string,
  title: string,
  client: string,
  date: string,
  photoCount: number = 8,
): PhotographyItem => ({
  id,
  title,
  client,
  date,
  thumbnail: {
    publicId: `214archives/photography/${id}/thumbnail`,
    alt: `${title} - ${client}`,
    width: 1200,
    height: 1600,
  },
  photos: Array.from({ length: photoCount }, (_, i) => ({
    publicId: `214archives/photography/${id}/photo-${String(i + 1).padStart(2, "0")}`,
    alt: `${title} photo ${i + 1}`,
    width: 1920,
    height: 1280,
  })),
});

// Sorted by date descending (newest first)
export const PHOTOGRAPHY: ReadonlyArray<PhotographyItem> = [
  createPhotographyItem("lookbook-cau-fashion", "LookBook", "CAU Fashion", "2025-02-10", 7),
  createPhotographyItem("lookbook-bready", "Product", "B.Ready", "2024-11-17", 4),
  createPhotographyItem("lookbook-kimaeyoung", "Profile", "KimAeYoung", "2024-11-10", 5),
  createPhotographyItem("lookbook-not4nerd", "LookBook", "NOT4NERD", "2024-06-10", 9),
  createPhotographyItem("lookbook-youth", "Concept", "YOUTH", "2024-05-10", 6),
  createPhotographyItem("lookbook-lark", "Profile", "LARK", "2024-04-10", 3),
] as const;
