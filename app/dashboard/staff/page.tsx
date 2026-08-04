import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  amber: "#d97706", amberLight: "#fffbeb",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmtTime(t: string) { return t.slice(0, 5); }

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const mon = new Date(today);
  mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function LevelBadge({ level }: { level?: string }) {
  if (!level) return <span style={{ fontSize: 12, color: S.muted }}>-</span>;
  const c = level.startsWith("A") ? { bg: "#fef3c7", fg: "#92400e" }
    : level.startsWith("B") ? { bg: "#dbeafe", fg: "#1e3a8a" }
    : { bg: S.greenMid, fg: S.greenDark };
  return (
    <span style={{ display: "inline-flex", background: c.bg, color: c.fg, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.04em" }}>
      {level}
    </span>
  );
}

function StatCard({ value, label, icon, color = S.green }: { value: React.ReactNode; label: string; icon: string; color?: string }) {
  const paths = icon.split(" M").map((s, i) => i === 0 ? s : "M" + s);
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "20px 22px", boxShadow: S.card, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: S.greenLight, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {paths.map((p, i) => <path key={i} d={p} />)}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 900, color: S.ink, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: S.sub, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

export default async function StaffDashboardPage() {
  const t = await getTranslations("dashboard.staff");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayDayOfWeek = new Date().getDay() || 7; // 1=Mon..7=Sun
  const todayFormatted = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const weekDates = getWeekDates();

  const { data: myClasses } = await supabase.from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))").eq("profile_id", user.id);

  const classList = (myClasses ?? []).map(row => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    const c = cls as { id?: string; name?: string; level_id?: string; levels?: { name?: string } | { name?: string }[] } | null;
    const lName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as { name?: string }).name);
    return c?.id ? { id: c.id, name: c.name ?? "", levelId: c.level_id ?? "", levelName: lName ?? "" } : null;
  }).filter(Boolean) as { id: string; name: string; levelId: string; levelName: string }[];

  const studentCounts: Record<string, number> = {};
  for (const c of classList) {
    const { count } = await supabase.from("students").select("id", { count: "exact", head: true }).eq("class_id", c.id);
    studentCounts[c.id] = count ?? 0;
  }

  const markedToday = new Set<string>();
  for (const c of classList) {
    const ids = (await supabase.from("students").select("id").eq("class_id", c.id)).data?.map(s => s.id) ?? [];
    if (ids.length) {
      const { count } = await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", today).in("student_id", ids);
      if ((count ?? 0) > 0) markedToday.add(c.id);
    }
  }

  const weeklyByClass: Record<string, Record<string, boolean>> = {};
  for (const c of classList) {
    const ids = (await supabase.from("students").select("id").eq("class_id", c.id)).data?.map(s => s.id) ?? [];
    const weekly: Record<string, boolean> = {};
    for (const d of weekDates) {
      if (!ids.length) { weekly[d] = false; continue; }
      const { count } = await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", d).in("student_id", ids);
      weekly[d] = (count ?? 0) > 0;
    }
    weeklyByClass[c.id] = weekly;
  }

  const classIdList = classList.map(c => c.id);
  const { data: timetableRows } = classIdList.length
    ? await supabase.from("timetable").select("id, class_id, day_of_week, start_time, end_time, room")
        .in("class_id", classIdList).order("day_of_week").order("start_time")
    : { data: [] };

  type TTRow = { id: string; class_id: string; day_of_week: number; start_time: string; end_time: string; room: string | null };
  const timetableByClass: Record<string, TTRow[]> = {};
  for (const s of timetableRows ?? []) {
    const slot = s as TTRow;
    if (!timetableByClass[slot.class_id]) timetableByClass[slot.class_id] = [];
    timetableByClass[slot.class_id]!.push(slot);
  }

  // Today's timetable sessions across all classes
  const todaysSessions = classList.flatMap(c =>
    (timetableByClass[c.id] ?? [])
      .filter(s => s.day_of_week === todayDayOfWeek)
      .map(s => ({ ...s, className: c.name, levelName: c.levelName, classId: c.id, studentCount: studentCounts[c.id] ?? 0, marked: markedToday.has(c.id) }))
  ).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const totalStudents = classList.reduce((a, c) => a + (studentCounts[c.id] ?? 0), 0);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const { data: assignments } = await supabase.from("assignments").select("id, title, due_date, level_id, class_id").order("due_date", { ascending: false }).limit(8);
  const taughtClasses = new Set(classList.map(c => c.id));
  const taughtLevels = new Set(classList.map(c => c.levelId));
  const myAssignments = (assignments ?? []).filter(a => {
    const cid = (a as { class_id?: string }).class_id, lid = (a as { level_id?: string }).level_id;
    return (cid && taughtClasses.has(cid)) || (lid && taughtLevels.has(lid));
  });

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Date header ──────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>
          {t("myClassesPage")}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>{todayFormatted}</h1>
      </div>

      {!classList.length ? (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 18, padding: "60px 32px", textAlign: "center", boxShadow: S.card }}>
          <p style={{ fontSize: 15, color: S.sub }}>{t("notAssigned")}</p>
        </div>
      ) : (
        <>
          {/* ── Quick stats ─────────────────────────────────── */}
          <div className="cd-grid-stats-3" style={{ marginBottom: 24 }}>
            <StatCard icon="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" label={t("myClasses")} value={classList.length} />
            <StatCard icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" label={t("students")} value={totalStudents} />
            <StatCard icon="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" label="Marked today" value={`${markedToday.size}/${classList.length}`} color={markedToday.size === classList.length ? S.green : S.amber} />
          </div>

          {/* ── Today's sessions ────────────────────────────── */}
          <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink, marginBottom: 14 }}>Today&apos;s Sessions</h2>
          {todaysSessions.length === 0 ? (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "24px 20px", marginBottom: 24, boxShadow: S.card, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: S.muted }}>No sessions scheduled for today.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {todaysSessions.map(s => (
                <div key={s.id} style={{
                  background: S.surface, border: `1.5px solid ${s.marked ? S.green + "40" : S.border}`,
                  borderLeft: `4px solid ${s.marked ? S.green : "#e2e8f0"}`,
                  borderRadius: 14, padding: "18px 20px",
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  boxShadow: S.card,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: S.ink }}>{s.className}</span>
                      <LevelBadge level={s.levelName} />
                    </div>
                    <div style={{ fontSize: 13, color: S.sub }}>
                      {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                      {s.room ? ` · Room ${s.room}` : ""}
                      {" · "}{s.studentCount} students
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {s.marked ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: S.greenLight, color: S.greenDark, border: `1px solid ${S.greenMid}`, borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Marked
                      </span>
                    ) : (
                      <Link href={`/staff/attendance?class=${s.classId}&date=${today}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: S.green, color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        Mark Attendance
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── All classes attendance card ──────────────────── */}
          {todaysSessions.length === 0 && classList.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink, marginBottom: 14 }}>All Classes</h2>
              <div className="cd-grid-cards" style={{ marginBottom: 24 }}>
                {classList.map(c => {
                  const marked = markedToday.has(c.id);
                  const slots = timetableByClass[c.id] ?? [];
                  return (
                    <div key={c.id} style={{
                      background: S.surface, border: `1.5px solid ${marked ? S.green + "30" : S.border}`,
                      borderRadius: 16, padding: "20px", boxShadow: S.card,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: S.ink }}>{c.name}</h3>
                          <p style={{ fontSize: 12.5, color: S.sub, marginTop: 2 }}>
                            {c.levelName} · {studentCounts[c.id] ?? 0} students
                          </p>
                        </div>
                        <LevelBadge level={c.levelName} />
                      </div>
                      {slots.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                          {slots.slice(0, 3).map(sl => (
                            <span key={sl.id} style={{ fontSize: 11.5, fontWeight: 600, color: S.greenDark, background: S.greenLight, borderRadius: 7, padding: "3px 9px" }}>
                              {DAY_NAMES[sl.day_of_week]} {fmtTime(sl.start_time)}
                            </span>
                          ))}
                        </div>
                      )}
                      {!marked ? (
                        <Link href={`/staff/attendance?class=${c.id}&date=${today}`}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", background: S.green, color: "#fff", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          {t("markNow")}
                        </Link>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: S.greenLight, color: S.greenDark, borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, border: `1px solid ${S.greenMid}` }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="20 6 9 17 4 12"/></svg>
                          {t("attendanceMarked")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Weekly summary ───────────────────────────────── */}
          <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink, marginBottom: 14 }}>This Week&apos;s Attendance</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {classList.map(c => (
              <div key={c.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: S.card }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>{c.name}</span>
                    <span style={{ fontSize: 12.5, color: S.muted, marginLeft: 8 }}>{studentCounts[c.id] ?? 0} students</span>
                  </div>
                  <LevelBadge level={c.levelName} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {weekDates.map((d, i) => {
                    const marked = weeklyByClass[c.id]?.[d] ?? false;
                    const isToday = d === today;
                    return (
                      <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 10, padding: "10px 6px", textAlign: "center",
                        background: marked ? S.greenLight : isToday ? "#f8fafc" : "#f1f5f9",
                        border: `1.5px solid ${isToday ? S.green + "60" : marked ? S.greenMid : S.border}` }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: S.muted, marginBottom: 4 }}>{dayLabels[i]}</span>
                        {marked
                          ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={S.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span style={{ width: 8, height: 8, borderRadius: "50%", background: isToday ? S.amber : "#cbd5e1" }} />
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Upcoming assignments ─────────────────────────── */}
          {myAssignments.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink, marginBottom: 14 }}>Upcoming Assignments</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myAssignments.slice(0, 5).map(a => (
                  <div key={(a as { id: string }).id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "14px 18px", boxShadow: S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>{(a as { title: string }).title}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: S.muted }}>
                      {(a as { due_date: string | null }).due_date
                        ? new Date((a as { due_date: string }).due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "No due date"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
