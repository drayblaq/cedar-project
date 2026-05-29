import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

function termName(t: { name?: string } | { name?: string }[] | null): string {
  if (!t) return "—";
  const name = Array.isArray(t) ? (t[0] as { name?: string })?.name : (t as { name?: string })?.name;
  return name ?? "—";
}

export default async function StudentGradesPage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div className="px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("myGrades")}</h1>
        <p className="mt-4 text-slate-600">{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: grades } = await supabase
    .from("grades")
    .select("id, subject_or_type, score, remarks, created_at, academic_terms(name)")
    .eq("student_id", result.student.id)
    .order("created_at", { ascending: false });

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("myGrades")}</h1>
      <p className="mt-2 text-slate-600">
        {result.student.full_name} · {tc("level")}: {levelName(result.student.levels)}
      </p>

      {!grades?.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">{t("noGrades")}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700">{t("subjectType")}</th>
                <th className="px-5 py-4 font-semibold text-slate-700">{t("term")}</th>
                <th className="px-5 py-4 font-semibold text-slate-700">{tc("score")}</th>
                <th className="px-5 py-4 font-semibold text-slate-700">{t("remarks")}</th>
                <th className="px-5 py-4 font-semibold text-slate-700">{tc("date")}</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-900">{g.subject_or_type}</td>
                  <td className="px-5 py-4 text-slate-600">{termName(g.academic_terms)}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{g.score != null ? g.score : "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{g.remarks ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(g.created_at).toLocaleDateString()}
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
