import { requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  findActiveJobId,
  getDriftCount,
  listRecentPublishJobs,
} from "@/lib/repos/publish-jobs";
import { PublishPanel } from "./_components/publish-panel";

export default async function AdminDashboard() {
  const user = await requireAuthenticatedAdmin();
  const supabase = await createClient();

  const [
    { count: totalPosts },
    { count: publishedPosts },
    drift,
    jobs,
    activeJobId,
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    getDriftCount(),
    listRecentPublishJobs(10),
    findActiveJobId(),
  ]);

  const drafts = (totalPosts ?? 0) - (publishedPosts ?? 0);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">환영합니다, {user.email}</h1>
        <p className="text-sm text-muted">
          역할: <span className="text-foreground">{user.role}</span>
        </p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <Stat label="전체 게시물" value={totalPosts ?? 0} />
        <Stat label="공개됨" value={publishedPosts ?? 0} />
        <Stat label="Draft" value={drafts} />
      </section>

      <PublishPanel
        canPublish={user.role === "admin"}
        drift={drift}
        initialJobs={jobs}
        initialActiveJobId={activeJobId}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#CCCCCC]/15 rounded p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
