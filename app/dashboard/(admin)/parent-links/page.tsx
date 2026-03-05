import { createClient } from "@/lib/supabase/server";
import { linkParentToStudent, unlinkParentFromStudent } from "@/app/dashboard/actions";

export default async function ParentLinksPage() {
  const supabase = await createClient();

  const { data: parentRole } = await supabase.from("roles").select("id").eq("name", "parent").single();
  const { data: parents } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role_id", parentRole?.id ?? "")
    .order("full_name");

  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: links } = await supabase
    .from("parent_students")
    .select("id, parent_id, student_id")
    .order("id");

  const parentIds = [...new Set((links ?? []).map((l) => l.parent_id))];
  const studentIds = [...new Set((links ?? []).map((l) => l.student_id))];
  const { data: parentProfiles } = await supabase.from("profiles").select("id, full_name").in("id", parentIds);
  const { data: studentRows } = await supabase.from("students").select("id, full_name").in("id", studentIds);
  const parentNames: Record<string, string> = {};
  (parentProfiles ?? []).forEach((p) => { parentNames[p.id] = p.full_name ?? p.id.slice(0, 8); });
  const studentNames: Record<string, string> = {};
  (studentRows ?? []).forEach((s) => { studentNames[s.id] = s.full_name; });

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Management</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Parent links</h1>
      <p className="mt-2 text-slate-600">Link parent accounts to students so parents can see their child&apos;s progress, attendance, and payments.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Link parent to student</h2>
          <form action={linkParentToStudent as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-slate-700">Parent *</label>
              <select id="parent_id" name="parent_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select parent —</option>
                {(parents ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0, 8)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-slate-700">Student *</label>
              <select id="student_id" name="student_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select student —</option>
                {(students ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">Add link</button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Current links</h2>
          {!links?.length ? (
            <p className="mt-4 text-slate-500">No parent–student links yet. Add one above.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {links.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-slate-700"><strong>{parentNames[l.parent_id] ?? "—"}</strong> → {studentNames[l.student_id] ?? "—"}</span>
                  <form action={unlinkParentFromStudent.bind(null, l.id) as unknown as (fd: FormData) => Promise<void>}>
                    <button type="submit" className="text-sm text-red-600 hover:underline">Remove</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
