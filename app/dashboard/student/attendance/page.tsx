import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

export default async function StudentAttendancePage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const ts = await getTranslations("dashboard.status");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div className="px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("myAttendance")}</h1>
        <p className="mt-4 text-slate-600">{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("attendance")
    .select("id, date, status")
    .eq("student_id", result.student.id)
    .order("date", { ascending: false })
    .limit(60);

  const total = rows?.length ?? 0;
  const presentOrLate = rows?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const attendancePct = total > 0 ? Math.round((presentOrLate / total) * 100) : null;

  function statusBadge(status: string) {
    if (status === "present") return "bg-emerald-100 text-emerald-800";
    if (status === "late") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  }

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("myAttendance")}</h1>
      <p className="mt-2 text-slate-600">
        {result.student.full_name} · {tc("level")}: {levelName(result.student.levels)}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">{t("summary")}</h2>
        <p className="mt-2 text-slate-600">
          {t("attendanceRate")}:{" "}
          <span className="font-semibold text-slate-900">
            {attendancePct != null ? `${attendancePct}%` : "—"}
          </span>
          {total > 0 && (
            <span className="text-slate-500"> ({presentOrLate} {t("ofDays")} {total} {t("days")})</span>
          )}
        </p>
      </div>

      {!rows?.length ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">{t("noAttendance")}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700">{tc("date")}</th>
                <th className="px-5 py-4 font-semibold text-slate-700">{tc("status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 text-slate-900">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(r.status)}`}>
                      {ts(r.status as "present" | "absent" | "late")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
