import Link from"next/link";
import { useTranslations } from "next-intl";

export const metadata = {
  title:"About | Cedar Training Center",
  description:"Learn about Cedar Training Center, English language training in Cotonou, Benin.",
};

export default function AboutPage() {
  const t = useTranslations("marketing.about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        {t("title")}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        {t("intro")}
      </p>

      <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">
          {t("missionTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          {t("missionText")}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">
          {t("visionTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t("visionText")}</p>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">{t("methodTitle")}</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t("methodText")}</p>
      </div>

      <p className="mt-12 text-slate-600">
        Explore our{""}
        <Link href="/courses" className="font-medium text-emerald-600 hover:underline">
          courses
        </Link>{""}
        or{""}
        <Link href="/register" className="font-medium text-emerald-600 hover:underline">
          register
        </Link>{""}
        to get started.
      </p>
    </div>
  );
}
