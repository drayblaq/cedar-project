const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://cedartrainingcenter.com";

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #166534 100%)" }}>
      <div style={{ position: "absolute", top: 80, left: 40, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: 28, transform: "rotate(12deg)", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: 120, right: 60, width: 88, height: 88, background: "rgba(255,255,255,0.08)", borderRadius: 20, transform: "rotate(-12deg)", animation: "float 8s ease-in-out infinite reverse" }} />
      <div style={{ position: "absolute", top: "45%", right: 32, width: 60, height: 60, background: "rgba(255,255,255,0.08)", borderRadius: "50%", animation: "float 7s ease-in-out infinite" }} />
      <span style={{ position: "absolute", top: 64, right: 96, color: "rgba(255,255,255,0.18)", fontSize: "2.5rem", fontWeight: 800, transform: "rotate(6deg)", userSelect: "none" }}>A1</span>
      <span style={{ position: "absolute", bottom: 96, left: 64, color: "rgba(255,255,255,0.18)", fontSize: "2.5rem", fontWeight: 800, transform: "rotate(-6deg)", userSelect: "none" }}>B2</span>
      <span style={{ position: "absolute", top: "30%", left: 32, color: "rgba(255,255,255,0.12)", fontSize: "1.75rem", fontWeight: 800, transform: "rotate(10deg)", userSelect: "none" }}>Hello!</span>
      <span style={{ position: "absolute", bottom: "30%", right: "22%", color: "rgba(255,255,255,0.12)", fontSize: "1.4rem", fontWeight: 800, transform: "rotate(-8deg)", userSelect: "none" }}>Bonjour</span>
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 320 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Cedar" style={{ height: 64, margin: "0 auto 20px", display: "block", filter: "brightness(0) invert(1)" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", marginBottom: 12, letterSpacing: "-0.02em" }}>Cedar Training Center</h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(220,252,231,0.9)", lineHeight: 1.7 }}>
          Your journey to English fluency starts here. Register first, then we&apos;ll create your account.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {["A1","A2","B1","B2","C1","C2"].map((level) => (
            <div key={level} style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.7rem", fontWeight: 800 }}>
              {level}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AuthLeftPanel />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Cedar Training Center" style={{ height: 52, margin: "0 auto 12px", display: "block", objectFit: "contain" }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Student portal access</h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>How to get your login</p>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 500, lineHeight: 1.7, margin: "0 0 12px" }}>
              Student accounts are created by Cedar Training Center for learners who have <strong style={{ color: "#111827" }}>registered and paid</strong>.
            </p>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" }}>
              You will receive an email with a link to set your password and sign in to your dashboard.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/auth/login"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#16a34a", color: "#fff", borderRadius: 12, padding: "13px 20px", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(22,163,74,0.25)" }}>
                Sign in
              </a>
              <a href={`${MARKETING_URL}/register`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "13px 20px", fontSize: "0.9rem", fontWeight: 700, color: "#374151", textDecoration: "none", background: "#f8fafc" }}>
                Register for a course →
              </a>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a href={MARKETING_URL} style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "none" }}>← Back to website</a>
          </div>
        </div>
      </div>
    </div>
  );
}
