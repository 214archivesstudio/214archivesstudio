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
  date: string,
  photoCount: number = 6,
): ArchiveItem => ({
  id,
  city,
  year,
  date,
  thumbnail: {
    publicId: `214archives/archives/${id}/thumbnail`,
    alt: `${city} ${year}`,
    width: 1200,
    height: 800,
  },
  photos: Array.from({ length: photoCount }, (_, i) =>
    createPlaceholderPhoto(id, i + 1),
  ),
});

// Sorted by date descending (newest first)
export const ARCHIVES: ReadonlyArray<ArchiveItem> = [
  createArchive("24-taipei", "Taipei", "2024", "2025-07-04", 26),
  createArchive("25-tokyo", "Tokyo", "2025", "2025-06-18", 15),
  createArchive("25-miyakojima", "Miyakojima", "2025", "2025-04-12", 13),
  createArchive("25-newyork", "New York", "2025", "2024-08-30", 53),
  createArchive("24-dubai", "Dubai", "2024", "2024-02-20", 33),
  createArchive("23-hongkong", "Hong Kong", "2023", "2023-11-18", 18),
  createArchive("23-hochiminh", "Ho Chi Minh", "2023", "2023-08-25", 14),
  createArchive("23-sydney", "Sydney", "2023", "2023-02-14", 12),
  createArchive("23-melbourne", "Melbourne", "2023", "2023-02-10", 16),
  createArchive("22-rome", "Rome", "2022", "2022-07-05", 5),
  {
    id: "22-switzerland",
    city: "Switzerland",
    year: "2022",
    date: "2022-06-28",
    thumbnail: {
      publicId: "214archives/archives/22-switzerland/01",
      alt: "Switzerland 2022",
      width: 1200,
      height: 800,
    },
    photos: Array.from({ length: 15 }, (_, i) => ({
      publicId: `214archives/archives/22-switzerland/${String(i + 1).padStart(2, "0")}`,
      alt: `Switzerland 2022 photo ${i + 1}`,
      width: 1920,
      height: 1280,
    })),
  },
  createArchive("22-paris", "Paris", "2022", "2022-06-20", 7),
  createArchive("22-london", "London", "2022", "2022-06-15", 10),
] as const;
