// handoff/admin-screen-edit.jsx
// /admin/posts/[id] — full edit form + media manager with drag-reorder grid.

const EditPostScreen = () => {
  const post = ADMIN_POSTS[0]; // TAIPEI '24
  return (
    <div style={adminStyles.page}>
      <AdminHeader active="posts" />
      <div style={{ ...adminStyles.pageBody, paddingBottom: 140 }}>
        <PageHead
          eyebrow={<><a style={{ color: "#888" }}>포스트</a> <span style={{ color: "#444", margin: "0 8px" }}>/</span> <span>{post.section}</span></>}
          title={post.title}
          subtitle={`${post.date} · ${post.count}개 미디어 · 최근 편집 1시간 전`}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Pill tone="warn">변경사항 있음</Pill>
              <Btn variant="ghost" size="md">미리보기 ↗</Btn>
              <Btn variant="primary" size="md">저장</Btn>
            </div>
          }
        />

        {/* Two-column: form left, media manager right */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}>
          {/* LEFT: form */}
          <div>
            <Field label="제목" required>
              <Input value="TAIPEI" focus />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="연도" required><Input value="2024" /></Field>
              <Field label="촬영일"><Input value="2025.07.04" /></Field>
            </div>
            <Field label="슬러그"><Input value="24-taipei" /></Field>
            <Field label="설명" hint="선택">
              <Textarea
                rows={4}
                value="여름의 타이베이. 비 내린 거리, 야시장의 잔상, 도시의 그라데이션을 기록한 26장의 아카이브."
              />
            </Field>

            <div style={{
              marginTop: 12, paddingTop: 24, borderTop: "1px solid #2a2a2a",
            }}>
              <CardLabel>정렬 / 표시</CardLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="목록 순서">
                  <Select value="1번째 (가장 위)" />
                </Field>
                <Field label="공개 여부">
                  <Select value="공개" />
                </Field>
              </div>
            </div>

            <div style={{ paddingTop: 8, borderTop: "1px solid #2a2a2a" }}>
              <CardLabel>위험 영역</CardLabel>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "#FFF" }}>이 포스트 삭제</div>
                  <div style={{ marginTop: 2, fontSize: 11, color: "#666" }}>
                    Supabase에서 즉시 제거됩니다. 사이트 반영은 다음 게시까지.
                  </div>
                </div>
                <Btn variant="danger" size="sm">삭제…</Btn>
              </div>
            </div>
          </div>

          {/* RIGHT: media manager */}
          <MediaManager postId={post.id} count={post.count} />
        </div>
      </div>

      {/* Sticky save bar */}
      <SaveBar />
    </div>
  );
};

const MediaManager = ({ postId, count }) => {
  const items = Array.from({ length: 12 }, (_, i) => ({ id: postId, variant: i + 1, n: i + 1 }));
  return (
    <div style={{ position: "sticky", top: 96, alignSelf: "start" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <CardLabel>미디어 · {count}</CardLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm">+ 이미지</Btn>
          <Btn variant="ghost" size="sm">+ 비디오</Btn>
          <Btn variant="text"  size="sm">재정렬 저장</Btn>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.05em", marginBottom: 12 }}>
        썸네일을 드래그해 순서를 바꿀 수 있습니다. 1번 항목이 목록 썸네일로 사용됩니다.
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
      }}>
        {items.map((it, i) => (
          <MediaTile key={i} item={it} primary={i === 0} dragging={i === 4} />
        ))}
        <AddMediaTile />
      </div>
    </div>
  );
};

const MediaTile = ({ item, primary, dragging }) => (
  <div style={{
    position: "relative",
    aspectRatio: "3 / 2",
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    cursor: "grab",
    outline: dragging ? "1px solid #FFF" : primary ? "1px solid rgba(255,255,255,0.4)" : "none",
    outlineOffset: dragging ? 2 : 0,
    opacity: dragging ? 0.85 : 1,
    transform: dragging ? "rotate(-1deg) scale(1.02)" : "none",
    transition: "transform 200ms",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      background: imageFor(item.id, item.variant),
      backgroundSize: "cover",
    }} />
    {/* Top-left index */}
    <div style={{
      position: "absolute", top: 6, left: 8,
      fontSize: 10, color: "#FFF", letterSpacing: "0.05em",
      padding: "2px 6px",
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)",
      borderRadius: 2,
    }}>{String(item.n).padStart(2, "0")}</div>

    {primary && (
      <div style={{
        position: "absolute", top: 6, right: 6,
        fontSize: 9, color: "#0d0d0d", letterSpacing: "0.1em",
        padding: "2px 6px", backgroundColor: "#FFF", borderRadius: 2,
        textTransform: "uppercase", fontWeight: 500,
      }}>썸네일</div>
    )}

    {/* Bottom controls */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "6px 8px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))",
    }}>
      <span style={{
        fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em",
      }}>⠿</span>
      <span style={{
        fontSize: 10, color: "rgba(255,255,255,0.6)", cursor: "pointer",
      }}>✕</span>
    </div>
  </div>
);

const AddMediaTile = () => (
  <div style={{
    aspectRatio: "3 / 2",
    border: "1px dashed #3a3a3a",
    borderRadius: 2,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 4,
    color: "#666", cursor: "pointer",
  }}>
    <span style={{ fontSize: 18, fontWeight: 300 }}>＋</span>
    <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>추가</span>
  </div>
);

const SaveBar = () => (
  <div style={{
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: "16px 48px",
    backgroundColor: "rgba(26,26,26,0.92)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid #2a2a2a",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    zIndex: 20,
  }}>
    <div style={{ fontSize: 12, color: "#888" }}>
      저장하지 않은 변경사항: <span style={{ color: "#FFF" }}>3건</span>
      <span style={{ color: "#444", margin: "0 10px" }}>·</span>
      마지막 자동 저장 30초 전
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      <Btn variant="text">변경사항 취소</Btn>
      <Btn variant="ghost">초안 저장</Btn>
      <Btn variant="primary">변경사항 저장</Btn>
    </div>
  </div>
);

window.EditPostScreen = EditPostScreen;
