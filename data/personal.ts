import type { PersonalWorkItem } from "@/types";

export const PERSONAL_WORKS: ReadonlyArray<PersonalWorkItem> = [
  {
    id: "pony-project",
    title: "PONY Project",
    thumbnail: {
      publicId: "214archives/personal/pony-project/thumbnail",
      alt: "PONY Project",
      width: 1200,
      height: 800,
    },
    media: [
      {
        publicId: "214archives/personal/pony-project/photo-1",
        alt: "PONY Project photo 1",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-2",
        alt: "PONY Project photo 2",
        width: 1920,
        height: 1280,
      },
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
    thumbnail: {
      publicId: "214archives/personal/about-me/thumbnail",
      alt: "About Me Project",
      width: 1200,
      height: 800,
    },
    media: [
      {
        publicId: "214archives/personal/about-me/photo-1",
        alt: "About Me photo 1",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/about-me/photo-2",
        alt: "About Me photo 2",
        width: 1920,
        height: 1280,
      },
    ],
    description: "A self-portrait and introspective series.",
  },
] as const;
