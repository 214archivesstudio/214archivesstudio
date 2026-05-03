import { requireAuthenticatedAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const user = await requireAuthenticatedAdmin();
  const supabase = await createClient();

  const { count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: publishedPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  const drafts = (totalPosts ?? 0) - (publishedPosts ?? 0);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">환영합니다, {user.email}</h1>
        <p className="text-sm text-[#888888]">
          역할: <span className="text-foreground">{user.role}</span>
        </p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <Stat label="전체 게시물" value={totalPosts ?? 0} />
        <Stat label="공개됨" value={publishedPosts ?? 0} />
        <Stat label="Draft" value={drafts} />
      </section>

      <section className="border border-[#CCCCCC]/15 rounded p-4 text-sm text-[#CCCCCC] space-y-2">
        <h2 className="text-foreground font-semibold">다음 단계 (Phase 3 예정)</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>게시물 목록 / 상세 편집 (CRUD)</li>
          <li>Cloudinary Upload Widget 통합</li>
          <li>이미지 순서 drag-and-drop</li>
          <li>Publish 토글 + 빌드 트리거</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#CCCCCC]/15 rounded p-4">
      <div className="text-xs text-[#888888]">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
