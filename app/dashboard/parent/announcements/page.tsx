import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export default async function ParentAnnouncementsPage() {
  const t = await getTranslations("dashboard.parent");
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("lastAnnouncements")}</h1>
      <p className="mt-2 text-slate-500">{t("centerNews")}</p>

      {!announcements?.length ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="font-semibold text-slate-600">{t("noAnnouncementsYet")}</p>
          <p className="mt-1 text-sm text-slate-400">{t("checkBackLater")}</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">{a.title}</h2>
                <time className="shrink-0 text-sm text-slate-400">
                  {new Date(a.published_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              {a.body && (
                <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-wrap">{a.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
