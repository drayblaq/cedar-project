import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser } from "@/lib/student-auth";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec" };

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_COLOR: Record<string, string> = {
  holiday: "#2ea82a", exam: "#b3402f", deadline: "#d4a843", other: "#3f7d8c",
};
const TYPE_TONE: Record<string, { bg: string; fg: string }> = {
  holiday:  { bg: "rgba(46,168,42,.12)",  fg: "#1a6b18" },
  exam:     { bg: "rgba(201,74,58,.12)",   fg: "#b3402f" },
  deadline: { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
  other:    { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" },
};

function fmtTime(t: string) { return t.slice(0, 5); }

export default async function StudentCalendarPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const t = await getTranslations("dashboard.student");
  const searchParams = await props.searchParams;
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  const supabase = await createClient();

  // ── Section A: Weekly timetable ───────────────────────────────────────────
  type TimetableSlot = {
    id: string; class_id: string; day_of_week: number;
    start_time: string; end_time: string; room: string | null;
    classes: { name: string; levels: { name: string } | null } | null;
  };

  let timetableSlots: TimetableSlot[] = [];

  if (result.student?.level_id) {
    const { data: studentClasses } = await supabase
      .from("classes")
      .select("id")
      .eq("level_id", result.student.level_id);

    const classIds = (studentClasses ?? []).map(c => c.id);
    if (classIds.length) {
      const { data: slots } = await supabase
        .from("timetable")
        .select("*, classes(name, levels(name))")
        .in("class_id", classIds)
        .order("day_of_week")
        .order("start_time");
      timetableSlots = (slots ?? []) as TimetableSlot[];
    }
  }

  // Group by day_of_week — only days that have sessions
  const slotsByDay: Record<number, TimetableSlot[]> = {};
  for (const s of timetableSlots) {
    if (!slotsByDay[s.day_of_week]) slotsByDay[s.day_of_week] = [];
    slotsByDay[s.day_of_week]!.push(s);
  }
  const activeDays = [1, 2, 3, 4, 5, 6].filter(d => slotsByDay[d]?.length);

  // ── Section B: Upcoming events (existing) ────────────────────────────────
  const queryDate = searchParams.date ? new Date(searchParams.date) : new Date();
  if (isNaN(queryDate.getTime())) queryDate.setTime(new Date().getTime());

  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
  function getDaysOfWeek(start: Date) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i); return d;
    });
  }

  const startOfWeek = getStartOfWeek(queryDate);
  const days = getDaysOfWeek(startOfWeek);
  const weekStartStr = days[0].toISOString().slice(0, 10);
  const weekEndStr = days[6].toISOString().slice(0, 10);
  const prevWeek = new Date(startOfWeek); prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(startOfWeek); nextWeek.setDate(nextWeek.getDate() + 7);

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, event_date, event_type")
    .gte("event_date", weekStartStr)
    .lte("event_date", weekEndStr)
    .order("event_date", { ascending: true });

  const eventsByDay: Record<string, typeof events> = {};
  for (const e of events ?? []) {
    if (!eventsByDay[e.event_date]) eventsByDay[e.event_date] = [];
    eventsByDay[e.event_date]!.push(e);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const WEEK_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ padding: "30px 0 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>
          {t("weeklyCalendar")}
        </h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{t("schedule")}</p>
      </div>

      {/* ── SECTION A: Weekly recurring timetable ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Weekly Timetable</h2>

        {!activeDays.length ? (
          <div className="cd-card" style={{ padding: "32px 24px", textAlign: "center" }}>
            <p style={{ color: C.muted, fontSize: 13.5 }}>No recurring schedule set yet. Check back after your class is configured.</p>
          </div>
        ) : (
          <div className="cd-timetable-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${activeDays.length}, minmax(140px, 1fr))`, gap: 12, overflowX: "auto" }}>
            {activeDays.map(day => (
              <div key={day} className="cd-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Day header */}
                <div style={{ background: C.greenWash, borderBottom: `1px solid ${C.border}`, padding: "10px 14px" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: C.green }}>
                    {DAY_NAMES[day]}
                  </span>
                </div>
                {/* Slots */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {(slotsByDay[day] ?? []).map((slot, i) => {
                    const cls = slot.classes;
                    const lvl = Array.isArray(cls?.levels) ? cls?.levels[0] : cls?.levels;
                    return (
                      <div key={slot.id} style={{ padding: "12px 14px", borderBottom: i < (slotsByDay[day]?.length ?? 1) - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                          {cls?.name ?? "Class"}
                        </div>
                        {lvl && (
                          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 4 }}>
                            {(lvl as { name?: string }).name}
                          </div>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "4px 8px", display: "inline-block" }}>
                          {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                        </div>
                        {slot.room && (
                          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{slot.room}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION B: Upcoming events (weekly calendar) ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Upcoming Events</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/student/calendar?date=${prevWeek.toISOString().slice(0, 10)}`}
              className="cd-btn-ghost" style={{ padding: "7px 12px", textDecoration: "none" }}>←</Link>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, minWidth: 180, textAlign: "center" }}>
              {days[0].toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
              {" – "}
              {days[6].toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <Link href={`/student/calendar?date=${nextWeek.toISOString().slice(0, 10)}`}
              className="cd-btn-ghost" style={{ padding: "7px 12px", textDecoration: "none" }}>→</Link>
            <Link href="/student/calendar" className="cd-mini-btn" style={{ textDecoration: "none" }}>
              {t("today")}
            </Link>
          </div>
        </div>

        {/* Week grid */}
        <div className="cd-card" style={{ padding: 0, overflowX: "auto" }}>
          {/* Day headers */}
          <div className="cd-week-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
            {days.map((day, i) => {
              const isToday = day.toISOString().slice(0, 10) === todayStr;
              return (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderRight: i < 6 ? `1px solid ${C.border}` : "none", background: isToday ? C.greenWash : "transparent" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: isToday ? C.green : C.muted, marginBottom: 4 }}>
                    {WEEK_DAY_NAMES[i]}
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, background: isToday ? C.green : "transparent", color: isToday ? "#fff" : C.ink }}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Event rows */}
          <div className="cd-week-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: 80 }}>
            {days.map((day, i) => {
              const dayStr = day.toISOString().slice(0, 10);
              const dayEvents = eventsByDay[dayStr] ?? [];
              return (
                <div key={i} style={{ padding: "10px 8px", borderRight: i < 6 ? `1px solid ${C.border}` : "none", display: "flex", flexDirection: "column", gap: 5 }}>
                  {dayEvents.map(e => {
                    const tn = TYPE_TONE[e.event_type] ?? TYPE_TONE.other;
                    return (
                      <div key={e.id} style={{ background: tn.bg, color: tn.fg, fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 6, lineHeight: 1.3 }}>
                        {e.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event list for the week */}
        {(events ?? []).length > 0 && (
          <div className="cd-card" style={{ padding: 22, marginTop: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>This week</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(events ?? []).map(e => {
                const dd = e.event_date.split("-")[2];
                const mon = new Date(e.event_date).toLocaleDateString("en-GB", { month: "short" });
                const tn = TYPE_TONE[e.event_type] ?? TYPE_TONE.other;
                return (
                  <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{dd}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{mon}</div>
                    </div>
                    <div style={{ width: 3, alignSelf: "stretch", borderRadius: 3, background: TYPE_COLOR[e.event_type] ?? TYPE_COLOR.other }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{e.title}</div>
                      <span style={{ display: "inline-flex", marginTop: 3, background: tn.bg, color: tn.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, textTransform: "capitalize" }}>{e.event_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
