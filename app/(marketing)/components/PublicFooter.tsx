import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";

export function PublicFooter() {
  const t = useTranslations("marketing");
  const links = [
    { href: "/about", label: t("nav.about") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/register", label: t("nav.register") },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Logo size="sm" link={false} className="shrink-0" />
              <span className="font-bold text-slate-900">{t("brand")}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-4 space-y-2">
              {links.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 transition hover:text-emerald-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {t("footer.location")}
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
        </div>
        <p className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
