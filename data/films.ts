import type { FilmItem } from "@/types";

const VIDEO_THUMBNAIL_URLS: Record<string, string> = {
  "01-unveil":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384651/214archives/film/01-unveil/thumbnail.mp4",
  "02-set-it-off":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384653/214archives/film/02-set-it-off/thumbnail.mp4",
  "03-not4nerd":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384656/214archives/film/03-not4nerd/thumbnail.mp4",
  "04-ewha":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384660/214archives/film/04-ewha/thumbnail.mp4",
  "05-all-at-once":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384658/214archives/film/05-all-at-once/thumbnail.mp4",
  "06-never-forget":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384660/214archives/film/06-never-forget/thumbnail.mp4",
  "07-shanghai":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384663/214archives/film/07-shanghai/thumbnail.mp4",
  "08-about":
    "https://res.cloudinary.com/dottudttp/video/upload/v1772384665/214archives/film/08-about/thumbnail.mp4",
};

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
  videoThumbnailUrl: VIDEO_THUMBNAIL_URLS[id] ?? "",
  video: {
    platform: "youtube",
    videoId,
    title,
  },
  photos: createFilmPhotos(id, photoCount),
});

// Sorted by date descending (newest first)
export const FILMS: ReadonlyArray<FilmItem> = [
  createFilm("01-unveil", "Unveil", "2026-02-23", "zCXXsKi0ucI", 8),
  createFilm("02-set-it-off", "Set It Off", "2026-02-23", "ZYsdtTsAw3o", 8),
  createFilm("03-not4nerd", "Not4Nerd", "2026-02-23", "MLWohM_5e6Q", 8),
  createFilm("04-ewha", "Ewha", "2026-02-23", "o3hzeGvh9NQ", 6),
  createFilm("05-all-at-once", "All At Once", "2026-02-23", "eilzomDSK5w", 0),
  createFilm("06-never-forget", "Never Forget", "2026-02-23", "KpYlOKPSSJ4", 8),
  createFilm("07-shanghai", "Shanghai", "2026-02-23", "cVQu7kwtWGE", 8),
  createFilm("08-about", "About", "2026-02-23", "uif5b0nd8QE", 6),
] as const;
