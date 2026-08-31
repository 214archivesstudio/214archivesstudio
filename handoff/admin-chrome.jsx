// handoff/admin-chrome.jsx — shared admin atoms.
// Visual rules:
//   - bg #1A1A1A everywhere; sections separated by hairline #2a2a2a (1px)
//     NOT by shadow or card lift. This is the one acceptable deviation
//     from the public site, where dark-on-dark wouldn't be navigable.
//   - All headings: font-light, tracking 0.2em on big H1, 0.15em on H2.
//   - Buttons: 3 variants. Primary = white text on bg #FFF/10 hover, with
//     #FFF border. Secondary = ghost. Tertiary = pure text muted→fg.

const adminStyles = {
  page: {
    position: "relative",
    minHeight: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
    color: "#FFF",
    fontFamily: '"Pretendard Variable", "Pretendard", "Noto Sans KR", system-ui, sans-serif',
    fontWeight: 400,
  },
  pageBody: {
    padding: "32px 48px 96px",
    maxWidth: 1440,
    margin: "0 auto",
  },
};

// ----- Admin Header --------------------------------------------------------
// Same skeleton as the public header, but admin nav + user pill on the right.
const AdminHeader = ({ active, onNavigate }) => {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 48px",
      borderBottom: "1px solid #2a2a2a",
      backgroundColor: "rgba(26,26,26,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 13, color: "#FFF", letterSpacing: "0.06em" }}>
          214Archives Studio
        </span>
        <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em" }}>·</span>
        <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Admin
        </span>
      </div>

      {/* Center nav */}
      <nav style={{ display: "flex", gap: 28 }}>
        {ADMIN_NAV.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate && onNavigate(item.href)}
            style={{
              ...buttonReset,
              fontSize: 13,
              letterSpacing: "0.05em",
              color: active === item.href ? "#FFF" : "#888",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right cluster: site link + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a
          href="#"
          style={{
            fontSize: 12, color: "#888", letterSpacing: "0.05em",
            textDecoration: "none",
          }}
        >사이트 보기 ↗</a>
        <UserPill user={ADMIN_USER} />
      </div>
    </header>
  );
};

const UserPill = ({ user }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 9999,
      backgroundColor: "#2a2a2a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: "#CCC", letterSpacing: "0.05em",
    }}>{user.name.split(" ").map((s) => s[0]).join("").slice(0,2)}</div>
    <div style={{ fontSize: 12, color: "#CCC" }}>{user.name}</div>
  </div>
);

// ----- Page title -----------------------------------------------------------
const PageHead = ({ title, subtitle, eyebrow, right }) => (
  <div style={{
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 24, marginBottom: 32,
    paddingBottom: 24, borderBottom: "1px solid #2a2a2a",
  }}>
    <div>
      {eyebrow && (
        <div style={{
          fontSize: 11, color: "#888", letterSpacing: "0.2em",
          textTransform: "uppercase", marginBottom: 10,
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        margin: 0, fontSize: 28, fontWeight: 300, letterSpacing: "0.18em",
        color: "#FFF",
      }}>{title}</h1>
      {subtitle && (
        <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "#888" }}>
          {subtitle}
        </p>
      )}
    </div>
    {right && <div>{right}</div>}
  </div>
);

// ----- Card -----------------------------------------------------------------
const Card = ({ children, style }) => (
  <div style={{
    border: "1px solid #2a2a2a",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 24,
    ...style,
  }}>{children}</div>
);

const CardLabel = ({ children }) => (
  <div style={{
    fontSize: 11, color: "#888",
    letterSpacing: "0.18em", textTransform: "uppercase",
    marginBottom: 12,
  }}>{children}</div>
);

// ----- Buttons --------------------------------------------------------------
const buttonReset = {
  background: "none", border: "none", padding: 0,
  font: "inherit", color: "inherit",
};

