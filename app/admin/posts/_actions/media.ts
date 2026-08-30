"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseVideoUrl } from "@/lib/validation/post-schema";
import type { PostMediaRow } from "@/types/database";

import type { ActionResult, FieldErrors } from "./posts";

type FailResult = {
  readonly ok: false;
  readonly error?: string;
  readonly fieldErrors?: FieldErrors;
};

function mapPostgresError(error: { code?: string; message: string }): FailResult {
  if (error.code === "42501") {
    return { ok: false, error: "이 작업을 수행할 권한이 없습니다" };
  }
  return { ok: false, error: error.message };
}

function revalidatePost(postId: string): void {
  revalidatePath(`/admin/posts/${postId}`);
}

export interface AddImageInput {
  readonly publicId: string;
  readonly width: number;
  readonly height: number;
  readonly alt?: string | null;
  /** 같은 배치 안의 완료 순번 (0부터). 병렬 업로드 시 display_order 충돌 방지. */
  readonly index?: number;
}

// ----------------------------------------------------------------------------
// addImageMedia
// ----------------------------------------------------------------------------

export async function addImageMedia(
  postId: string,
  input: AddImageInput,
): Promise<ActionResult<{ media: PostMediaRow }>> {
  await requireAuthenticatedAdmin();

  if (!postId) return { ok: false, error: "잘못된 요청입니다" };
  if (!input.publicId) return { ok: false, error: "publicId 가 비어있습니다" };

  const supabase = await createClient();

  const { data: maxRow, error: maxErr } = await supabase
    .from("post_media")
    .select("display_order")
    .eq("post_id", postId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxErr) return mapPostgresError(maxErr);

  // 병렬 호출이 같은 max 를 읽어도 index 가 다르면 순서가 보존된다 (plan H3 결정 #7).
  const nextOrder =
    ((maxRow as { display_order: number } | null)?.display_order ?? -1) +
    1 +
    (input.index ?? 0);

  const row = {
    post_id: postId,
    type: "image" as const,
    public_id: input.publicId,
    width: input.width,
    height: input.height,
    alt: input.alt ?? null,
    display_order: nextOrder,
  };

  const { data, error } = await supabase
    .from("post_media")
    .insert(row)
    .select("*")
    .single();

  if (error) return mapPostgresError(error);
  if (!data) return { ok: false, error: "추가된 미디어를 받지 못했습니다" };

  revalidatePost(postId);
  return { ok: true, data: { media: data as PostMediaRow } };
}

// ----------------------------------------------------------------------------
// addVideoMedia (personal section only)
// ----------------------------------------------------------------------------

export async function addVideoMedia(
  postId: string,
  url: string,
): Promise<ActionResult<{ media: PostMediaRow }>> {
  await requireAuthenticatedAdmin();

  if (!postId) return { ok: false, error: "잘못된 요청입니다" };

  let video: { platform: "youtube" | "vimeo"; videoId: string } | null;
  try {
    video = parseVideoUrl(url);
  } catch (err) {
    return { ok: false, fieldErrors: { url: (err as Error).message } };
  }
  if (!video) return { ok: false, fieldErrors: { url: "영상 URL이 비어있습니다" } };

  const supabase = await createClient();

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select("section")
    .eq("id", postId)
    .maybeSingle();
  if (postErr) return mapPostgresError(postErr);
  if (!post) return { ok: false, error: "게시물을 찾을 수 없습니다" };
  if ((post as { section: string }).section !== "personal") {
    return {
      ok: false,
      error: "영상 미디어는 personal 섹션 게시물에만 추가할 수 있습니다",
    };
  }

  const { data: maxRow, error: maxErr } = await supabase
    .from("post_media")
    .select("display_order")
    .eq("post_id", postId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxErr) return mapPostgresError(maxErr);

  const nextOrder =
    ((maxRow as { display_order: number } | null)?.display_order ?? -1) + 1;

  const row = {
    post_id: postId,
    type: "video" as const,
    video_platform: video.platform,
    video_id: video.videoId,
    video_title: null,
    display_order: nextOrder,
  };

  const { data, error } = await supabase
    .from("post_media")
    .insert(row)
    .select("*")
    .single();

  if (error) return mapPostgresError(error);
  if (!data) return { ok: false, error: "추가된 미디어를 받지 못했습니다" };

  revalidatePost(postId);
  return { ok: true, data: { media: data as PostMediaRow } };
}

// ----------------------------------------------------------------------------
// updateMediaAlt
// ----------------------------------------------------------------------------

export async function updateMediaAlt(
  mediaId: string,
  alt: string | null,
): Promise<ActionResult> {
  await requireAuthenticatedAdmin();
  if (!mediaId) return { ok: false, error: "잘못된 요청입니다" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_media")
    .update({ alt: alt && alt.trim().length > 0 ? alt.trim() : null })
    .eq("id", mediaId)
    .select("post_id")
    .maybeSingle();

  if (error) return mapPostgresError(error);
  if (!data) return { ok: false, error: "미디어를 찾을 수 없습니다" };

  revalidatePost((data as { post_id: string }).post_id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// deleteMedia
// ----------------------------------------------------------------------------

export async function deleteMedia(mediaId: string): Promise<ActionResult> {
  await requireAuthenticatedAdmin();
  if (!mediaId) return { ok: false, error: "잘못된 요청입니다" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_media")
    .delete()
    .eq("id", mediaId)
    .select("post_id")
    .maybeSingle();

  if (error) return mapPostgresError(error);
  if (!data) {
    return { ok: false, error: "미디어를 찾을 수 없거나 삭제 권한이 없습니다" };
  }

  revalidatePost((data as { post_id: string }).post_id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// reorderMedia
// ----------------------------------------------------------------------------

export async function reorderMedia(
  postId: string,
  orderedIds: ReadonlyArray<string>,
): Promise<ActionResult> {
  await requireAuthenticatedAdmin();
  if (!postId) return { ok: false, error: "잘못된 요청입니다" };
  if (orderedIds.length === 0) return { ok: true };

  const supabase = await createClient();

  // Parallelized per-row updates. Each enforces both id and post_id to prevent
  // accidentally retargeting media of another post; RLS adds a second line of
  // defense. Failure of any one is reported so the UI can revert optimistically.
  const updates = orderedIds.map((id, idx) =>
    supabase
      .from("post_media")
      .update({ display_order: idx })
      .eq("id", id)
      .eq("post_id", postId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return mapPostgresError(failed.error);

  revalidatePost(postId);
  return { ok: true };
}
