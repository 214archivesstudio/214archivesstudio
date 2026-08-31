// handoff/admin-screen-login.jsx
// /admin/login — full-bleed background, centered form.

const LoginScreen = () => {
  return (
    <div style={{
      position: "relative",
      width: "100%", minHeight: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      backgroundColor: "#1A1A1A",
      fontFamily: '"Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif',
    }}>
      {/* Full-bleed BG, same as public site */}
      <div style={{
        position: "absolute", inset: 0,
        background: imageFor("login-bg", 0),
        backgroundSize: "cover",
      }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)" }} />

      {/* Form column */}
      <div style={{
        position: "relative",
        width: 380,
        display: "flex", flexDirection: "column",
        gap: 32,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 56, fontWeight: 300, letterSpacing: "0.1em", color: "#FFF",
            lineHeight: 1,
          }}>214</div>
          <div style={{
            marginTop: 14,
            fontSize: 11, color: "#888", letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}>Studio Admin</div>
        </div>

        <div>
          <Field label="이메일">
            <Input placeholder="studio@214archives.com" value="studio@214archives.com" />
          </Field>
          <Field label="비밀번호">
            <Input type="password" value="••••••••••••" focus />
          </Field>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <Btn variant="primary" size="lg" style={{ width: "100%" }}>로그인</Btn>
            <button style={{
              ...buttonReset,
              fontSize: 12, color: "#888", letterSpacing: "0.1em",
              cursor: "pointer", padding: 8, textAlign: "center",
            }}>비밀번호를 잊으셨나요?</button>
          </div>
        </div>

        {/* footer note */}
        <div style={{
          textAlign: "center",
          fontSize: 10, color: "#666", letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          승인된 운영자만 접근할 수 있습니다
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
