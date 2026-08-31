// handoff/admin-screen-team.jsx (optional)
// /admin/team — member list.

const TeamScreen = () => (
  <div style={adminStyles.page}>
    <AdminHeader active="team" />
    <div style={adminStyles.pageBody}>
      <PageHead
        eyebrow="설정"
        title="팀"
        subtitle={`${ADMIN_TEAM.length}명의 멤버 · Supabase RLS로 권한 관리`}
        right={<Btn variant="primary" size="md">+ 팀원 초대</Btn>}
      />

      <div style={{
        border: "1px solid #2a2a2a", borderRadius: 2,
        overflow: "hidden",
      }}>
        {ADMIN_TEAM.map((m, i) => (
          <TeamRow key={i} member={m} first={i === 0} />
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <CardLabel>역할</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 8 }}>
          <RoleCard name="Owner"       desc="모든 권한. 팀원 초대, 결제, 도메인 관리까지." count={1} />
          <RoleCard name="Editor"      desc="포스트와 미디어를 생성·편집·게시할 수 있습니다." count={1} />
          <RoleCard name="Contributor" desc="포스트를 작성하고 검토 요청만 보낼 수 있습니다." count={1} />
        </div>
      </div>
    </div>
  </div>
);

const TeamRow = ({ member, first }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "60px 1fr 240px 140px 120px",
    alignItems: "center",
    gap: 20,
    padding: "20px 24px",
    borderTop: first ? "none" : "1px solid #2a2a2a",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 9999,
      backgroundColor: "#2a2a2a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, color: "#CCC", letterSpacing: "0.06em",
    }}>{member.name.split(" ").map((s) => s[0]).join("").slice(0,2)}</div>
    <div>
      <div style={{ fontSize: 15, color: "#FFF" }}>{member.name}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>{member.role}</div>
    </div>
    <div style={{ fontSize: 13, color: "#CCC" }}>{member.email}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#888" }}>
      <StatusDot status={member.lastSeen === "활성" ? "published" : "pending"} />
      {member.lastSeen}
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Btn variant="ghost" size="sm">관리</Btn>
    </div>
  </div>
);

const RoleCard = ({ name, desc, count }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
      <span style={{ fontSize: 14, color: "#FFF", letterSpacing: "0.1em" }}>{name}</span>
      <span style={{ fontSize: 11, color: "#666" }}>{count}명</span>
    </div>
    <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{desc}</div>
  </Card>
);

window.TeamScreen = TeamScreen;
