import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

function resolveNested<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function attColor(pct: number | null) {
  if (pct == null) return "bg-slate-100 text-slate-500";
  if (pct >= 80) return "bg-emerald-100 text-emerald-700";
  if (pct >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default async function ParentDashboardPage() {
  const t = await getTranslations("dashboard.parent");
  const ts = await getTranslations("dashboard.status");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const parentName = (profile as { full_name?: string | null } | null)?.full_name ?? "";

  const { data: links } = await supabase
    .from("parent_students")
    .select("student_id")
    .eq("parent_id", user.id);

  const studentIds = (links ?? []).map((l) => l.student_id);

  if (!studentIds.length) {
    return (
      <div className="px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t("welcome")}{parentName ? `, ${parentName.split(" ")[0]}` : ""}
        </h1>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-lg font-semibold text-amber-900">{t("myChildren")}</p>
          <p className="mt-2 text-sm text-amber-700">{t("noChildren")}</p>
        </div>
      </div>
    );
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, status, levels(name)")
    .in("id", studentIds);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  type ChildSummary = {
    id: string;
    full_name: string;
    status: string;
    level: string;
    presentThisMonth: number;
    totalThisMonth: number;
    attPct: number | null;
    gradeAvg: number | null;
  };

  const summaries: ChildSummary[] = [];
  for (const s of students ?? []) {
    const lvlRow = resolveNested(s.levels as { name?: string } | { name?: string }[] | null);
    const level = lvlRow?.name ?? "—";

    const { data: attRows } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", s.id)
      .gte("date", monthStart);

    const totalThisMonth = attRows?.length ?? 0;
    const presentThisMonth =
      attRows?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
    const attPct =
      totalThisMonth > 0 ? Math.round((presentThisMonth / totalThisMonth) * 100) : null;

    const { data: gradeRows } = await supabase
      .from("grades")
      .select("score")
      .eq("student_id", s.id)
      .not("score", "is", null);

    const scores = (gradeRows ?? [])
      .map((g) => Number(g.score))
      .filter((n) => !isNaN(n));
    const gradeAvg =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    summaries.push({
      id: s.id,
      full_name: s.full_name,
      status: s.status ?? "pending",
      level,
      presentThisMonth,
      totalThisMonth,
      attPct,
      gradeAvg,
    });
  }

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        {t("welcome")}{parentName ? `, ${parentName.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-slate-500">{t("progressDesc")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((s) => (
          <div
            key={s.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{s.full_name}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{t("gradesSummary")}: {s.level}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                  s.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {ts(s.status as "active" | "pending" | "inactive")}
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("attendanceThisMonth")}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${attColor(s.attPct)}`}>
                  {s.attPct != null ? `${s.attPct}%` : "—"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {s.totalThisMonth > 0
                  ? `${t("present")} ${s.presentThisMonth} / ${s.totalThisMonth}`
                  : t("noAttendanceThisMonth")}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("gradeAverage")}
              </span>
              <span className="text-sm font-bold text-slate-700">
                {s.gradeAvg != null ? `${s.gradeAvg} / 100` : "—"}
              </span>
            </div>

            <Link
              href={`/parent/student/${s.id}`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
            >
              {t("viewDetails")} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
