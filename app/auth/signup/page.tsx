import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 text-center">
          <Logo size="md" className="mx-auto mb-6 shrink-0" />
          <h1 className="text-xl font-bold text-slate-900">Student portal access</h1>
          <p className="mt-4 text-slate-600">
            Student logins are created by the center for learners who have <strong>registered and paid</strong>. 
            You will receive an email with a link to set your password and sign in to your dashboard.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            If you have already received your login email, use the link in that email or sign in below.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Sign in
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_MARKETING_URL || "https://cedartrainingcenter.com"}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
