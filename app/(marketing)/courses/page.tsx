import Link from"next/link";
import { useTranslations } from "next-intl";

export const metadata = {
  title:"Courses & English Levels | Cedar Training Center",
  description:"English levels from Beginner to Advanced, plus IELTS and TOEFL preparation at Cedar Training Center, Cotonou.",
};

export default function CoursesPage() {
  const t = useTranslations("marketing.courses");
  const programs = [
    t("list.general"),
    t("list.business"),
    t("list.tests"),
    t("list.workshops"),
    t("list.intensive"),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        {t("intro")}
      </p>

      <div className="mt-12 space-y-4">
        {programs.map((program) => (
          <div
            key={program}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:border-emerald-200 hover:shadow-lg"
          >
            <p className="text-slate-700 font-medium">{program}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/register"
          className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
        >
          {t("cta")} →
        </Link>
      </div>
    </div>
  );
}
