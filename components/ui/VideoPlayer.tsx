"use client";

import type { VideoPlayerProps } from "@/types";

const embedUrls = {
  youtube: (id: string) =>
    `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
  vimeo: (id: string) => `https://player.vimeo.com/video/${id}`,
} as const;

export default function VideoPlayer({
  video,
  autoPlay = false,
}: VideoPlayerProps) {
  const baseUrl = embedUrls[video.platform](video.videoId);
  const src = autoPlay ? `${baseUrl}&autoplay=1` : baseUrl;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-black">
      <iframe
        src={src}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
