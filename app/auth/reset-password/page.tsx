'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirect } from "@/app/auth/actions";

const G = "#16a34a";

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
          Create a secure password to protect your Cedar account and access your learning dashboard.
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }

    setDone(true);
    const destination = await getPostLoginRedirect("");
    setTimeout(() => router.push(destination), 1800);
  }

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
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              {done ? "Password set!" : "Set your password"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
              {done ? "Redirecting you to your dashboard…" : "Create a secure password for your Cedar account"}
            </p>
          </div>

          {done ? (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#15803d", margin: 0 }}>All done! Taking you to your dashboard.</p>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>New password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: "0.9rem", fontWeight: 500, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = G; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>Confirm password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" autoComplete="new-password"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: "0.9rem", fontWeight: 500, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = G; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }} />
                </div>

                {error && (
                  <div style={{ display: "flex", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px" }}>
                    <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: "#dc2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ fontSize: "0.85rem", color: "#b91c1c", lineHeight: 1.5 }}>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: "100%", background: G, color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(22,163,74,0.25)" }}>
                  {loading ? (
                    <><svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>Saving…</>
                  ) : "Set password & continue →"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
