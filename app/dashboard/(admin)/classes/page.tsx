import { createClient } from "@/lib/supabase/server";
import { createClass, assignStaffToClass, createAssignment } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary } from "../../ui";

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const { data: classes } = await supabase.from("classes").select("id, name, level_id, levels(name)").order("name");
  const { data: staffRole } = await supabase.from("roles").select("id").eq("name", "staff").single();
  const { data: staffList } = staffRole
    ? await supabase.from("profiles").select("id, full_name").eq("role_id", staffRole.id)
    : { data: [] };
  const staff = staffList ?? [];
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, level_id, class_id, levels(name), classes(name)")
    .order("due_date", { ascending: false })
    .limit(20);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Classes & Staff</h1>
        <p className="mt-1 text-sm text-slate-500">Organize classes by level, assign staff, and create assignments.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Forms column */}
        <div className="space-y-6">
          <div className={`${card} p-6`}>
            <h2 className="mb-5 text-sm font-semibold text-slate-900">Create class</h2>
            <form action={createClass as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
              <div>
                <label htmlFor="name" className={label}>Class name *</label>
                <input id="name" name="name" type="text" required placeholder="e.g. Beginner A" className={input} />
              </div>
              <div>
                <label htmlFor="level_id" className={label}>Level *</label>
                <select id="level_id" name="level_id" required className={input}>
                  <option value="">— Select —</option>
                  {(levels ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Create class</button>
            </form>
          </div>

          <div className={`${card} p-6`}>
            <h2 className="mb-5 text-sm font-semibold text-slate-900">Assign staff</h2>
            <form action={assignStaffToClass as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
              <div>
                <label htmlFor="profile_id" className={label}>Staff member</label>
                <select id="profile_id" name="profile_id" required className={input}>
                  <option value="">— Select staff —</option>
                  {staff.map((s: { id: string; full_name: string | null }) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="class_id" className={label}>Class</label>
                <select id="class_id" name="class_id" required className={input}>
                  <option value="">— Select class —</option>
                  {(classes ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({(c.levels as { name?: string })?.name ?? "—"})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Assign</button>
            </form>
          </div>

          <div className={`${card} p-6`}>
            <h2 className="mb-5 text-sm font-semibold text-slate-900">Add assignment</h2>
            <form action={createAssignment as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
              <div>
                <label htmlFor="title" className={label}>Title *</label>
                <input id="title" name="title" type="text" required className={input} placeholder="Assignment title…" />
              </div>
              <div>
                <label htmlFor="due_date" className={label}>Due date</label>
                <input id="due_date" name="due_date" type="date" className={input} />
              </div>
              <div>
                <label htmlFor="description" className={label}>Description</label>
                <textarea id="description" name="description" rows={2} className={input} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="assign_level_id" className={label}>Level</label>
                  <select id="assign_level_id" name="level_id" className={input}>
                    <option value="">Any</option>
                    {(levels ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="assign_class_id" className={label}>Class</label>
                  <select id="assign_class_id" name="class_id" className={input}>
                    <option value="">Any</option>
                    {(classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Add assignment</button>
            </form>
          </div>
        </div>

        {/* Classes list */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Classes ({classes?.length ?? 0})</h2>
          {!classes?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
              <span className="text-4xl">🏫</span>
              <p className="mt-3 font-semibold text-slate-600">No classes yet</p>
              <p className="mt-1 text-sm text-slate-400">Create your first class using the form.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.map((c: { id: string; name: string; levels: { name: string } | { name: string }[] | null }) => {
                const levelName = Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as { name?: string })?.name;
                return (
                  <div key={c.id} className={`${card} flex items-center gap-3 px-5 py-4`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-700">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{levelName ?? "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignments list */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Recent assignments</h2>
          {!assignments?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
              <span className="text-4xl">📝</span>
              <p className="mt-3 font-semibold text-slate-600">No assignments yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => {
                const lvl = Array.isArray(a.levels) ? a.levels[0] : a.levels;
                const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes;
                return (
                  <div key={a.id} className={`${card} px-5 py-4`}>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {a.due_date ? new Date(a.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No due date"}
                      {(lvl as { name?: string })?.name ? ` · ${(lvl as { name: string }).name}` : ""}
                      {(cls as { name?: string })?.name ? ` · ${(cls as { name: string }).name}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
