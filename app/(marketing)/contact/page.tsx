import { useTranslations } from "next-intl";

export const metadata = {
  title:"Contact | Cedar Training Center",
  description:"Contact Cedar Training Center in Cotonou, Benin. Address, map, and get in touch.",
};

export default function ContactPage() {
  const t = useTranslations("marketing.contact");

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

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">
            {t("phoneLabel")}
          </h2>
          <p className="mt-3 text-slate-600">
            +229 01 96 19 64 40
          </p>
          <h2 className="mt-6 text-lg font-bold text-slate-900">{t("emailLabel")}</h2>
          <p className="mt-3 text-slate-600">trainingcentercedar@gmail.com</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">
            {t("addressLabel")}
          </h2>
          <p className="mt-3 text-slate-600">{t("addressValue")}</p>
        </div>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
        <iframe
          title="Cotonou, Benin"
          src="https://www.openstreetmap.org/export/embed.html?bbox=2.35%2C6.30%2C2.55%2C6.45&layer=mapnik&marker=6.37%2C2.43"
          width="100%"
          height="400"
          style={{ border: 0 }}
          className="block w-full"
          loading="lazy"
        />
      </div>
      <p className="mt-4 text-center">
        <a
          href="https://www.google.com/maps/search/Cotonou+Benin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          {t("mapLink")} →
        </a>
      </p>
    </div>
  );
}
