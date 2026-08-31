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

// 생성 폼의 대기 갤러리 항목. 업로드는 이미 Cloudinary 에 끝났고,
// 게시물 insert 와 함께 post_media 로 저장된다. 수정 폼은 보내지 않는다.
const stagedImageSchema = z.object({
  type: z.literal("image"),
  public_id: z.string().min(1).max(300),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z
    .string()
    .trim()
    .max(300)
    .nullish()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

const stagedVideoSchema = z.object({
  type: z.literal("video"),
  video_platform: z.enum(["youtube", "vimeo"]),
  video_id: z.string().min(1).max(100),
});

const stagedMediaItemSchema = z.discriminatedUnion("type", [
  stagedImageSchema,
  stagedVideoSchema,
]);

export type StagedMediaItem = z.infer<typeof stagedMediaItemSchema>;

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
  // hidden input 으로 JSON 문자열이 온다. 비어있거나 없으면 [].
  staged_media: z.preprocess(
    (v) => {
      if (typeof v !== "string" || v.trim().length === 0) return [];
      try {
        return JSON.parse(v) as unknown;
      } catch {
        return v; // 배열 파싱 실패로 이어져 검증 에러가 된다
      }
    },
    z.array(stagedMediaItemSchema).max(100, "갤러리 항목이 너무 많습니다"),
  ).default([]),
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
