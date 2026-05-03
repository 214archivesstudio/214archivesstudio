"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T = void> =
  | { readonly ok: true; readonly data?: T }
  | { readonly ok: false; readonly error: string };

/**
 * Delete a post (cascades to post_media via FK on delete cascade).
 *
 * Authorization (RLS):
 *  - admin: can delete any post
 *  - editor: can delete only their own draft posts (not published)
 */
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

  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        error: "이 게시물을 삭제할 권한이 없습니다.",
      };
    }
    return { ok: false, error: `삭제에 실패했습니다: ${error.message}` };
  }

  if (count === 0) {
    return {
      ok: false,
      error: "게시물을 찾을 수 없거나 삭제 권한이 없습니다.",
    };
  }

  revalidatePath("/admin/posts");
  return { ok: true };
}
