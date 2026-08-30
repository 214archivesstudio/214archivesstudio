import { notFound } from "next/navigation";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { listTeamMembers, type TeamMember } from "@/lib/repos/user-roles";
import { Card, CardLabel } from "../_components/ui/Card";
import { PageHead } from "../_components/ui/PageHead";
import { Pill } from "../_components/ui/Pill";
import { StatusDot } from "../_components/ui/StatusDot";

const ROLE_LABEL: Record<TeamMember["role"], string> = {
  admin: "Admin",
  editor: "Editor",
};

const ROLE_DESCRIPTION: Record<TeamMember["role"], string> = {
  admin:
    "모든 권한. 포스트·미디어 편집, 공개 토글, 사이트 게시, 팀 관리까지 가능합니다.",
  editor:
    "포스트와 미디어를 생성·편집할 수 있습니다. 공개 토글과 게시는 admin 만 수행합니다.",
};

function initials(value: string): string {
  const parts = value.split(/[\s@.-]+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function shortId(id: string): string {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export default async function TeamPage() {
  const user = await requireAuthenticatedAdmin();
  // Team page is admin-only — editors get a 404 rather than a partial view.
  if (user.role !== "admin") notFound();

  const members = await listTeamMembers();
  const byRole = members.reduce<Record<TeamMember["role"], number>>(
    (acc, m) => {
      acc[m.role] += 1;
      return acc;
    },
    { admin: 0, editor: 0 },
  );

  return (
    <>
      <PageHead
        eyebrow="설정"
        title="팀"
        subtitle={`${members.length}명의 멤버 · 역할별 권한`}
      />

      <div className="overflow-hidden rounded-[2px] border border-[#2a2a2a]">
        {members.map((m, i) => {
          const isMe = m.user_id === user.id;
          const display = isMe ? user.email ?? user.id : shortId(m.user_id);
          return (
            <div
              key={m.user_id}
              className="grid grid-cols-[60px_1fr_240px_140px_120px] items-center gap-5 px-6 py-5"
              style={{ borderTop: i === 0 ? "none" : "1px solid #2a2a2a" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] text-[13px] tracking-[0.06em] text-accent">
                {initials(display)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] text-foreground">
                  {display}
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {isMe ? "본인" : "팀원"}
                </div>
              </div>
              <div className="font-mono text-[12px] text-accent">
                <Pill tone={m.role === "admin" ? "accent" : "default"}>
                  {ROLE_LABEL[m.role]}
                </Pill>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <StatusDot
                  status={isMe ? "published" : "draft"}
                  label={isMe ? "현재 세션" : "오프라인"}
                />
              </div>
              <div className="text-right text-[11px] tabular-nums text-[#666]">
                {new Date(m.created_at).toLocaleDateString("ko-KR")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <CardLabel>역할</CardLabel>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(Object.keys(ROLE_LABEL) as ReadonlyArray<TeamMember["role"]>).map(
            (role) => (
              <Card key={role}>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[14px] tracking-[0.1em] text-foreground">
                    {ROLE_LABEL[role]}
                  </span>
                  <span className="text-[11px] text-[#666]">
                    {byRole[role]}명
                  </span>
                </div>
                <div className="text-[12px] leading-relaxed text-muted">
                  {ROLE_DESCRIPTION[role]}
                </div>
              </Card>
            ),
          )}
        </div>
      </div>

      <p className="mt-8 text-[11px] tracking-[0.05em] text-muted">
        새 멤버 초대는 Supabase Studio → Authentication → Users 에서 이메일 초대를 보낸 뒤, 동일 user_id 로 user_roles 테이블에 행을 추가합니다.
      </p>
    </>
  );
}
