"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticatedAdmin, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formDataToObject,
  parseVideoUrl,
  postSchema,
  type PostInput,
} from "@/lib/validation/post-schema";
import type { PostSection } from "@/types/database";

export type FieldErrors = Partial<Record<string, string>>;

export type ActionResult<T = void> =
  | { readonly ok: true; readonly data?: T }
  | {
      readonly ok: false;
      readonly error?: string;
      readonly fieldErrors?: FieldErrors;
    };

type FailResult = {
  readonly ok: false;
  readonly error?: string;
  readonly fieldErrors?: FieldErrors;
};

/**
 * Map a Postgres error from PostgREST to a user-friendly fail result.
 * Common cases:
 *  - 23505: unique violation (slug conflict)
 *  - 42501: insufficient privilege (RLS / trigger guard)
 */
function mapPostgresError(error: { code?: string; message: string }): FailResult {
  if (error.code === "23505") {
    return {
      ok: false,
      fieldErrors: { slug: "이미 사용 중인 슬러그입니다" },
    };
  }
  if (error.code === "42501") {
    return {
      ok: false,
      error: "이 작업을 수행할 권한이 없습니다",
    };
  }
  return { ok: false, error: error.message };
}

function buildPostRow(input: PostInput, createdBy: string | null) {
  const video = (() => {
    try {
      return parseVideoUrl(input.video_url);
    } catch (err) {
      throw new Error(`video_url:${(err as Error).message}`);
    }
  })();

  return {
    section: input.section,
    slug: input.slug,
    title: input.title,
    date: input.date,
    city: input.section === "archives" ? input.city : null,
    year_label: input.section === "archives" ? input.year_label : null,
    client: input.section === "photography" ? input.client : null,
    description: input.description,
    thumbnail_public_id: input.thumbnail_public_id,
    thumbnail_width: input.thumbnail_width,
    thumbnail_height: input.thumbnail_height,
    thumbnail_alt: input.thumbnail_alt,
    video_platform: video?.platform ?? null,
    video_id: video?.videoId ?? null,
    video_title: video ? input.title : null,
    video_thumbnail_url: input.video_thumbnail_url,
    display_order: input.display_order,
    created_by: createdBy,
  };
}

function parseFormData(formData: FormData): {
  ok: true;
  input: PostInput;
} | {
  ok: false;
  fieldErrors: FieldErrors;
} {
  const obj = formDataToObject(formData);
  const result = postSchema.safeParse(obj);
  if (!result.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  return { ok: true, input: result.data };
}

// ----------------------------------------------------------------------------
// createPost
// ----------------------------------------------------------------------------

export async function createPost(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuthenticatedAdmin();

  const parsed = parseFormData(formData);
  if (!parsed.ok) return parsed;

  let row;
  try {
    row = buildPostRow(parsed.input, user.id);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.startsWith("video_url:")) {
      return { ok: false, fieldErrors: { video_url: msg.slice("video_url:".length) } };
    }
    return { ok: false, error: msg };
  }

  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .insert(row)
    .select("id")
    .single();

  if (result.error) return mapPostgresError(result.error);

  const inserted = result.data as { id: string } | null;
  if (!inserted) return { ok: false, error: "생성된 게시물 ID를 받지 못했습니다" };

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${inserted.id}?created=1`);
}

// ----------------------------------------------------------------------------
// updatePost
// ----------------------------------------------------------------------------

export async function updatePost(
  postId: string,
  expectedUpdatedAt: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthenticatedAdmin();

  if (!postId) return { ok: false, error: "잘못된 요청입니다" };

  const parsed = parseFormData(formData);
  if (!parsed.ok) return parsed;

  let row;
  try {
    row = buildPostRow(parsed.input, null);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.startsWith("video_url:")) {
      return { ok: false, fieldErrors: { video_url: msg.slice("video_url:".length) } };
    }
    return { ok: false, error: msg };
  }

  // Don't overwrite created_by on update.
  const { created_by, ...updatePayload } = row;
  void created_by;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .update(updatePayload, { count: "exact" })
    .eq("id", postId)
    .eq("updated_at", expectedUpdatedAt);

  if (error) return mapPostgresError(error);

  if (count === 0) {
    return {
      ok: false,
      error:
        "다른 사용자가 이 게시물을 수정했거나 삭제했습니다. 새로고침 후 다시 시도하세요.",
    };
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// togglePublished (admin only)
// ----------------------------------------------------------------------------

/**
 * Live slug availability for the form (debounced client-side). Advisory only —
 * the (section, slug) unique constraint remains the final gate on write.
 */
export async function checkSlugAvailable(
  section: PostSection,
  slug: string,
  excludeId?: string,
): Promise<ActionResult<{ available: boolean }>> {
  await requireAuthenticatedAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id")
    .eq("section", section)
    .eq("slug", slug)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { available: data === null } };
}

export async function togglePublished(
  postId: string,
  next: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  if (!postId) return { ok: false, error: "잘못된 요청입니다" };

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .update({ published: next }, { count: "exact" })
    .eq("id", postId);

  if (error) return mapPostgresError(error);
  if (count === 0) return { ok: false, error: "게시물을 찾을 수 없습니다" };

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// deletePost
// ----------------------------------------------------------------------------

export async function deletePost(postId: string): Promise<ActionResult> {
  await requireAuthenticatedAdmin();

  if (!postId || typeof postId !== "string") {
    return { ok: false, error: "잘못된 요청입니다." };
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("posts")
    .delete({ count: "exact" })
    .eq("id", postId);

  if (error) return mapPostgresError(error);

  if (count === 0) {
    return {
      ok: false,
      error: "게시물을 찾을 수 없거나 삭제 권한이 없습니다.",
    };
  }

  revalidatePath("/admin/posts");
  return { ok: true };
}
