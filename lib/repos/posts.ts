import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PostMediaRow, PostRow, PostSection } from "@/types/database";

export interface PostsListFilter {
  readonly section?: PostSection;
  readonly search?: string;
  readonly publishedOnly?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface PostsListResult {
  readonly posts: ReadonlyArray<PostRow>;
  readonly total: number;
}

const DEFAULT_LIMIT = 20;

export async function listPosts(filter: PostsListFilter = {}): Promise<PostsListResult> {
  const supabase = await createClient();
  const limit = filter.limit ?? DEFAULT_LIMIT;
  const offset = filter.offset ?? 0;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter.section) {
    query = query.eq("section", filter.section);
  }
  if (filter.publishedOnly) {
    query = query.eq("published", true);
  }
  if (filter.search) {
    // PostgREST or-필터 문법 문자(쉼표·괄호·점)와 ilike 와일드카드(% _ * \)를 제거한다.
    // 그대로 보간하면 "TOKYO, 2025" 같은 검색어가 400 을 낸다.
    const term = filter.search.replace(/[,().*\\%_]/g, "").trim();
    if (term.length > 0) {
      query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`listPosts failed: ${error.message}`);
  }

  return {
    posts: (data ?? []) as ReadonlyArray<PostRow>,
    total: count ?? 0,
  };
}

export async function findPostById(id: string): Promise<PostRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`findPostById failed: ${error.message}`);
  }
  return (data as PostRow | null) ?? null;
}

export async function findPostMedia(
  postId: string,
): Promise<ReadonlyArray<PostMediaRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_media")
    .select("*")
    .eq("post_id", postId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`findPostMedia failed: ${error.message}`);
  }
  return (data ?? []) as ReadonlyArray<PostMediaRow>;
}

export async function countPostsBySection(): Promise<Record<PostSection, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("section");

  if (error) {
    throw new Error(`countPostsBySection failed: ${error.message}`);
  }

  const counts: Record<PostSection, number> = {
    showreel: 0,
    archives: 0,
    film: 0,
    photography: 0,
    personal: 0,
  };

  for (const row of (data ?? []) as ReadonlyArray<{ section: PostSection }>) {
    counts[row.section] += 1;
  }
  return counts;
}