const Btn = ({ variant = "primary", size = "md", children, icon, ...rest }) => {
  const sizes = {
    sm: { fontSize: 12, padding: "6px 12px", height: 28 },
    md: { fontSize: 13, padding: "8px 18px", height: 36 },
    lg: { fontSize: 14, padding: "10px 24px", height: 44 },
  };
  const variants = {
    primary:   { backgroundColor: "#FFF",                color: "#0d0d0d", border: "1px solid #FFF" },
    secondary: { backgroundColor: "transparent",         color: "#FFF",    border: "1px solid #FFF" },
    ghost:     { backgroundColor: "transparent",         color: "#CCC",    border: "1px solid #2a2a2a" },
    text:      { backgroundColor: "transparent",         color: "#888",    border: "1px solid transparent" },
    danger:    { backgroundColor: "transparent",         color: "#e2a98c", border: "1px solid #5a3322" },
  };
  return (
    <button
      {...rest}
      style={{
        ...buttonReset,
        ...sizes[size],
        ...variants[variant],
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        letterSpacing: "0.06em",
        cursor: "pointer",
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </button>
  );
};

// ----- Form atoms -----------------------------------------------------------
const Field = ({ label, hint, required, children }) => (
  <label style={{ display: "block", marginBottom: 24 }}>
    <div style={{
      fontSize: 11, color: "#888", letterSpacing: "0.15em",
      textTransform: "uppercase", marginBottom: 8,
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
    }}>
      <span>{label}{required && <span style={{ color: "#FFF", marginLeft: 4 }}>*</span>}</span>
      {hint && <span style={{ color: "#666", textTransform: "none", letterSpacing: 0 }}>{hint}</span>}
    </div>
    {children}
  </label>
);

const inputBase = {
  width: "100%",
  backgroundColor: "transparent",
  border: "none",
  borderBottom: "1px solid #2a2a2a",
  color: "#FFF",
  fontSize: 15,
  fontFamily: "inherit",
  padding: "8px 0",
  outline: "none",
  transition: "border-color 200ms",
};

const Input = ({ value, placeholder, type = "text", focus, ...rest }) => (
  <input
    type={type}
    defaultValue={value}
    placeholder={placeholder}
    style={{
      ...inputBase,
      borderBottomColor: focus ? "#FFF" : "#2a2a2a",
    }}
    {...rest}
  />
);

const Textarea = ({ value, placeholder, rows = 4, focus, ...rest }) => (
  <textarea
    defaultValue={value}
    placeholder={placeholder}
    rows={rows}
    style={{
      ...inputBase,
      borderBottom: "none",
      border: `1px solid ${focus ? "#FFF" : "#2a2a2a"}`,
      borderRadius: 2,
      padding: 12,
      resize: "vertical",
      fontFamily: "inherit",
    }}
    {...rest}
  />
);

const Select = ({ value, options, focus }) => (
  <div style={{
    position: "relative",
    borderBottom: `1px solid ${focus ? "#FFF" : "#2a2a2a"}`,
    padding: "8px 24px 8px 0",
    fontSize: 15, color: "#FFF",
  }}>
    {value}
    <span style={{
      position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
      color: "#888", fontSize: 10,
    }}>▾</span>
  </div>
);

// ----- Status atoms ---------------------------------------------------------
const StatusDot = ({ status }) => {
  const map = {
    published: "#FFF",
    draft:     "#666",
    pending:   "#d6a877",
    error:     "#e2a98c",
  };
  return (
    <span style={{
      display: "inline-block",
      width: 6, height: 6, borderRadius: 9999,
      backgroundColor: map[status] || "#666",
    }} />
  );
};

const Pill = ({ children, tone = "default" }) => {
  const tones = {
    default: { color: "#CCC",    bg: "rgba(255,255,255,0.06)", border: "#2a2a2a" },
    accent:  { color: "#FFF",    bg: "rgba(255,255,255,0.1)",  border: "#3a3a3a" },
    warn:    { color: "#d6a877", bg: "rgba(214,168,119,0.08)", border: "#3a2e1f" },
    danger:  { color: "#e2a98c", bg: "rgba(226,169,140,0.08)", border: "#3a2218" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, letterSpacing: "0.08em",
      padding: "3px 10px",
      borderRadius: 9999,
      color: t.color, backgroundColor: t.bg, border: `1px solid ${t.border}`,
    }}>{children}</span>
  );
};

Object.assign(window, {
  adminStyles, buttonReset,
  AdminHeader, PageHead, Card, CardLabel,
  Btn, Field, Input, Textarea, Select, StatusDot, Pill,
});
