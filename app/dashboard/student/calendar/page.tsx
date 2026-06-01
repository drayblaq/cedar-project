import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser } from "@/lib/student-auth";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec" };

const TYPE_COLOR: Record<string, string> = {
  holiday: "#2ea82a", exam: "#b3402f", deadline: "#d4a843", other: "#3f7d8c",
};
const TYPE_TONE: Record<string, { bg: string; fg: string }> = {
  holiday:  { bg: "rgba(46,168,42,.12)",  fg: "#1a6b18" },
  exam:     { bg: "rgba(201,74,58,.12)",   fg: "#b3402f" },
  deadline: { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
  other:    { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" },
};

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getDaysOfWeek(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default async function StudentCalendarPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const t = await getTranslations("dashboard.student");
  const searchParams = await props.searchParams;
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  const queryDate = searchParams.date ? new Date(searchParams.date) : new Date();
  if (isNaN(queryDate.getTime())) queryDate.setTime(new Date().getTime());

  const startOfWeek = getStartOfWeek(queryDate);
  const days = getDaysOfWeek(startOfWeek);
  const weekStartStr = days[0].toISOString().slice(0, 10);
  const weekEndStr = days[6].toISOString().slice(0, 10);

  const prevWeek = new Date(startOfWeek);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(startOfWeek);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const supabase = await createClient();
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
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>
            {t("weeklyCalendar")}
          </h1>
          <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{t("schedule")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/student/calendar?date=${prevWeek.toISOString().slice(0, 10)}`}
            className="cd-btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>
            ←
          </Link>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, minWidth: 180, textAlign: "center" }}>
            {days[0].toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
            {" – "}
            {days[6].toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <Link href={`/student/calendar?date=${nextWeek.toISOString().slice(0, 10)}`}
            className="cd-btn-ghost" style={{ padding: "8px 12px", textDecoration: "none" }}>
            →
          </Link>
          <Link href="/student/calendar" className="cd-mini-btn" style={{ textDecoration: "none" }}>
            {t("today")}
          </Link>
        </div>
      </div>

      {/* Week grid */}
      <div className="cd-card" style={{ padding: 0, overflowX: "auto" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
          {days.map((day, i) => {
            const isToday = day.toISOString().slice(0, 10) === todayStr;
            return (
              <div key={i} style={{ padding: "12px 8px", textAlign: "center",
                borderRight: i < 6 ? `1px solid ${C.border}` : "none",
                background: isToday ? C.greenWash : "transparent" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: isToday ? C.green : C.muted, marginBottom: 4 }}>
                  {DAY_NAMES[i]}
                </div>
                <div style={{ width: 30, height: 30, borderRadius: "50%", margin: "0 auto",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                  background: isToday ? C.green : "transparent",
                  color: isToday ? "#fff" : C.ink }}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Events row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: 120 }}>
          {days.map((day, i) => {
            const dayStr = day.toISOString().slice(0, 10);
            const dayEvents = eventsByDay[dayStr] ?? [];
            return (
              <div key={i} style={{ padding: "10px 8px", borderRight: i < 6 ? `1px solid ${C.border}` : "none",
                display: "flex", flexDirection: "column", gap: 6 }}>
                {dayEvents.map((e) => {
                  const tn = TYPE_TONE[e.event_type] ?? TYPE_TONE.other;
                  return (
                    <div key={e.id} style={{ background: tn.bg, color: tn.fg,
                      fontSize: 11.5, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
                      lineHeight: 1.3 }}>
                      {e.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      {(events ?? []).length > 0 && (
        <div className="cd-card" style={{ padding: 22, marginTop: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>This week</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {(events ?? []).map((e) => {
              const dd = e.event_date.split("-")[2];
              const mon = new Date(e.event_date).toLocaleDateString("en-GB", { month: "short" });
              const tn = TYPE_TONE[e.event_type] ?? TYPE_TONE.other;
              return (
                <div key={e.id} style={{ display: "flex", gap: 13, alignItems: "center" }}>
                  <div style={{ width: 46, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{dd}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>{mon}</div>
                  </div>
                  <div style={{ width: 3, alignSelf: "stretch", borderRadius: 3,
                    background: TYPE_COLOR[e.event_type] ?? TYPE_COLOR.other }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{e.title}</div>
                    <span style={{ display: "inline-flex", marginTop: 4, background: tn.bg, color: tn.fg,
                      fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 7,
                      textTransform: "capitalize" }}>{e.event_type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
