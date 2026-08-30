"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getJob } from "@/lib/repos/publish-jobs";
import type { PublishJobRow } from "@/types/database";

import type { ActionResult } from "../posts/_actions/posts";

const GITHUB_API = "https://api.github.com";
const EVENT_TYPE = "publish-content";

export async function triggerPublish(): Promise<ActionResult<{ jobId: string }>> {
  const user = await requireAdmin();

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_DISPATCH_REPO;
  if (!token || !repo) {
    return {
      ok: false,
      error:
        "GitHub Actions 트리거가 설정되지 않았습니다 (GITHUB_DISPATCH_TOKEN/REPO). docs/admin-setup.md 참고.",
    };
  }

  const supabase = await createClient();

  const { data: inserted, error: insertErr } = await supabase
    .from("publish_jobs")
    .insert({ status: "pending", triggered_by: user.id } as never)
    .select("id")
    .single();
  if (insertErr || !inserted) {
    return {
      ok: false,
      error: insertErr?.message ?? "publish_jobs 레코드 생성 실패",
    };
  }
  const jobId = (inserted as { id: string }).id;

  let dispatchOk = false;
  let dispatchErr: string | null = null;
  try {
    const response = await fetch(`${GITHUB_API}/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: EVENT_TYPE,
        client_payload: { job_id: jobId },
      }),
    });
    dispatchOk = response.ok;
    if (!response.ok) {
      const text = await response.text();
      dispatchErr = `${response.status} ${response.statusText}: ${text.slice(0, 200)}`;
    }
  } catch (err) {
    dispatchErr = (err as Error).message;
  }

  if (!dispatchOk) {
    await supabase
      .from("publish_jobs")
      .update({
        status: "failed",
        error: dispatchErr ?? "dispatch unknown error",
        completed_at: new Date().toISOString(),
      } as never)
      .eq("id", jobId);
    return {
      ok: false,
      error: `GitHub Actions 트리거 실패: ${dispatchErr ?? "unknown"}`,
    };
  }

  revalidatePath("/admin");
  return { ok: true, data: { jobId } };
}

export async function getJobStatus(
  jobId: string,
): Promise<ActionResult<PublishJobRow>> {
  await requireAuthenticatedAdmin();
  if (!jobId) return { ok: false, error: "jobId 필요" };

  const job = await getJob(jobId);
  if (!job) return { ok: false, error: "publish_job을 찾을 수 없습니다" };
  return { ok: true, data: job };
}

/**
 * Client-side polling gives up after PUBLISH_TIMEOUT_MS. Persist that as a
 * failed job so a stuck pending/running row can't re-seed polling on the next
 * page load and keep the publish button disabled forever. No-op if the
 * workflow already finalised the row.
 */
export async function markJobTimedOut(
  jobId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();
  if (!jobId) return { ok: false, error: "jobId 필요" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("publish_jobs")
    .update({
      status: "failed",
      error: "타임아웃: 10분 안에 완료되지 않았습니다",
      completed_at: new Date().toISOString(),
    } as never)
    .eq("id", jobId)
    .in("status", ["pending", "running"]);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true, data: null };
}
