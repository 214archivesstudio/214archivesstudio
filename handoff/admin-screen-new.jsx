// handoff/admin-screen-new.jsx
// /admin/posts/new — section picker first; once chosen, the section-specific form appears.

const NewPostScreen = () => (
  <div style={adminStyles.page}>
    <AdminHeader active="posts" />
    <div style={adminStyles.pageBody}>
      <PageHead
        eyebrow="포스트 / 새로 만들기"
        title="새 포스트"
        subtitle="섹션을 먼저 선택하면 해당 섹션에 맞는 필드가 표시됩니다"
        right={
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="text" size="md">← 포스트 목록</Btn>
          </div>
        }
      />

      {/* Step 1: section picker */}
      <div style={{ marginBottom: 48 }}>
        <CardLabel>1 · 섹션 선택</CardLabel>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12,
          marginTop: 8,
        }}>
          {ADMIN_SECTIONS.map((s, i) => (
            <SectionCard key={s.id} section={s} active={i === 1} />
          ))}
        </div>
      </div>

      {/* Step 2: form (shown for selected section: Archives) */}
      <div>
        <CardLabel>2 · 내용 입력 — Archives</CardLabel>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 32,
          marginTop: 8,
        }}>
          <div>
            <Field label="제목" required hint="대문자 도시명 권장 (예: TAIPEI)">
              <Input placeholder="도시명" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="연도" required>
                <Input placeholder="2025" />
              </Field>
              <Field label="촬영일" required>
                <Input placeholder="2025.07.04" />
              </Field>
            </div>
            <Field label="슬러그" hint="자동 생성됨, 수동 편집 가능">
              <Input placeholder="25-newyork" />
            </Field>
            <Field label="설명" hint="선택 · 1-2문장">
              <Textarea rows={3} placeholder="짧은 설명을 입력하세요" />
            </Field>
            <Field label="썸네일">
              <ThumbDropzone />
            </Field>
          </div>

          <SideSummary section="Archives" />
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        marginTop: 48, paddingTop: 24, borderTop: "1px solid #2a2a2a",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "#666" }}>변경사항은 저장 후 게시 패널에서 사이트에 반영됩니다.</span>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="text">취소</Btn>
          <Btn variant="ghost">초안 저장</Btn>
          <Btn variant="primary">저장 후 미디어 추가 ›</Btn>
        </div>
      </div>
    </div>
  </div>
);

const SectionCard = ({ section, active }) => (
  <button style={{
    ...buttonReset,
    textAlign: "left",
    padding: 20,
    borderRadius: 2,
    border: active ? "1px solid #FFF" : "1px solid #2a2a2a",
    backgroundColor: active ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
    cursor: "pointer",
    minHeight: 110,
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    gap: 12,
  }}>
    <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: "0.1em", color: "#FFF" }}>
      {section.label}
    </div>
    <div style={{
      fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      {active ? "선택됨" : `현재 ${section.count}건`}
    </div>
  </button>
);

const ThumbDropzone = () => (
  <div style={{
    border: "1px dashed #3a3a3a", borderRadius: 2,
    padding: "32px 20px",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  }}>
    <div style={{ fontSize: 13, color: "#CCC", marginBottom: 6 }}>
      이미지를 끌어다 놓거나 <span style={{ color: "#FFF", textDecoration: "underline" }}>파일 선택</span>
    </div>
    <div style={{ fontSize: 11, color: "#666" }}>3:2 비율 권장 · Cloudinary로 업로드됩니다</div>
  </div>
);

const SideSummary = ({ section }) => (
  <Card style={{ alignSelf: "start", position: "sticky", top: 96 }}>
    <CardLabel>요약</CardLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
      <Row label="섹션"  value={section} />
      <Row label="상태"  value={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><StatusDot status="draft" />초안</span>} />
      <Row label="작성자" value="Yejin" />
      <Row label="생성"   value="방금" />
      <Row label="URL"   value={<span style={{ color: "#888", fontSize: 12 }}>/archives/<i>(슬러그)</i></span>} />
    </div>
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #2a2a2a" }}>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
        Archives 섹션은 도시명과 연도가 함께 표시됩니다 (예: <span style={{ color: "#CCC" }}>TAIPEI ’24</span>).
        썸네일은 3:2 비율로 잘립니다.
      </div>
    </div>
  </Card>
);

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
    <span style={{ color: "#666", letterSpacing: "0.05em" }}>{label}</span>
    <span style={{ color: "#CCC", textAlign: "right" }}>{value}</span>
  </div>
);

window.NewPostScreen = NewPostScreen;
window.SideSummary = SideSummary;
window.Row = Row;
