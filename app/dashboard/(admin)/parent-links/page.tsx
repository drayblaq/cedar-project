import { createClient } from "@/lib/supabase/server";
import { linkParentToStudent, unlinkParentFromStudent } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary, btnDanger } from "../../ui";

export default async function ParentLinksPage() {
  const supabase = await createClient();
  const { data: parentRole } = await supabase.from("roles").select("id").eq("name", "parent").single();
  const { data: parents } = await supabase.from("profiles").select("id, full_name").eq("role_id", parentRole?.id ?? "").order("full_name");
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: links } = await supabase.from("parent_students").select("id, parent_id, student_id").order("id");

  const parentIds = [...new Set((links ?? []).map((l) => l.parent_id))];
  const studentIds = [...new Set((links ?? []).map((l) => l.student_id))];
  const { data: parentProfiles } = await supabase.from("profiles").select("id, full_name").in("id", parentIds);
  const { data: studentRows } = await supabase.from("students").select("id, full_name").in("id", studentIds);
  const parentNames: Record<string, string> = {};
  (parentProfiles ?? []).forEach((p) => { parentNames[p.id] = p.full_name ?? p.id.slice(0, 8); });
  const studentNames: Record<string, string> = {};
  (studentRows ?? []).forEach((s) => { studentNames[s.id] = s.full_name; });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Parent Links</h1>
        <p className="mt-1 text-sm text-slate-500">Connect parent accounts to their children for portal access.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <div className={`${card} p-6 h-fit`}>
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Link parent to student</h2>
          <form action={linkParentToStudent as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <div>
              <label htmlFor="parent_id" className={label}>Parent *</label>
              <select id="parent_id" name="parent_id" required className={input}>
                <option value="">— Select parent —</option>
                {(parents ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0, 8)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="student_id" className={label}>Student *</label>
              <select id="student_id" name="student_id" required className={input}>
                <option value="">— Select student —</option>
                {(students ?? []).map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Add link</button>
          </form>
        </div>

        {/* Links list */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Current links</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {links?.length ?? 0}
            </span>
          </div>

          {!links?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <span className="text-4xl">🔗</span>
              <p className="mt-3 font-semibold text-slate-600">No parent–student links yet</p>
              <p className="mt-1 text-sm text-slate-400">Add one using the form.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((l) => (
                <div key={l.id} className={`${card} flex items-center justify-between px-5 py-4`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {(parentNames[l.parent_id] ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        <span className="text-blue-700">{parentNames[l.parent_id] ?? "—"}</span>
                        <span className="mx-2 text-slate-300">→</span>
                        {studentNames[l.student_id] ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">Parent → Student</p>
                    </div>
                  </div>
                  <form action={unlinkParentFromStudent.bind(null, l.id) as unknown as (fd: FormData) => Promise<void>}>
                    <button type="submit" className={btnDanger}>Remove</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
