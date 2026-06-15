'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirect } from "@/app/auth/actions";

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://cedartrainingcenter.com";
const G = "#16a34a";

function EyeOffIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.416-2.583m4.058.46a10.05 10.05 0 013.91 3.55 9.97 9.97 0 01-1.564 3.029m-4.057.461l-3.29-3.29" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #166534 100%)" }}>
      {/* Floating shapes */}
      <div style={{ position: "absolute", top: 80, left: 40, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: 28, transform: "rotate(12deg)", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: 120, right: 60, width: 88, height: 88, background: "rgba(255,255,255,0.08)", borderRadius: 20, transform: "rotate(-12deg)", animation: "float 8s ease-in-out infinite reverse" }} />
      <div style={{ position: "absolute", top: "45%", right: 32, width: 60, height: 60, background: "rgba(255,255,255,0.08)", borderRadius: "50%", animation: "float 7s ease-in-out infinite" }} />
      {/* Floating English words */}
      <span style={{ position: "absolute", top: 64, right: 96, color: "rgba(255,255,255,0.18)", fontSize: "2.5rem", fontWeight: 800, transform: "rotate(6deg)", userSelect: "none" }}>A1</span>
      <span style={{ position: "absolute", bottom: 96, left: 64, color: "rgba(255,255,255,0.18)", fontSize: "2.5rem", fontWeight: 800, transform: "rotate(-6deg)", userSelect: "none" }}>B2</span>
      <span style={{ position: "absolute", top: "30%", left: 32, color: "rgba(255,255,255,0.12)", fontSize: "1.75rem", fontWeight: 800, transform: "rotate(10deg)", userSelect: "none" }}>Hello!</span>
      <span style={{ position: "absolute", bottom: "30%", right: "22%", color: "rgba(255,255,255,0.12)", fontSize: "1.4rem", fontWeight: 800, transform: "rotate(-8deg)", userSelect: "none" }}>Bonjour</span>
      {/* Main content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 320 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Cedar" style={{ height: 64, margin: "0 auto 20px", display: "block", filter: "brightness(0) invert(1)" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", marginBottom: 12, letterSpacing: "-0.02em" }}>Cedar Training Center</h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(220,252,231,0.9)", lineHeight: 1.7 }}>
          Your journey to English fluency starts here. Access your courses, track your progress, and learn at your own pace.
        </p>
        {/* CEFR levels */}
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle magic-link / invite / recovery tokens in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#")) return;
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    let cancelled = false;
    const finishTokenLogin = async () => {
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (sessionError) {
        if (!cancelled) setError(sessionError.message);
        return;
      }
      window.history.replaceState({}, "", window.location.pathname + window.location.search);
      // Invite and recovery links should land on the set-password page
      const type = params.get("type");
      if (type === "invite" || type === "recovery") {
        if (!cancelled) router.replace("/auth/reset-password");
        return;
      }
      const path = await getPostLoginRedirect(next);
      if (!cancelled) { router.replace(path); router.refresh(); }
    };
    void finishTokenLogin();
    return () => { cancelled = true; };
  }, [next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setLoading(false); setError(authError.message); return; }
    if (!authData.session?.user) { setLoading(false); setError("Login failed. Please try again."); return; }
    router.refresh();
    const path = await getPostLoginRedirect(next);
    setLoading(false);
    router.push(path);
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AuthLeftPanel />

      {/* Right side — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Cedar Training Center" style={{ height: 52, margin: "0 auto 12px", display: "block", objectFit: "contain" }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back</h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>Sign in to continue your learning journey</p>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <form onSubmit={handleSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>Email address</label>
                <input type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: "0.9rem", fontWeight: 500, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = G; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827" }}>Password</label>
                  <a href="/auth/forgot-password" style={{ fontSize: "0.75rem", fontWeight: 600, color: G, textDecoration: "none" }}>Forgot password?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} name="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 44px 12px 14px", fontSize: "0.9rem", fontWeight: 500, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = G; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, display: "flex" }}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
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
                  </svg>Signing in…</>
                ) : "Sign in"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: 20 }}>
            Don&apos;t have an account?{" "}
            <a href={`${MARKETING_URL}/register`} style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Register here</a>
          </p>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <a href={MARKETING_URL} style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "none" }}>← Back to website</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9" }} />
              <div style={{ height: 44, borderRadius: 12, background: "#f1f5f9" }} />
              <div style={{ height: 44, borderRadius: 12, background: "#f1f5f9" }} />
              <div style={{ height: 48, borderRadius: 12, background: "#f1f5f9" }} />
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
