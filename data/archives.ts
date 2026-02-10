import type { ArchiveItem } from "@/types";

const createPlaceholderPhoto = (city: string, index: number) => ({
  publicId: `214archives/archives/${city.toLowerCase().replace(/\s/g, "-")}/photo-${index}`,
  alt: `${city} photo ${index}`,
  width: 1920,
  height: 1280,
});

const createArchive = (
  id: string,
  city: string,
  year: string,
  photoCount: number = 6
): ArchiveItem => ({
  id,
  city,
  year,
  thumbnail: {
    publicId: `214archives/archives/${id}/thumbnail`,
    alt: `${city} ${year}`,
    width: 1200,
    height: 800,
  },
  photos: Array.from({ length: photoCount }, (_, i) =>
    createPlaceholderPhoto(city, i + 1)
  ),
});

export const ARCHIVES: ReadonlyArray<ArchiveItem> = [
  createArchive("24-shanghai", "Shanghai", "2024"),
  createArchive("24-taipei", "Taipei", "2024"),
  createArchive("24-tokyo", "Tokyo", "2024"),
  createArchive("24-miyakojima", "Miyakojima", "2024"),
  createArchive("24-newyork", "New York", "2024"),
  createArchive("24-dubai", "Dubai", "2024"),
  createArchive("24-hongkong", "Hong Kong", "2024"),
  createArchive("24-hochiminh", "Ho Chi Minh", "2024"),
  createArchive("24-sydney", "Sydney", "2024"),
  createArchive("24-melbourne", "Melbourne", "2024"),
  createArchive("24-rome", "Rome", "2024"),
  createArchive("24-interlaken", "Interlaken", "2024"),
  createArchive("24-paris", "Paris", "2024"),
  createArchive("24-london", "London", "2024"),
] as const;
