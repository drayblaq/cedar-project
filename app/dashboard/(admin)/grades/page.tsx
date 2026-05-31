import { createClient } from "@/lib/supabase/server";
import { createGrade, deleteGrade } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary, btnDanger } from "../../ui";

export default async function GradesPage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: terms } = await supabase.from("academic_terms").select("id, name").order("start_date", { ascending: false });
  const { data: grades } = await supabase
    .from("grades")
    .select("id, student_id, academic_term_id, subject_or_type, score, remarks, students(full_name), academic_terms(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  function scoreColor(score: number | null) {
    if (score == null) return "bg-slate-100 text-slate-600";
    if (score >= 75) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Grades</h1>
        <p className="mt-1 text-sm text-slate-500">Record and review student grades by subject and term.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Add grade form */}
        <div className={`${card} p-6 h-fit`}>
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Add grade</h2>
          <form action={createGrade as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <div>
              <label htmlFor="student_id" className={label}>Student *</label>
              <select id="student_id" name="student_id" required className={input}>
                <option value="">— Select —</option>
                {(students ?? []).map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="academic_term_id" className={label}>Term</label>
              <select id="academic_term_id" name="academic_term_id" className={input}>
                <option value="">— None —</option>
                {(terms ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subject_or_type" className={label}>Subject / type</label>
              <input id="subject_or_type" name="subject_or_type" type="text" defaultValue="general" className={input} />
            </div>
            <div>
              <label htmlFor="score" className={label}>Score (0–100)</label>
              <input id="score" name="score" type="number" min="0" max="100" step="0.01" className={input} placeholder="e.g. 78" />
            </div>
            <div>
              <label htmlFor="remarks" className={label}>Remarks</label>
              <textarea id="remarks" name="remarks" rows={2} className={input} placeholder="Optional remarks…" />
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>
              Add grade
            </button>
          </form>
        </div>

        {/* Grades list */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent grades</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {grades?.length ?? 0} records
            </span>
          </div>

          {!grades?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <span className="text-4xl">📊</span>
              <p className="mt-3 font-semibold text-slate-600">No grades yet</p>
              <p className="mt-1 text-sm text-slate-400">Add a grade using the form.</p>
            </div>
          ) : (
            <div className={`${card} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Term</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Remarks</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((g: { id: string; subject_or_type: string; score: number | null; remarks: string | null; students: { full_name: string } | { full_name: string }[] | null; academic_terms: { name: string } | { name: string }[] | null }) => {
                    const student = Array.isArray(g.students) ? g.students[0] : g.students;
                    const term = Array.isArray(g.academic_terms) ? g.academic_terms[0] : g.academic_terms;
                    return (
                      <tr key={g.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {(student as { full_name?: string })?.full_name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 capitalize">{g.subject_or_type}</td>
                        <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                          {(term as { name?: string })?.name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {g.score != null ? (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(Number(g.score))}`}>
                              {g.score}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">
                          {g.remarks ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <form action={deleteGrade.bind(null, g.id) as unknown as (fd: FormData) => Promise<void>} className="inline">
                            <button type="submit" className={btnDanger}>Delete</button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
