import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

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

export default async function StaffDashboardPage() {
  const t = await getTranslations("dashboard.staff");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString(undefined, { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const weekDates = getWeekDates();

  const { data: myClasses } = await supabase.from("staff_classes").select("class_id, classes(id, name, level_id, levels(name))").eq("profile_id", user.id);
  const classList = (myClasses ?? []).map((row) => {
    const cls = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    const c = cls as { id?:string; name?:string; level_id?:string; levels?:{name?:string}|{name?:string}[] } | null;
    const levelName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as {name?:string}).name);
    return c?.id ? { id:c.id, name:c.name ?? "", levelId:c.level_id ?? "", levelName:levelName ?? "" } : null;
  }).filter(Boolean) as { id:string; name:string; levelId:string; levelName:string }[];

  const studentCounts: Record<string,number> = {};
  for (const c of classList) {
    const { count } = await supabase.from("students").select("id",{count:"exact",head:true}).eq("level_id", c.levelId);
    studentCounts[c.id] = count ?? 0;
  }

  const markedToday = new Set<string>();
  for (const c of classList) {
    const ids = (await supabase.from("students").select("id").eq("level_id", c.levelId)).data?.map(s=>s.id) ?? [];
    if (ids.length) {
      const { count } = await supabase.from("attendance").select("id",{count:"exact",head:true}).eq("date",today).in("student_id",ids);
      if ((count ?? 0) > 0) markedToday.add(c.id);
    }
  }

  const weeklyByClass: Record<string, Record<string,boolean>> = {};
  for (const c of classList) {
    const ids = (await supabase.from("students").select("id").eq("level_id", c.levelId)).data?.map(s=>s.id) ?? [];
    const weekly: Record<string,boolean> = {};
    for (const d of weekDates) {
      if (!ids.length) { weekly[d]=false; continue; }
      const { count } = await supabase.from("attendance").select("id",{count:"exact",head:true}).eq("date",d).in("student_id",ids);
      weekly[d] = (count ?? 0) > 0;
    }
    weeklyByClass[c.id] = weekly;
  }

  const { data: assignments } = await supabase.from("assignments").select("id, title, due_date, level_id, class_id").order("due_date",{ascending:false}).limit(10);

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

  const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmtTime(t: string) { return t.slice(0, 5); }
  const myIds = new Set<string>();
  const taughtLevels = new Set(classList.map(c=>c.levelId));
  const taughtClasses = new Set(classList.map(c=>c.id));
  for (const a of assignments ?? []) {
    const cid=(a as {class_id?:string}).class_id, lid=(a as {level_id?:string}).level_id;
    if (cid && taughtClasses.has(cid)) myIds.add((a as {id:string}).id);
    if (lid && taughtLevels.has(lid)) myIds.add((a as {id:string}).id);
  }
  const myAssignments = (assignments ?? []).filter(a=>myIds.has((a as {id:string}).id));
  const dayLabels = ["Mon","Tue","Wed","Thu","Fri"];

  const totalStudents = classList.reduce((a,c)=>a+(studentCounts[c.id]??0),0);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("myClassesPage")}</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{t("staffDesc")}</p>
      </div>

      {!classList.length ? (
        <div className="cd-card" style={{ padding:40, textAlign:"center" }}><p style={{ color:C.muted }}>{t("notAssigned")}</p></div>
      ) : (
        <>
          {/* Stats */}
          <div className="cd-grid-stats-3" style={{ marginBottom:18 }}>
            <StatCard icon="layers" label={t("myClasses")} value={classList.length} tone="green" />
            <StatCard icon="users"  label={t("students")} value={totalStudents} tone="blue" />
            <StatCard icon="check"  label={t("todayAttendance")} value={`${markedToday.size}/${classList.length}`} tone="gold" />
          </div>

          {/* Today's attendance */}
          <h2 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:12 }}>{t("todayAttendance")}</h2>
          <div className="cd-grid-cards" style={{ marginBottom:24 }}>
            {classList.map(c => {
              const marked = markedToday.has(c.id);
              return (
                <div key={c.id} className="cd-card" style={{ padding:20, background: marked?"rgba(46,168,42,.06)":"rgba(212,168,67,.07)", borderColor: marked?"rgba(46,168,42,.2)":"rgba(212,168,67,.3)" }}>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color: marked?C.green:"#9a7822" }}>{todayFormatted}</p>
                  <p style={{ fontSize:15.5, fontWeight:700, color:C.ink, marginTop:4 }}>{c.name}</p>
                  <p style={{ fontSize:12.5, color:C.muted, marginTop:2 }}>{c.levelName} · {studentCounts[c.id] ?? 0} students</p>
                  {/* Timetable pills */}
                  {(timetableByClass[c.id] ?? []).length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
                      {(timetableByClass[c.id] ?? []).map(slot => (
                        <span key={slot.id} style={{ fontSize:11.5, fontWeight:600, color:"#166534", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"4px 10px", whiteSpace:"nowrap" }}>
                          {DAY_NAMES[slot.day_of_week]} · {fmtTime(slot.start_time)}–{fmtTime(slot.end_time)}{slot.room ? ` · ${slot.room}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize:13, fontWeight:700, marginTop:10, color: marked?C.greenDark:"#9a7822" }}>{marked ? t("attendanceMarked") : t("attendanceNotMarked")}</p>
                  {!marked && (
                    <Link href={`/staff/attendance?class=${c.id}&date=${today}`} className="cd-btn-primary" style={{ marginTop:14, width:"100%", justifyContent:"center", textDecoration:"none" }}>{t("markNow")}</Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly summary */}
          <h2 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:12 }}>{t("weekSummary")}</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            {classList.map(c => (
              <div key={c.id} className="cd-card" style={{ padding:18 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:12 }}>{c.name}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {weekDates.map((d,i) => {
                    const marked = weeklyByClass[c.id]?.[d] ?? false;
                    const isToday = d === today;
                    return (
                      <div key={d} style={{ display:"flex", flexDirection:"column", alignItems:"center", borderRadius:11, padding:"8px 12px", minWidth:52, textAlign:"center",
                        background: marked?"rgba(46,168,42,.1)":"#f4f7f2", border:`1px solid ${isToday?"rgba(46,168,42,.4)":C.border}` }}>
                        <span style={{ fontSize:11, fontWeight:700, color:C.muted }}>{dayLabels[i]}</span>
                        <span style={{ fontSize:16, fontWeight:800, marginTop:2, color: marked?C.green:"#cbd5cb" }}>{marked?"✓":"—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Assignments */}
          {myAssignments.length > 0 && (
            <>
              <h2 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:12 }}>{t("assignmentsForClasses")}</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {myAssignments.map((a:{id:string;title:string;due_date:string|null}) => (
                  <div key={a.id} className="cd-card" style={{ padding:"14px 18px" }}>
                    <p style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{a.title}</p>
                    <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>{t("due")}: {a.due_date ? new Date(a.due_date).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : t("noDueDate")}</p>
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

function StatCard({ icon, label, value, tone="green" }: { icon:string; label:string; value:React.ReactNode; tone?:"green"|"gold"|"blue"|"dark" }) {
  const toneColors = { green:C.green, gold:"#bf9636", blue:"#3f7d8c", dark:"#0e3b0c" };
  const PATHS: Record<string,string> = {
    layers:"M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    check:"M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  };
  const d=PATHS[icon]; const paths=d?d.split(" M").map((s,i)=>i===0?s:"M"+s):[];
  return (
    <div className="cd-card" style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:11, background:C.greenWash, color:toneColors[tone], display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{paths.map((p,i)=><path key={i} d={p}/>)}</svg>
      </div>
      <div>
        <div style={{ fontSize:27, fontWeight:800, color:C.ink, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12.5, fontWeight:600, color:C.muted, marginTop:6 }}>{label}</div>
      </div>
    </div>
  );
}
