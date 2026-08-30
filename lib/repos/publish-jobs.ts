import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PublishJobRow } from "@/types/database";

/**
 * Most recent publish jobs, newest first. Used for the dashboard audit table.
 * `triggered_by` stays a UUID — enrichment to email needs the auth admin API,
 * and the dashboard doesn't show the column (1–2 operator setup).
 */
export async function listRecentPublishJobs(
  limit = 10,
): Promise<ReadonlyArray<PublishJobRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listRecentPublishJobs failed: ${error.message}`);
  }

  return (data ?? []) as ReadonlyArray<PublishJobRow>;
}

/**
 * Start time (`created_at`) of the most recent successful publish, or null if
 * there has never been one. Used to compute drift.
 *
 * Why created_at, not completed_at: the workflow reads content in its Sync step
 * well before it marks the job complete. A post saved in that window would be
 * missing from the site yet invisible to drift if we compared against
 * completed_at. created_at ≤ sync time, so it errs on "show as unsynced".
 * Rows whose completed_at is null are ignored (never finalised).
 */
export async function getLastSuccessAt(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("created_at")
    .eq("status", "success")
    .not("completed_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getLastSuccessAt failed: ${error.message}`);
  return (data as { created_at: string } | null)?.created_at ?? null;
}

/**
 * Count of published posts updated since the last successful publish. This is
 * the "drift": how many content changes haven't been synced to the live site.
 */
export async function getDriftCount(): Promise<number> {
  const supabase = await createClient();
  const lastSuccess = await getLastSuccessAt();

  let query = supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  if (lastSuccess) {
    query = query.gt("updated_at", lastSuccess);
  }

  const { count, error } = await query;
  if (error) throw new Error(`getDriftCount failed: ${error.message}`);
  return count ?? 0;
}

export interface DriftItem {
  readonly id: string;
  readonly title: string;
  readonly section: string;
  readonly slug: string;
  readonly updated_at: string;
}

/**
 * Most-recently-modified published posts that have changed since the last
 * successful publish — i.e. the items contributing to drift. Used for the
 * dashboard publish panel to give operators a glanceable change list.
 */
export async function listDriftPosts(
  limit = 5,
): Promise<ReadonlyArray<DriftItem>> {
  const supabase = await createClient();
  const lastSuccess = await getLastSuccessAt();

  let query = supabase
    .from("posts")
    .select("id, title, section, slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (lastSuccess) {
    query = query.gt("updated_at", lastSuccess);
  }

  const { data, error } = await query;
  if (error) throw new Error(`listDriftPosts failed: ${error.message}`);
  return (data ?? []) as ReadonlyArray<DriftItem>;
}

/**
 * Whether any publish job is currently pending or running. Drives client polling.
 */
/**
 * The id of the most recent pending/running job, or null if none. Used to
 * seed client polling on initial page render.
 */
export async function findActiveJobId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("id")
    .in("status", ["pending", "running"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`findActiveJobId failed: ${error.message}`);
  return (data as { id: string } | null)?.id ?? null;
}

export async function getJob(jobId: string): Promise<PublishJobRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw new Error(`getJob failed: ${error.message}`);
  return (data as PublishJobRow | null) ?? null;
}
