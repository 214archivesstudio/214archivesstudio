import { z } from "zod";

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
  .nullish()
  .transform((v) => v ?? null);

const baseFields = {
  slug: z
    .string()
    .trim()
    .min(1, "URL 주소는 필수입니다")
    .max(80, "URL 주소는 80자 이내여야 합니다")
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
  // film 전용. 어드민 업로더가 만드는 Cloudinary mp4 URL 형식만 허용 (오타 URL 이 사이트로 새는 것 방지)
  video_thumbnail_url: optionalString.refine(
    (v) => v === null || /^https:\/\/\S+\.mp4(\?\S*)?$/i.test(v),
    "https:// 로 시작하는 .mp4 URL 이어야 합니다",
  ),
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

// showreel/film/personal 은 city·year_label·client 를 쓰지 않는다 — 스키마에서도
// 받지 않아야 "받았지만 저장 시 버려지는" 필드가 생기지 않는다 (H5-4).
const showreelSchema = z.object({
  section: z.literal("showreel"),
  ...baseFields,
});

const filmSchema = z.object({
  section: z.literal("film"),
  ...baseFields,
});

const personalSchema = z.object({
  section: z.literal("personal"),
  ...baseFields,
});

export const postSchema = z.discriminatedUnion("section", [
  archivesSchema,
  photographySchema,
  showreelSchema,
  filmSchema,
  personalSchema,
]);

export type PostInput = z.infer<typeof postSchema>;

export { parseVideoUrl } from "@/lib/video";

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
