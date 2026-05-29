import { createClient } from "@/lib/supabase/server";
import { createGrade, deleteGrade } from "@/app/dashboard/actions/index";
import Link from "next/link";

export default async function GradesPage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: terms } = await supabase.from("academic_terms").select("id, name").order("start_date", { ascending: false });
  const { data: grades } = await supabase
    .from("grades")
    .select("id, student_id, academic_term_id, subject_or_type, score, remarks, students(full_name), academic_terms(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Academics</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Grades</h1>
      <p className="mt-2 text-slate-600">Add and view grades, scores, and remarks by student and term.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Add grade</h2>
          <form action={createGrade as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-slate-700">Student *</label>
              <select id="student_id" name="student_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select —</option>
                {(students ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="academic_term_id" className="block text-sm font-medium text-slate-700">Term</label>
              <select id="academic_term_id" name="academic_term_id" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— None —</option>
                {(terms ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subject_or_type" className="block text-sm font-medium text-slate-700">Subject / type</label>
              <input id="subject_or_type" name="subject_or_type" type="text" defaultValue="general" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-slate-700">Score (0–100)</label>
              <input id="score" name="score" type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Remarks</label>
              <textarea id="remarks" name="remarks" rows={2} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
              Add grade
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent grades</h2>
          {!grades?.length ? (
            <p className="mt-4 text-slate-500">No grades yet. Add one with the form.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {grades.map((g: { id: string; subject_or_type: string; score: number | null; remarks: string | null; students: { full_name: string } | { full_name: string }[] | null; academic_terms: { name: string } | { name: string }[] | null }) => {
                const student = Array.isArray(g.students) ? g.students[0] : g.students;
                const term = Array.isArray(g.academic_terms) ? g.academic_terms[0] : g.academic_terms;
                return (
                  <li key={g.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div>
                      <p className="font-medium text-slate-900">{(student as { full_name?: string })?.full_name ?? "—"}</p>
                      <p className="text-sm text-slate-500">{g.subject_or_type} {(term as { name?: string })?.name ? ` · ${(term as { name: string }).name}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {g.score != null && <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">{g.score}</span>}
                      <form action={deleteGrade.bind(null, g.id) as unknown as (fd: FormData) => Promise<void>} className="inline">
                        <button type="submit" className="text-sm text-red-600 hover:underline">Delete</button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
