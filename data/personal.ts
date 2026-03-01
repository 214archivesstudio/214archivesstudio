import type { PersonalWorkItem } from "@/types";

const createPhoto = (folder: string, index: number, title: string) => ({
  publicId: `214archives/personal/${folder}/photo-${String(index).padStart(2, "0")}`,
  alt: `${title} photo ${index}`,
  width: 1920,
  height: 1280,
});

// Sorted by date descending (newest first)
export const PERSONAL_WORKS: ReadonlyArray<PersonalWorkItem> = [
  {
    id: "pony-project",
    title: "PONY Project",
    date: "2026-02-23",
    thumbnail: {
      publicId: "214archives/personal/pony-project/thumbnail",
      alt: "PONY Project",
      width: 1200,
      height: 800,
    },
    media: [
      ...Array.from({ length: 7 }, (_, i) =>
        createPhoto("pony-project", i + 1, "PONY Project"),
      ),
      {
        platform: "youtube" as const,
        videoId: "placeholder",
        title: "PONY Project Video",
      },
    ],
    description: "A personal creative exploration.",
  },
  {
    id: "about-me",
    title: "About Me Project",
    date: "2026-02-23",
    thumbnail: {
      publicId: "214archives/personal/about-me/thumbnail",
      alt: "About Me Project",
      width: 1200,
      height: 800,
    },
    media: [createPhoto("about-me", 1, "About Me")],
    description: "A self-portrait and introspective series.",
  },
] as const;
