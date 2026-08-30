import type { VideoPlatform } from "@/types/database";

export interface ParsedVideo {
  readonly platform: VideoPlatform;
  readonly videoId: string;
}

/**
 * Parse a YouTube/Vimeo URL into platform + id.
 * Returns null for empty input, throws meaningful error for non-empty unsupported URLs.
 * Client-safe (no zod) so the admin form can preview while typing.
 */
export function parseVideoUrl(url: string | null): ParsedVideo | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  const youtube = trimmed.match(
    /youtu\.be\/([\w-]+)|youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]+)/,
  );
  if (youtube) {
    const id = youtube[1] ?? youtube[2];
    if (id) return { platform: "youtube", videoId: id };
  }
  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo && vimeo[1]) return { platform: "vimeo", videoId: vimeo[1] };

  throw new Error("유효한 YouTube 또는 Vimeo URL이 아닙니다");
}

/** Same as parseVideoUrl but never throws — for live previews. */
export function tryParseVideoUrl(url: string | null): ParsedVideo | null {
  try {
    return parseVideoUrl(url);
  } catch {
    return null;
  }
}

/** Static YouTube thumbnail — no API key needed. Vimeo has no equivalent without oembed. */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
