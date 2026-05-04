import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CurrentRole } from "@/app/dashboard/CurrentRole";
import { SignOutButton } from "@/app/dashboard/SignOutButton";

type NavLink = {
  href: string;
  label: string;
};

export function PortalShell({
  children,
  links,
}: {
  children: React.ReactNode;
  links: NavLink[];
}) {
  const linkClass =
    "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 glass-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3 text-lg font-bold text-slate-900">
            <Logo size="sm" link={false} className="shrink-0" />
            <span className="hidden bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent sm:inline-block">
              Cedar Training Center
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <CurrentRole />
            <div className="h-6 w-px bg-slate-200"></div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl animate-fade-in-up py-8">
        <nav className="mb-8 flex flex-wrap gap-2 px-4 sm:px-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}
