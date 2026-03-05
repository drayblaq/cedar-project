import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row) => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    const c = cls as { id?: string; name?: string; level_id?: string; levels?: { name?: string } | { name?: string }[] } | null;
    const levelName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as { name?: string }).name);
    return c?.id ? { id: c.id, name: c.name ?? "", levelId: c.level_id ?? "", levelName } : null;
  }).filter(Boolean) as { id: string; name: string; levelId: string; levelName: string }[];

  const studentsByLevel: Record<string, { id: string; full_name: string }[]> = {};
  for (const c of classList) {
    if (!c.levelId) continue;
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("level_id", c.levelId)
      .order("full_name");
    studentsByLevel[c.id] = students ?? [];
  }

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, level_id, class_id, levels(name), classes(name)")
    .order("due_date", { ascending: false })
    .limit(10);

  const myAssignmentIds = new Set<string>();
  for (const a of assignments ?? []) {
    const classId = (a as { class_id?: string }).class_id;
    const levelId = (a as { level_id?: string }).level_id;
    const taughtLevels = new Set(classList.map((c) => c.levelId));
    const taughtClasses = new Set(classList.map((c) => c.id));
    if (classId && taughtClasses.has(classId)) myAssignmentIds.add((a as { id: string }).id);
    if (levelId && taughtLevels.has(levelId)) myAssignmentIds.add((a as { id: string }).id);
  }
  const myAssignments = (assignments ?? []).filter((a) => myAssignmentIds.has((a as { id: string }).id));

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Staff portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">My classes</h1>
      <p className="mt-2 text-slate-600">View your assigned classes, students, and assignments. Mark attendance and add grades.</p>

      {!classList.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <p className="text-slate-500">You are not assigned to any class yet. Ask an admin to assign you from Dashboard → Classes.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          {classList.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{c.name}</h2>
                  <p className="text-sm text-slate-500">{c.levelName ?? "—"}</p>
                </div>
                <Link
                  href={`/dashboard/staff/attendance?class=${c.id}&date=${new Date().toISOString().slice(0, 10)}`}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                >
                  Mark attendance
                </Link>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-600">Students in this level ({(studentsByLevel[c.id] ?? []).length})</p>
                <ul className="mt-2 space-y-1">
                  {(studentsByLevel[c.id] ?? []).slice(0, 10).map((s) => (
                    <li key={s.id} className="text-sm text-slate-700">{s.full_name}</li>
                  ))}
                  {(studentsByLevel[c.id] ?? []).length > 10 && (
                    <li className="text-sm text-slate-500">+{(studentsByLevel[c.id] ?? []).length - 10} more</li>
                  )}
                </ul>
              </div>
            </div>
          ))}

          {myAssignments.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assignments for your classes</h2>
              <ul className="mt-4 space-y-2">
                {myAssignments.map((a: { id: string; title: string; due_date: string | null }) => (
                  <li key={a.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">
                      Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
