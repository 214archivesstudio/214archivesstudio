// handoff/admin-screen-dashboard.jsx
// /admin — stats row, publish panel, jobs table.

const DashboardScreen = () => {
  return (
    <div style={adminStyles.page}>
      <AdminHeader active="dashboard" />
      <div style={adminStyles.pageBody}>
        <PageHead
          eyebrow="ADMIN"
          title="대시보드"
          subtitle="공개 사이트의 상태와 최근 활동을 한눈에 확인합니다"
          right={
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="ghost" size="md">동기화 다시 실행</Btn>
              <Btn variant="primary" size="md">변경사항 게시 ›</Btn>
            </div>
          }
        />

        {/* Stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
          marginBottom: 32,
        }}>
          {ADMIN_STATS.map((s, i) => (
            <Card key={i}>
              <CardLabel>{s.label}</CardLabel>
              <div style={{
                fontSize: 36, fontWeight: 300, letterSpacing: "0.04em", color: "#FFF",
                lineHeight: 1.1,
              }}>{s.value}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#888" }}>{s.note}</div>
            </Card>
          ))}
        </div>

        {/* Two-column: Publish panel + Recent jobs */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 16,
        }}>
          <PublishPanel />
          <JobsTable />
        </div>
      </div>
    </div>
  );
};

const PublishPanel = () => (
  <Card style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <CardLabel>게시 패널</CardLabel>

    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Pill tone="warn">DRIFT · 3</Pill>
        <span style={{ fontSize: 11, color: "#888" }}>스테이지 → 프로덕션</span>
      </div>
      <p style={{
        margin: 0, fontSize: 13, color: "#CCC", lineHeight: 1.6,
      }}>
        Supabase에 저장된 3건의 변경사항이 아직 사이트에 반영되지 않았습니다.
        게시를 누르면 Vercel 빌드가 시작됩니다.
      </p>
    </div>

    {/* Drift items */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { type: "포스트 추가", target: "Archives · ICELAND '25", time: "방금" },
        { type: "미디어 정렬", target: "lookbook-cau-fashion",   time: "1시간 전" },
        { type: "메타데이터",  target: "Film · Spring Editorial", time: "3시간 전" },
      ].map((d, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", gap: 12,
          padding: "10px 12px", borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid #2a2a2a",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {d.type}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: "#FFF" }}>{d.target}</div>
          </div>
          <div style={{ fontSize: 11, color: "#666", flexShrink: 0, whiteSpace: "nowrap" }}>{d.time}</div>
        </div>
      ))}
    </div>

    <div style={{
      paddingTop: 16, marginTop: 4,
      borderTop: "1px solid #2a2a2a",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
        <span>마지막 게시</span>
        <span style={{ color: "#CCC" }}>2시간 전 · Yejin</span>
      </div>
      <Btn variant="primary" size="lg">변경사항 게시</Btn>
    </div>
  </Card>
);

const JobsTable = () => (
  <Card style={{ padding: 0 }}>
    <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <CardLabel>최근 활동</CardLabel>
      <a style={{ fontSize: 11, color: "#888", letterSpacing: "0.05em" }}>모두 보기 ›</a>
    </div>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{
          textAlign: "left", fontSize: 11, color: "#666",
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          <th style={th}>시간</th>
          <th style={th}>유형</th>
          <th style={th}>대상</th>
          <th style={{ ...th, textAlign: "right" }}>상태</th>
        </tr>
      </thead>
      <tbody>
        {ADMIN_JOBS.map((j) => (
          <tr key={j.id} style={{ borderTop: "1px solid #2a2a2a" }}>
            <td style={{ ...td, color: "#888", fontSize: 12 }}>{j.time}</td>
            <td style={td}>
              <Pill tone={j.type === "delete" ? "danger" : "default"}>
                {j.type.toUpperCase()}
              </Pill>
            </td>
            <td style={{ ...td, fontSize: 13, color: "#CCC" }}>{j.target}</td>
            <td style={{ ...td, textAlign: "right" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "#CCC" }}>
                <StatusDot status={j.status} />
                {j.status === "success" ? "완료" : j.status === "pending" ? "처리중" : "실패"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const th = { padding: "10px 24px", fontWeight: 400 };
const td = { padding: "16px 24px", verticalAlign: "middle" };

window.DashboardScreen = DashboardScreen;
