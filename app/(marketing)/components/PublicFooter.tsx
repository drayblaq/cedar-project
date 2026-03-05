import Link from "next/link";
import { Logo } from "@/components/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Logo size="sm" link={false} className="shrink-0" />
              <span className="font-bold text-slate-900">Cedar Training Center</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Quality English language training in Cotonou, Benin. From beginner to advanced.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Quick links
            </h3>
            <ul className="mt-4 space-y-2">
              {["About","Courses","Contact","Register"].map((label) => (
                <li key={label}>
                  <Link
                    href={label ==="About" ?"/about" : label ==="Courses" ?"/courses" : label ==="Contact" ?"/contact" :"/register"}
                    className="text-sm text-slate-600 transition hover:text-emerald-600:text-emerald-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Location
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              Cotonou, Benin
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
            >
              Get directions →
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Portal
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              <Link
                href="/auth/login"
                className="font-medium text-emerald-600 hover:underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Cedar Training Center. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
