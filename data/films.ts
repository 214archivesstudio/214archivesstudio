import type { FilmItem } from "@/types";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

const VIDEO_THUMBNAIL_VERSIONS: Record<string, string> = {
  "01-unveil": "v1772596602",
  "02-set-it-off": "v1772596604",
  "03-not4nerd": "v1772596606",
  "04-ewha": "v1772596609",
  "05-all-at-once": "v1772596611",
  "06-never-forget": "v1772596613",
  "07-shanghai": "v1772596616",
  "08-about": "v1772596618",
};

function buildVideoThumbnailUrl(id: string): string {
  const version = VIDEO_THUMBNAIL_VERSIONS[id] ?? "";
  const versionSegment = version ? `${version}/` : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${versionSegment}214archives/film/${id}/thumbnail.mp4`;
}

const createFilmPhotos = (id: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    publicId: `214archives/film/${id}/${String(i + 1).padStart(2, "0")}`,
    alt: `${id} photo ${i + 1}`,
    width: 1920,
    height: 1280,
  }));

const createFilm = (
  id: string,
  title: string,
  date: string,
  videoId: string,
  photoCount: number,
): FilmItem => ({
  id,
  title,
  date,
  thumbnail: {
    publicId: `214archives/film/${id}/thumbnail`,
    alt: title,
    width: 1200,
    height: 800,
  },
  videoThumbnailUrl: buildVideoThumbnailUrl(id),
  video: {
    platform: "youtube",
    videoId,
    title,
  },
  photos: createFilmPhotos(id, photoCount),
});

// Sorted by date descending (newest first)
export const FILMS: ReadonlyArray<FilmItem> = [
  createFilm("01-unveil", "Unveil", "2025-11-21", "zCXXsKi0ucI", 8),
  createFilm("04-ewha", "Devil", "2025-08-10", "o3hzeGvh9NQ", 6),
  createFilm("07-shanghai", "We Run The World", "2025-05-11", "cVQu7kwtWGE", 8),
  createFilm("02-set-it-off", "Set It Off", "2025-02-10", "ZYsdtTsAw3o", 8),
  createFilm("06-never-forget", "Never Forget", "2024-11-20", "KpYlOKPSSJ4", 8),
  createFilm("08-about", "About", "2024-06-28", "uif5b0nd8QE", 6),
  createFilm("05-all-at-once", "All At Once", "2024-06-22", "eilzomDSK5w", 0),
  createFilm("03-not4nerd", "Not4Nerd", "2024-06-20", "MLWohM_5e6Q", 8),
] as const;
