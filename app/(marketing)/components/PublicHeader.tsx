import Link from "next/link";
import { Logo } from "@/components/Logo";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Register" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 glass-header transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900"
        >
          <Logo size="sm" link={false} className="shrink-0" />
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Cedar Training Center
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-600:text-emerald-400"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="ml-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2:ring-offset-slate-900"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
