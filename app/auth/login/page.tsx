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
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-800 relative overflow-hidden items-center justify-center p-12">
      {/* Floating decorative shapes */}
      <div className="animate-float absolute top-20 left-10 w-28 h-28 bg-white/10 rounded-3xl rotate-12" />
      <div className="animate-float-delayed absolute bottom-28 right-14 w-20 h-20 bg-white/10 rounded-2xl -rotate-12" />
      <div className="animate-float absolute top-[45%] right-8 w-14 h-14 bg-white/10 rounded-full" />
      <div className="animate-float-delayed absolute top-1/3 left-6 w-10 h-10 bg-white/8 rounded-xl rotate-6" />

      {/* Floating text accents */}
      <span className="absolute top-16 right-24 text-white/20 text-4xl font-black rotate-6 select-none">A1</span>
      <span className="absolute bottom-24 left-16 text-white/20 text-4xl font-black -rotate-6 select-none">B2</span>
      <span className="absolute top-[30%] left-8 text-white/15 text-2xl font-black rotate-12 select-none">Hello!</span>
      <span className="absolute bottom-[30%] right-[20%] text-white/15 text-xl font-black -rotate-8 select-none">Bonjour</span>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Cedar" className="h-16 mx-auto mb-5 brightness-0 invert" />
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Cedar Training Center</h1>
        <p className="text-sm text-green-100/90 leading-relaxed">
          Your journey to English fluency starts here. Access your courses, track your progress, and learn at your own pace.
        </p>
        {/* CEFR level badges */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {["A1","A2","B1","B2","C1","C2"].map((level) => (
            <div key={level} className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white text-xs font-black">
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthLeftPanel />

      {/* Mobile hero banner */}
      <div className="lg:hidden bg-gradient-to-br from-green-700 via-green-600 to-green-800 px-6 pt-10 pb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Cedar Training Center" className="h-14 mx-auto mb-3 brightness-0 invert object-contain" />
        <h2 className="text-xl font-black text-white tracking-tight">Cedar Training Center</h2>
        <p className="text-sm text-green-100/80 mt-1">Your journey to English fluency</p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to continue your learning journey</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <a href="/auth/forgot-password" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <a href={`${MARKETING_URL}/register`} className="text-green-600 font-semibold hover:text-green-700 transition-colors">Register here</a>
          </p>
          <div className="text-center mt-2.5">
            <a href={MARKETING_URL} className="text-xs text-gray-400 hover:text-gray-500 transition-colors">← Back to website</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
            <div className="h-2.5 rounded-full bg-gray-100 w-1/2" />
            <div className="h-11 rounded-xl bg-gray-100" />
            <div className="h-11 rounded-xl bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
