// handoff/admin-screen-posts.jsx
// /admin/posts — filter bar + post rows.

const PostsScreen = () => (
  <div style={adminStyles.page}>
    <AdminHeader active="posts" />
    <div style={adminStyles.pageBody}>
      <PageHead
        eyebrow="콘텐츠"
        title="포스트"
        subtitle={`전체 ${ADMIN_POSTS.length}건 · 게시 ${ADMIN_POSTS.filter(p=>p.status==='published').length} · 초안 ${ADMIN_POSTS.filter(p=>p.status==='draft').length}`}
        right={<Btn variant="primary" size="md">+ 새 포스트</Btn>}
      />

      {/* Filter row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20,
      }}>
        <FilterChip label="섹션" value="전체" />
        <FilterChip label="상태" value="전체" />
        <FilterChip label="정렬" value="최신순" />
        <div style={{ flex: 1 }} />
        <SearchInput placeholder="제목 또는 클라이언트 검색…" />
      </div>

      {/* Section tabs */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "1px solid #2a2a2a",
        marginBottom: 4,
      }}>
        <TabPill label="전체" count={ADMIN_POSTS.length} active />
        {ADMIN_SECTIONS.map((s) => (
          <TabPill key={s.id} label={s.label} count={s.count} />
        ))}
      </div>

      {/* Post rows */}
      <div>
        {ADMIN_POSTS.map((p) => <PostRow key={p.id} post={p} />)}
      </div>
    </div>
  </div>
);

const FilterChip = ({ label, value }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px",
    border: "1px solid #2a2a2a", borderRadius: 2,
    fontSize: 12,
    cursor: "pointer",
  }}>
    <span style={{ color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 10 }}>{label}</span>
    <span style={{ color: "#FFF" }}>{value}</span>
    <span style={{ color: "#888", fontSize: 10 }}>▾</span>
  </div>
);

const SearchInput = ({ placeholder }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 14px",
    border: "1px solid #2a2a2a", borderRadius: 2,
    width: 320,
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-4-4"/>
    </svg>
    <input
      placeholder={placeholder}
      style={{
        flex: 1,
        background: "transparent", border: "none", color: "#FFF",
        fontSize: 13, fontFamily: "inherit", outline: "none",
      }}
    />
    <span style={{ fontSize: 10, color: "#666", letterSpacing: "0.1em", padding: "2px 6px", border: "1px solid #2a2a2a", borderRadius: 2 }}>⌘K</span>
  </div>
);

const TabPill = ({ label, count, active }) => (
  <button style={{
    ...buttonReset,
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 18px",
    fontSize: 13,
    color: active ? "#FFF" : "#888",
    borderBottom: active ? "1px solid #FFF" : "1px solid transparent",
    marginBottom: -1,
    cursor: "pointer",
  }}>
    <span>{label}</span>
    <span style={{ fontSize: 11, color: "#666" }}>{count}</span>
  </button>
);

const PostRow = ({ post }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "120px 1fr 140px 120px 100px 140px",
    alignItems: "center",
    gap: 20,
    padding: "16px 0",
    borderBottom: "1px solid #2a2a2a",
  }}>
    {/* Thumb */}
    <div style={{
      aspectRatio: "3 / 2",
      borderRadius: 2,
      background: imageFor(post.id, 0),
      backgroundSize: "cover",
    }} />

    {/* Title + meta */}
    <div>
      <div style={{ fontSize: 15, color: "#FFF" }}>{post.title}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: "#666", letterSpacing: "0.05em" }}>
        /{post.section.toLowerCase().replace(/\s/g, '-')}/{post.id}
      </div>
    </div>

    {/* Section */}
    <div style={{ fontSize: 12, color: "#CCC", letterSpacing: "0.05em" }}>{post.section}</div>

    {/* Status */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#CCC" }}>
      <StatusDot status={post.status} />
      {post.status === "published" ? "게시됨" : "초안"}
    </div>

    {/* Date / count */}
    <div style={{ textAlign: "right", fontSize: 12, color: "#888" }}>
      <div>{post.date}</div>
      <div style={{ marginTop: 2, fontSize: 11, color: "#666" }}>{post.count}개 미디어</div>
    </div>

    {/* Actions */}
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      <Btn variant="ghost" size="sm">편집</Btn>
      <Btn variant="text" size="sm">⋯</Btn>
    </div>
  </div>
);

window.PostsScreen = PostsScreen;
