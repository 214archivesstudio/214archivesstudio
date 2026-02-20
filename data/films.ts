import type { FilmItem } from "@/types";

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
  videoId: string,
  photoCount: number
): FilmItem => ({
  id,
  title,
  thumbnail: {
    publicId: `214archives/film/${id}/thumbnail`,
    alt: title,
    width: 1200,
    height: 800,
  },
  video: {
    platform: "youtube",
    videoId,
    title,
  },
  photos: createFilmPhotos(id, photoCount),
});

export const FILMS: ReadonlyArray<FilmItem> = [
  createFilm("01-unveil", "Unveil", "zCXXsKi0ucI", 8),
  createFilm("02-set-it-off", "Set It Off", "ZYsdtTsAw3o", 8),
  createFilm("03-not4nerd", "Not4Nerd", "MLWohM_5e6Q", 8),
  createFilm("04-ewha", "Ewha", "o3hzeGvh9NQ", 6),
  createFilm("05-all-at-once", "All At Once", "eilzomDSK5w", 0),
  createFilm("06-never-forget", "Never Forget", "KpYlOKPSSJ4", 8),
  createFilm("07-shanghai", "Shanghai", "cVQu7kwtWGE", 8),
  createFilm("08-about", "About", "uif5b0nd8QE", 6),
] as const;
