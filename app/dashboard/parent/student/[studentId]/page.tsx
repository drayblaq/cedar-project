import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

function resolveNested<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function gradeColor(score: number | null) {
  if (score == null) return "bg-slate-100 text-slate-500";
  if (score >= 75) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function attBadgeClass(status: string) {
  if (status === "present") return "bg-emerald-100 text-emerald-700";
  if (status === "late") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default async function ParentStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const t = await getTranslations("dashboard.parent");
  const tc = await getTranslations("dashboard.common");
  const ts = await getTranslations("dashboard.status");
  const { studentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: link } = await supabase
    .from("parent_students")
    .select("id")
    .eq("parent_id", user.id)
    .eq("student_id", studentId)
    .maybeSingle();
  if (!link) redirect("/parent");

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, phone, status, enrollment_date, levels(name)")
    .eq("id", studentId)
    .single();
  if (!student) notFound();

  const lvlRow = resolveNested(student.levels as { name?: string } | { name?: string }[] | null);
  const level = lvlRow?.name ?? "—";

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [attRes, gradesRes, announcementsRes] = await Promise.all([
    supabase
      .from("attendance")
      .select("date, status")
      .eq("student_id", studentId)
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: false }),
    supabase
      .from("grades")
      .select("id, subject_or_type, score, remarks, created_at, academic_terms(name)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("id, title, body, published_at")
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const attRows = attRes.data ?? [];
  const presentCount = attRows.filter((r) => r.status === "present").length;
  const lateCount = attRows.filter((r) => r.status === "late").length;
  const absentCount = attRows.filter((r) => r.status === "absent").length;
  const totalAtt = attRows.length;
  const attPct =
    totalAtt > 0 ? Math.round(((presentCount + lateCount) / totalAtt) * 100) : null;

  const grades = gradesRes.data ?? [];
  const scores = grades.map((g) => Number(g.score)).filter((n) => !isNaN(n) && n != null);
  const gradeAvg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const announcements = announcementsRes.data ?? [];

  return (
    <div className="px-4 sm:px-6 space-y-8">
      <Link href="/parent" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline">
        ← {t("backToChildren")}
      </Link>

      {/* Section A: Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{t("overview")}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{student.full_name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>{tc("level")}: <strong>{level}</strong></span>
              {student.email && <span>{tc("email")}: <strong>{student.email}</strong></span>}
              {(student as { phone?: string | null }).phone && (
                <span>{tc("phone")}: <strong>{(student as { phone?: string | null }).phone}</strong></span>
              )}
              {student.enrollment_date && (
                <span>Enrolled: <strong>{fmtDate(student.enrollment_date)}</strong></span>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 self-start rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              student.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {ts(student.status as "active" | "pending" | "inactive")}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50 sm:grid-cols-4">
          {[
            { label: t("attendanceSummary"), value: attPct != null ? `${attPct}%` : "—" },
            { label: ts("present"), value: presentCount },
            { label: ts("late"), value: lateCount },
            { label: ts("absent"), value: absentCount },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 text-center">
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Attendance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{t("last30days")}</h2>
        {totalAtt > 0 && (
          <p className="mt-1 text-sm text-slate-500">
            {presentCount} {ts("present")} · {lateCount} {ts("late")} · {absentCount} {ts("absent")}
          </p>
        )}

        {!attRows.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
            {t("noAttendance30")}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">{tc("date")}</th>
                  <th className="px-4 py-3">{tc("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attRows.map((a) => (
                  <tr key={a.date} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{fmtDate(a.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${attBadgeClass(a.status)}`}>
                        {ts(a.status as "present" | "absent" | "late")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section C: Grades */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-slate-900">{t("gradesSummary")}</h2>
          {gradeAvg != null && (
            <span className="text-sm font-semibold text-slate-500">
              {t("average")}: <strong className="text-slate-900">{gradeAvg} / 100</strong>
            </span>
          )}
        </div>

        {!grades.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
            {t("noGrades")}
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">{tc("name")}</th>
                  <th className="px-4 py-3">{tc("score")}</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3 hidden sm:table-cell">{tc("notes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g) => {
                  const term = resolveNested(g.academic_terms as { name?: string } | { name?: string }[] | null);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800 capitalize">{g.subject_or_type}</td>
                      <td className="px-4 py-3">
                        {g.score != null ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${gradeColor(Number(g.score))}`}>
                            {g.score}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{term?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                        {(g as { remarks?: string | null }).remarks ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section D: Announcements */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{t("latestAnnouncements")}</h2>
          <Link href="/parent/announcements" className="text-sm font-medium text-emerald-600 hover:underline">
            {t("viewAllAnnouncements")} →
          </Link>
        </div>

        {!announcements.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
            {t("noAnnouncements")}
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {announcements.map((a) => (
              <li key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <time className="shrink-0 text-xs text-slate-400">{fmtDate(a.published_at)}</time>
                </div>
                {a.body && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {a.body.slice(0, 100)}{a.body.length > 100 ? "…" : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
