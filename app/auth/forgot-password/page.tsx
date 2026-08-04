'use client';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyErrors";

const G = "#16a34a";
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.cedartrainingcenter.com";

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
        <div style={{ display: "inline-block", background: "#ffffff", borderRadius: 16, padding: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.10)", marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Cedar" style={{ height: 48, width: 48, display: "block", borderRadius: 10, objectFit: "contain" }} />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", marginBottom: 12, letterSpacing: "-0.02em" }}>Cedar Training Center</h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(220,252,231,0.9)", lineHeight: 1.7 }}>
          No worries, we&apos;ll send a reset link to your email address so you can get back to learning.
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${PORTAL_URL}/auth/callback`,
    });
    setLoading(false);
    if (resetError) { setError(friendlyError(resetError.message)); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AuthLeftPanel />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#ffffff", borderRadius: 16, padding: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Cedar Training Center" style={{ height: 44, width: 44, display: "block", objectFit: "contain", borderRadius: 10 }} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              {sent ? "Check your email" : "Reset your password"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
              {sent
                ? `We've sent a reset link to ${email}`
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {sent ? (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
              </div>
              <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#15803d", marginBottom: 8 }}>Email sent!</p>
              <p style={{ fontSize: "0.85rem", color: "#166534", lineHeight: 1.6 }}>Check your inbox and click the reset link. It expires in 1 hour.</p>
              <a href="/auth/login" style={{ display: "inline-block", marginTop: 20, fontSize: "0.85rem", fontWeight: 600, color: G, textDecoration: "none" }}>← Back to login</a>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <form onSubmit={handleSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
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
                    </svg>Sending…</>
                  ) : "Send reset link →"}
                </button>

                <a href="/auth/login" style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>← Back to login</a>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
