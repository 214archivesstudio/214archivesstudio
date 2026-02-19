import type { ArchiveItem } from "@/types";

const createPlaceholderPhoto = (id: string, index: number) => ({
  publicId: `214archives/archives/${id}/photo-${String(index).padStart(2, "0")}`,
  alt: `${id} photo ${index}`,
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
    createPlaceholderPhoto(id, i + 1)
  ),
});

export const ARCHIVES: ReadonlyArray<ArchiveItem> = [
  createArchive("25-tokyo", "Tokyo", "2025", 15),
  createArchive("25-sky", "Sky", "2025", 3),
  createArchive("25-newyork", "New York", "2025", 53),
  createArchive("25-miyakojima", "Miyakojima", "2025", 13),
  createArchive("24-taipei", "Taipei", "2024", 26),
  createArchive("24-dubai", "Dubai", "2024", 33),
  createArchive("23-sydney", "Sydney", "2023", 12),
  createArchive("23-melbourne", "Melbourne", "2023", 16),
  createArchive("23-hongkong", "Hong Kong", "2023", 18),
  createArchive("23-hochiminh", "Ho Chi Minh", "2023", 14),
  createArchive("22-rome", "Rome", "2022", 5),
  createArchive("22-paris", "Paris", "2022", 7),
  createArchive("22-london", "London", "2022", 10),
  createArchive("22-interlaken", "Interlaken", "2022", 15),
] as const;
