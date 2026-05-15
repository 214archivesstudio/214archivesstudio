import { z } from "zod";
import type { VideoPlatform } from "@/types/database";

/**
 * Validation schema for posts. Section-discriminated.
 *
 * FormData inputs arrive as strings; we use z.coerce / preprocess where needed.
 * Server actions parse the FormData with these schemas before any DB write.
 */

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? null : v))
  .nullable();

const baseFields = {
  slug: z
    .string()
    .trim()
    .min(1, "슬러그는 필수입니다")
    .max(80, "슬러그는 80자 이내여야 합니다")
    .regex(slugRegex, "소문자/숫자/하이픈만 사용 가능합니다 (예: 25-tokyo)"),
  title: z.string().trim().min(1, "제목은 필수입니다").max(160),
  date: z
    .string()
    .trim()
    .regex(dateRegex, "YYYY-MM-DD 형식이어야 합니다"),
  description: optionalString,
  thumbnail_public_id: z
    .string()
    .min(1, "썸네일을 업로드하세요"),
  thumbnail_width: z.coerce
    .number()
    .int()
    .positive("썸네일 너비가 잘못됐습니다"),
  thumbnail_height: z.coerce
    .number()
    .int()
    .positive("썸네일 높이가 잘못됐습니다"),
  thumbnail_alt: optionalString,
  video_url: optionalString,
  video_thumbnail_url: optionalString,
  display_order: z.coerce.number().int().nonnegative().default(0),
};

const archivesSchema = z.object({
  section: z.literal("archives"),
  ...baseFields,
  city: z.string().trim().min(1, "도시는 필수입니다").max(80),
  year_label: z.string().trim().min(1, "연도 라벨은 필수입니다").max(20),
  client: optionalString,
});

const photographySchema = z.object({
  section: z.literal("photography"),
  ...baseFields,
  client: z.string().trim().min(1, "클라이언트는 필수입니다").max(120),
  city: optionalString,
  year_label: optionalString,
});

const showreelSchema = z.object({
  section: z.literal("showreel"),
  ...baseFields,
  city: optionalString,
  year_label: optionalString,
  client: optionalString,
});

const filmSchema = z.object({
  section: z.literal("film"),
  ...baseFields,
  client: optionalString,
  city: optionalString,
  year_label: optionalString,
});

const personalSchema = z.object({
  section: z.literal("personal"),
  ...baseFields,
  client: optionalString,
  city: optionalString,
  year_label: optionalString,
});

export const postSchema = z.discriminatedUnion("section", [
  archivesSchema,
  photographySchema,
  showreelSchema,
  filmSchema,
  personalSchema,
]);

export type PostInput = z.infer<typeof postSchema>;

/**
 * Parse a YouTube/Vimeo URL into platform + id.
 * Returns null for empty input, throws meaningful error for non-empty unsupported URLs.
 */
export function parseVideoUrl(
  url: string | null,
): { platform: VideoPlatform; videoId: string } | null {
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

/**
 * Convert an arbitrary FormData into a plain object suitable for postSchema.parse.
 * Keys outside the schema are passed through unchanged; the schema decides what's valid.
 */
export function formDataToObject(data: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
