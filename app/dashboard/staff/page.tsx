import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const mon = new Date(today);
  mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default async function StaffDashboardPage() {
  const t = await getTranslations("dashboard.staff");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const weekDates = getWeekDates();

  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row) => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    const c = cls as { id?: string; name?: string; level_id?: string; levels?: { name?: string } | { name?: string }[] } | null;
    const levelName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as { name?: string }).name);
    return c?.id ? { id: c.id, name: c.name ?? "", levelId: c.level_id ?? "", levelName: levelName ?? "" } : null;
  }).filter(Boolean) as { id: string; name: string; levelId: string; levelName: string }[];

  // Student counts per class
  const studentCounts: Record<string, number> = {};
  for (const c of classList) {
    const { count } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("level_id", c.levelId);
    studentCounts[c.id] = count ?? 0;
  }

  // Check which classes have attendance marked today
  const markedToday = new Set<string>();
  if (classList.length) {
    for (const c of classList) {
      const { count } = await supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("date", today)
        .in(
          "student_id",
          (await supabase.from("students").select("id").eq("level_id", c.levelId)).data?.map(s => s.id) ?? []
        );
      if ((count ?? 0) > 0) markedToday.add(c.id);
    }
  }

  // Weekly attendance check per class
  type WeekRecord = Record<string, boolean>; // dateStr → marked
  const weeklyByClass: Record<string, WeekRecord> = {};
  for (const c of classList) {
    const levelStudents = (await supabase.from("students").select("id").eq("level_id", c.levelId)).data?.map(s => s.id) ?? [];
    const weekly: WeekRecord = {};
    for (const d of weekDates) {
      if (levelStudents.length === 0) { weekly[d] = false; continue; }
      const { count } = await supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("date", d)
        .in("student_id", levelStudents);
      weekly[d] = (count ?? 0) > 0;
    }
    weeklyByClass[c.id] = weekly;
  }

  // Assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, level_id, class_id")
    .order("due_date", { ascending: false })
    .limit(10);

  const myAssignmentIds = new Set<string>();
  const taughtLevels = new Set(classList.map((c) => c.levelId));
  const taughtClasses = new Set(classList.map((c) => c.id));
  for (const a of assignments ?? []) {
    const classId = (a as { class_id?: string }).class_id;
    const levelId = (a as { level_id?: string }).level_id;
    if (classId && taughtClasses.has(classId)) myAssignmentIds.add((a as { id: string }).id);
    if (levelId && taughtLevels.has(levelId)) myAssignmentIds.add((a as { id: string }).id);
  }
  const myAssignments = (assignments ?? []).filter((a) => myAssignmentIds.has((a as { id: string }).id));

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="px-4 sm:px-6 space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("title")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{t("myClassesPage")}</h1>
        <p className="mt-1 text-slate-500">{t("staffDesc")}</p>
      </div>

      {!classList.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-500">{t("notAssigned")}</p>
        </div>
      ) : (
        <>
          {/* ── Today's attendance cards ── */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-900">{t("todayAttendance")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classList.map((c) => {
                const marked = markedToday.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-5 shadow-sm ${
                      marked
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${marked ? "text-emerald-600" : "text-orange-600"}`}>
                          {todayFormatted}
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900">{c.name}</p>
                        <p className="text-sm text-slate-500">
                          {c.levelName} · {studentCounts[c.id] ?? 0} students
                        </p>
                        <p className={`mt-2 text-sm font-semibold ${marked ? "text-emerald-700" : "text-orange-700"}`}>
                          {marked ? t("attendanceMarked") : t("attendanceNotMarked")}
                        </p>
                      </div>
                      {!marked && (
                        <Link
                          href={`/staff/attendance?class=${c.id}&date=${today}`}
                          className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-600 transition"
                        >
                          {t("markNow")}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Weekly summary ── */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-900">{t("weekSummary")}</h2>
            <div className="space-y-4">
              {classList.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-slate-700">{c.name}</p>
                  <div className="flex gap-2 flex-wrap">
                    {weekDates.map((d, i) => {
                      const marked = weeklyByClass[c.id]?.[d] ?? false;
                      const isToday = d === today;
                      const isPast = d <= today;
                      return (
                        <div
                          key={d}
                          className={`flex flex-col items-center rounded-xl px-3 py-2 text-center min-w-[52px] border ${
                            isToday
                              ? marked
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-orange-300 bg-orange-50"
                              : marked
                              ? "border-emerald-200 bg-emerald-50"
                              : isPast
                              ? "border-slate-200 bg-slate-50"
                              : "border-slate-100 bg-white"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-500">{dayLabels[i]}</span>
                          <span className={`mt-1 text-base font-black ${
                            marked ? "text-emerald-600" : isPast ? "text-slate-300" : "text-slate-200"
                          }`}>
                            {marked ? "✓" : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Class detail cards ── */}
          <section className="space-y-6">
            {classList.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{c.name}</h2>
                    <p className="text-sm text-slate-500">{c.levelName ?? "—"}</p>
                  </div>
                  <Link
                    href={`/staff/attendance?class=${c.id}&date=${today}`}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                  >
                    {t("markAttendance")}
                  </Link>
                </div>
              </div>
            ))}
          </section>

          {/* ── Assignments ── */}
          {myAssignments.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900">{t("assignmentsForClasses")}</h2>
              <ul className="mt-4 space-y-2">
                {myAssignments.map((a: { id: string; title: string; due_date: string | null }) => (
                  <li key={a.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">
                      {t("due")}: {a.due_date ? new Date(a.due_date).toLocaleDateString() : t("noDueDate")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
