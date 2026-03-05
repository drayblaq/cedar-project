'use client';

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const ROLE_DASHBOARD: Record<string, string> = {
  admin: "/dashboard",
  staff: "/dashboard",
  student: "/dashboard",
  parent: "/dashboard",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", authData.user.id)
      .single();

    let roleName: string | null = null;
    if (profile?.role_id) {
      const { data: role } = await supabase
        .from("roles")
        .select("name")
        .eq("id", profile.role_id)
        .single();
      roleName = role?.name ?? null;
    }

    const path = roleName && ROLE_DASHBOARD[roleName]
      ? ROLE_DASHBOARD[roleName]
      : next || "/dashboard";
    setLoading(false);
    router.push(path);
    router.refresh();
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="glass-panel rounded-3xl p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center justify-center gap-4">
            <Logo size="md" className="shrink-0" />
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to your Cedar Training Center account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20:bg-slate-900"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.416-2.583m4.058.46a10.05 10.05 0 013.91 3.55 9.97 9.97 0 01-1.564 3.029m-4.057.461l-3.29-3.29" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-fade-in flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-600" role="alert">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70:ring-offset-slate-900"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : ("Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Student portal access is sent to your email by the center after you register and pay.
          </p>
          <p className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 animate-pulse">
            <div className="mb-8 h-12 rounded-lg bg-slate-200" />
            <div className="space-y-5">
              <div className="h-12 rounded-xl bg-slate-200" />
              <div className="h-12 rounded-xl bg-slate-200" />
              <div className="h-12 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
