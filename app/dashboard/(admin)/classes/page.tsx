import { createClient } from "@/lib/supabase/server";
import { createClass, assignStaffToClass, createAssignment } from "@/app/dashboard/actions/index";

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, level_id, levels(name)")
    .order("name");
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
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Phase 5</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Classes & staff</h1>
      <p className="mt-2 text-slate-600">Create classes by level and assign staff. Add assignments.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Add class</h2>
          <form action={createClass as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Class name *</label>
              <input id="name" name="name" type="text" required placeholder="e.g. Beginner A" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <div>
              <label htmlFor="level_id" className="block text-sm font-medium text-slate-700">Level *</label>
              <select id="level_id" name="level_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select —</option>
                {(levels ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
              Add class
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Assign staff to class</h2>
          <form action={assignStaffToClass as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
            <div>
              <label htmlFor="profile_id" className="block text-sm font-medium text-slate-700">Staff</label>
              <select id="profile_id" name="profile_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select staff —</option>
                {staff.map((s: { id: string; full_name: string | null }) => (
                  <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-slate-700">Class</label>
              <select id="class_id" name="class_id" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                <option value="">— Select class —</option>
                {(classes ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({(c.levels as { name?: string })?.name ?? "—"})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
              Assign
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">Classes</h2>
        {!classes?.length ? (
          <p className="mt-4 text-slate-500">No classes yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {classes.map((c: { id: string; name: string; levels: { name: string } | { name: string }[] | null }) => {
              const levelName = Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as { name?: string })?.name;
              return (
                <li key={c.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-500">{levelName ?? "—"}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Add assignment</h2>
        <form action={createAssignment as unknown as (fd: FormData) => Promise<void>} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title *</label>
            <input id="title" name="title" type="text" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
          </div>
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700">Due date</label>
            <input id="due_date" name="due_date" type="date" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea id="description" name="description" rows={2} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
          </div>
          <div>
            <label htmlFor="assign_level_id" className="block text-sm font-medium text-slate-700">Level</label>
            <select id="assign_level_id" name="level_id" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
              <option value="">— Any —</option>
              {(levels ?? []).map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assign_class_id" className="block text-sm font-medium text-slate-700">Class</label>
            <select id="assign_class_id" name="class_id" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
              <option value="">— Any —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-lg">
              Add assignment
            </button>
          </div>
        </form>
      </div>

      {assignments && assignments.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Recent assignments</h2>
          <ul className="mt-4 space-y-2">
            {assignments.map((a) => {
              const levels = Array.isArray(a.levels) ? a.levels[0] : a.levels;
              const classes = Array.isArray(a.classes) ? a.classes[0] : a.classes;
              return (
              <li key={a.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500">
                  {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}
                  {(levels as { name?: string })?.name ? ` · ${(levels as { name: string }).name}` : ""}
                  {(classes as { name?: string })?.name ? ` · ${(classes as { name: string }).name}` : ""}
                </p>
              </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
