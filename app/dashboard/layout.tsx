import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { CurrentRole } from "./CurrentRole";
import { Logo } from "@/components/Logo";
import { DashboardNav } from "./DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-3 text-lg font-bold text-slate-900"
          >
            <Logo size="sm" link={false} className="shrink-0" />
            <span className="hidden sm:inline-block bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Cedar Training Center
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <CurrentRole />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-8 animate-fade-in-up">
        <DashboardNav />
        {children}
      </main>
    </div>
  );
}
