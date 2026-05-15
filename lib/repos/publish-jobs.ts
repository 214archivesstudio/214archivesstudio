import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PublishJobRow } from "@/types/database";

export interface PublishJobWithEmail extends PublishJobRow {
  readonly triggered_by_email: string | null;
}

/**
 * Most recent publish jobs, newest first. Used for the dashboard audit table.
 */
export async function listRecentPublishJobs(
  limit = 10,
): Promise<ReadonlyArray<PublishJobWithEmail>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listRecentPublishJobs failed: ${error.message}`);
  }

  const jobs = (data ?? []) as ReadonlyArray<PublishJobRow>;
  if (jobs.length === 0) return [];

  // Hydrate triggered_by → email via a separate lookup. auth.users isn't
  // queryable through PostgREST under default policies; we just expose the
  // email column when admin queries it via admin API. For now we surface the
  // UUID and leave email enrichment for a later phase if it becomes important.
  return jobs.map((j) => ({ ...j, triggered_by_email: null }));
}

/**
 * timestamp of the most recently completed (success) publish, or null if there
 * has never been one. Used to compute drift.
 */
export async function getLastSuccessAt(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publish_jobs")
    .select("completed_at")
    .eq("status", "success")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getLastSuccessAt failed: ${error.message}`);
  return (data as { completed_at: string | null } | null)?.completed_at ?? null;
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
