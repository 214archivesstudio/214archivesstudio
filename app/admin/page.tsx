import { requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  findActiveJobId,
  getDriftCount,
  getLastSuccessAt,
  listDriftPosts,
  listRecentPublishJobs,
} from "@/lib/repos/publish-jobs";
import { Card, CardLabel } from "./_components/ui/Card";
import { PageHead } from "./_components/ui/PageHead";
import { PublishPanel } from "./_components/publish-panel";
import { JobsCard } from "./_components/jobs-card";

export default async function AdminDashboard() {
  const user = await requireAuthenticatedAdmin();
  const supabase = await createClient();

  const [
    { count: totalPosts },
    { count: publishedPosts },
    drift,
    driftItems,
    lastSuccessAt,
    jobs,
    activeJobId,
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    getDriftCount(),
    listDriftPosts(5),
    getLastSuccessAt(),
    listRecentPublishJobs(10),
    findActiveJobId(),
  ]);

  const drafts = (totalPosts ?? 0) - (publishedPosts ?? 0);

  return (
    <>
      <PageHead
        eyebrow="ADMIN"
        title="대시보드"
        subtitle="공개 사이트의 상태와 최근 활동을 한눈에 확인합니다"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="전체 포스트" value={totalPosts ?? 0} note="모든 섹션 합산" />
        <Stat label="공개됨" value={publishedPosts ?? 0} note="사이트에 노출 중" />
        <Stat label="초안" value={drafts} note="비공개 항목" />
        <Stat
          label="미반영 변경"
          value={drift}
          note={drift === 0 ? "사이트와 동기화됨" : "다음 게시에 포함"}
          warn={drift > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <PublishPanel
          canPublish={user.role === "admin"}
          drift={drift}
          driftItems={driftItems}
          lastSuccessAt={lastSuccessAt}
          initialActiveJobId={activeJobId}
        />
        <JobsCard jobs={jobs} />
      </div>
    </>
  );
}

interface StatProps {
  readonly label: string;
  readonly value: number;
  readonly note: string;
  readonly warn?: boolean;
}

function Stat({ label, value, note, warn }: StatProps) {
  return (
    <Card>
      <CardLabel>{label}</CardLabel>
      <div
        className={
          warn
            ? "text-[36px] font-light leading-tight tracking-[0.04em] text-[#d6a877]"
            : "text-[36px] font-light leading-tight tracking-[0.04em] text-foreground"
        }
      >
        {value}
      </div>
      <div className="mt-2.5 text-[12px] text-muted">{note}</div>
    </Card>
  );
}
