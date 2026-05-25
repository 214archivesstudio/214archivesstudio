import type { PersonalWorkItem } from "@/types";

export const PERSONAL_WORKS: ReadonlyArray<PersonalWorkItem> = [
  {
    id: "pony-project",
    title: "PONY Project",
    date: "2024-05-10",
    thumbnail: {
      publicId: "214archives/personal/pony-project/thumbnail",
      alt: "PONY Project",
      width: 1200,
      height: 800,
    },
    media: [
      {
        publicId: "214archives/personal/pony-project/photo-01",
        alt: "PONY Project photo 1",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-02",
        alt: "PONY Project photo 2",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-03",
        alt: "PONY Project photo 3",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-04",
        alt: "PONY Project photo 4",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-05",
        alt: "PONY Project photo 5",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-06",
        alt: "PONY Project photo 6",
        width: 1920,
        height: 1280,
      },
      {
        publicId: "214archives/personal/pony-project/photo-07",
        alt: "PONY Project photo 7",
        width: 1920,
        height: 1280,
      },
    ],
    description: " (test-c7)",
  },
  {
    id: "about-me",
    title: "About Me Project",
    date: "2023-11-25",
    thumbnail: {
      publicId: "214archives/personal/about-me/thumbnail",
      alt: "About Me Project",
      width: 1200,
      height: 800,
    },
    media: [
      {
        publicId: "214archives/personal/about-me/photo-01",
        alt: "About Me photo 1",
        width: 1920,
        height: 1280,
      },
    ],
  },
] as const;
