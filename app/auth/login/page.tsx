'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { getPostLoginRedirect } from "@/app/auth/actions";

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.416-2.583m4.058.46a10.05 10.05 0 013.91 3.55 9.97 9.97 0 01-1.564 3.029m-4.057.461l-3.29-3.29" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

const G = "var(--green, #16a34a)";

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

  // Handle magic-link hash tokens (e.g. from email invite links)
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
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        if (!cancelled) setError(sessionError.message);
        return;
      }
      window.history.replaceState({}, "", window.location.pathname + window.location.search);
      const path = await getPostLoginRedirect(next);
      if (!cancelled) {
        router.replace(path);
        router.refresh();
      }
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

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }
    if (!authData.session?.user) {
      setLoading(false);
      setError("Login failed. Please try again.");
      return;
    }

    router.refresh();
    const path = await getPostLoginRedirect(next);
    setLoading(false);
    router.push(path);
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo + heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image
            src="/logo.png"
            alt="Cedar Training Center"
            width={56}
            height={56}
            style={{ margin: "0 auto 12px", display: "block", objectFit: "contain" }}
            priority
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 6 }}>
            Sign in to your Cedar Training Center account
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: "0.95rem", color: "#0f172a", background: "#ffffff", outline: "none", fontFamily: "inherit" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = G; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                  Password
                </label>
                <Link href="#" style={{ fontSize: "0.75rem", fontWeight: 600, color: G, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 44px 12px 14px", fontSize: "0.95rem", color: "#0f172a", background: "#ffffff", outline: "none", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = G; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, display: "flex", alignItems: "center" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error — only from failed submission, not URL params */}
            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px" }}>
                <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, color: "#dc2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: "0.85rem", color: "#b91c1c", lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: G, color: "#ffffff", border: "none",
                borderRadius: 12, padding: "13px 20px", fontSize: "0.95rem",
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, fontFamily: "inherit",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: 24, lineHeight: 1.6 }}>
          Don&apos;t have an account? Contact Cedar Training Center to register.
        </p>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href={process.env.NEXT_PUBLIC_MARKETING_URL || "https://cedartrainingcenter.com"} style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "none" }}>
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "32px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", margin: "0 auto 8px" }} />
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
