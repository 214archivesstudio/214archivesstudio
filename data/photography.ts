import type { PhotographyItem } from "@/types";

const createPhotographyItem = (
  id: string,
  title: string,
  client: string,
  photoCount: number = 8
): PhotographyItem => ({
  id,
  title,
  client,
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

export const PHOTOGRAPHY: ReadonlyArray<PhotographyItem> = [
  createPhotographyItem("lookbook-cau-fashion", "Lookbook", "CAU Fashion", 7),
  createPhotographyItem("lookbook-kimaeyoung", "Lookbook", "KimAeYoung", 5),
  createPhotographyItem("lookbook-lark", "Lookbook", "LARK", 3),
  createPhotographyItem("lookbook-youth", "Lookbook", "YOUTH", 6),
  createPhotographyItem("lookbook-bready", "Lookbook", "B.Ready", 4),
  createPhotographyItem("lookbook-not4nerd", "Lookbook", "NOT4NERD", 9),
] as const;
