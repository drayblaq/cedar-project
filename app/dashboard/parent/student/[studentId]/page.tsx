import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };

function resolveNested<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }
function gradeTone(s: number | null): {bg:string;fg:string} {
  if (s == null) return { bg:"#eef2ec", fg:"#4a5a4d" };
  if (s >= 75) return { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" };
  if (s >= 50) return { bg:"rgba(212,168,67,.16)", fg:"#9a7822" };
  return { bg:"rgba(201,74,58,.12)", fg:"#b3402f" };
}
function attTone(status: string): {bg:string;fg:string} {
  if (status === "present") return { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" };
  if (status === "late") return { bg:"rgba(212,168,67,.16)", fg:"#9a7822" };
  return { bg:"rgba(201,74,58,.12)", fg:"#b3402f" };
}

export default async function ParentStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const t = await getTranslations("dashboard.parent");
  const tc = await getTranslations("dashboard.common");
  const ts = await getTranslations("dashboard.status");
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: link } = await supabase.from("parent_students").select("id").eq("parent_id", user.id).eq("student_id", studentId).maybeSingle();
  if (!link) redirect("/parent");

  const { data: student } = await supabase.from("students").select("id, full_name, email, phone, status, enrollment_date, levels(name)").eq("id", studentId).single();
  if (!student) notFound();

  const level = resolveNested(student.levels as {name?:string}|{name?:string}[]|null)?.name ?? "—";
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);

  const [attRes, gradesRes, announcementsRes] = await Promise.all([
    supabase.from("attendance").select("date, status").eq("student_id", studentId).gte("date", thirtyDaysAgo).order("date",{ascending:false}),
    supabase.from("grades").select("id, subject_or_type, score, remarks, created_at, academic_terms(name)").eq("student_id", studentId).order("created_at",{ascending:false}),
    supabase.from("announcements").select("id, title, body, published_at").order("published_at",{ascending:false}).limit(5),
  ]);

  // Timetable for the student's level
  const studentLevelId = resolveNested(student.levels as {name?:string}|{name?:string}[]|null) ? null : null; // placeholder
  const { data: studentClasses } = await supabase.from("classes").select("id").eq("level_id", (student as {level_id?:string}).level_id ?? "");
  const studentClassIds = (studentClasses ?? []).map((c:{id:string}) => c.id);
  type TTRow = { id: string; class_id: string; day_of_week: number; start_time: string; end_time: string; room: string | null; classes: { name: string } | null };
  const { data: timetableSlots } = studentClassIds.length
    ? await supabase.from("timetable").select("*, classes(name)").in("class_id", studentClassIds).order("day_of_week").order("start_time")
    : { data: [] };
  const slots = (timetableSlots ?? []) as TTRow[];
  const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function fmtTime(t: string) { return t.slice(0, 5); }

  const attRows = attRes.data ?? [];
  const presentCount = attRows.filter(r=>r.status==="present").length;
  const lateCount = attRows.filter(r=>r.status==="late").length;
  const absentCount = attRows.filter(r=>r.status==="absent").length;
  const totalAtt = attRows.length;
  const attPct = totalAtt>0 ? Math.round(((presentCount+lateCount)/totalAtt)*100) : null;

  const grades = gradesRes.data ?? [];
  const scores = grades.map(g=>Number(g.score)).filter(n=>!isNaN(n));
  const gradeAvg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
  const announcements = announcementsRes.data ?? [];

  const th = (label: string, align: "left"|"center"|"right" = "left") => (
    <th style={{ textAlign:align, padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{label}</th>
  );

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <Link href="/parent" style={{ fontSize:13, color:C.green, fontWeight:600, textDecoration:"none", display:"inline-block", marginBottom:16 }}>← {t("backToChildren")}</Link>

      {/* Overview */}
      <div className="cd-card" style={{ padding:24, marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16, alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:C.green }}>{t("overview")}</p>
            <h1 style={{ fontSize:26, fontWeight:800, color:C.ink, marginTop:4, letterSpacing:"-0.02em" }}>{student.full_name}</h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginTop:10, fontSize:13, color:C.muted }}>
              <span>{tc("level")}: <strong style={{color:C.ink}}>{level}</strong></span>
              {student.email && <span>{tc("email")}: <strong style={{color:C.ink}}>{student.email}</strong></span>}
              {(student as {phone?:string|null}).phone && <span>{tc("phone")}: <strong style={{color:C.ink}}>{(student as {phone?:string|null}).phone}</strong></span>}
            </div>
          </div>
          <span style={{ display:"inline-flex", background: student.status==="active"?"rgba(46,168,42,.12)":"#eef2ec", color: student.status==="active"?"#1a6b18":"#4a5a4d", fontSize:12.5, fontWeight:700, padding:"5px 13px", borderRadius:8, textTransform:"capitalize" }}>
            {ts(student.status as "active"|"pending"|"inactive")}
          </span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", marginTop:20, borderRadius:12, border:`1px solid ${C.border}`, background:"#f4f7f2", overflow:"hidden" }}>
          {[
            { label:t("attendanceSummary"), value: attPct!=null?`${attPct}%`:"—" },
            { label:ts("present"), value:presentCount },
            { label:ts("late"), value:lateCount },
            { label:ts("absent"), value:absentCount },
          ].map((stat,i) => (
            <div key={stat.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 8px", textAlign:"center", borderLeft: i>0?`1px solid ${C.border}`:"none" }}>
              <span style={{ fontSize:22, fontWeight:800, color:C.ink }}>{stat.value}</span>
              <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", color:C.muted, marginTop:4 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance */}
      <div className="cd-card" style={{ padding:0, marginBottom:18 }}>
        <div style={{ padding:"18px 22px 6px" }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{t("last30days")}</h2>
          {totalAtt>0 && <p style={{ fontSize:12.5, color:C.muted, marginTop:2 }}>{presentCount} {ts("present")} · {lateCount} {ts("late")} · {absentCount} {ts("absent")}</p>}
        </div>
        {!attRows.length ? (
          <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>{t("noAttendance30")}</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr>{th(tc("date"))}{th(tc("status"),"right")}</tr></thead>
              <tbody>
                {attRows.map(a => {
                  const tn = attTone(a.status);
                  return (
                    <tr key={a.date} className="cd-trow">
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.ink, fontWeight:600 }}>{fmtDate(a.date)}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                        <span style={{ display:"inline-flex", background:tn.bg, color:tn.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7 }}>{ts(a.status as "present"|"absent"|"late")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grades */}
      <div className="cd-card" style={{ padding:0, marginBottom:18 }}>
        <div style={{ padding:"18px 22px 6px", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{t("gradesSummary")}</h2>
          {gradeAvg!=null && <span style={{ fontSize:12.5, color:C.muted }}>{t("average")}: <strong style={{color:C.ink}}>{gradeAvg} / 100</strong></span>}
        </div>
        {!grades.length ? (
          <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>{t("noGrades")}</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr>{th(tc("name"))}{th(tc("score"),"center")}{th("Term")}{th(tc("notes"))}</tr></thead>
              <tbody>
                {grades.map(g => {
                  const term = resolveNested(g.academic_terms as {name?:string}|{name?:string}[]|null);
                  const tn = gradeTone(g.score!=null?Number(g.score):null);
                  return (
                    <tr key={g.id} className="cd-trow">
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink, textTransform:"capitalize" }}>{g.subject_or_type}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"center" }}>
                        {g.score!=null ? <span style={{ display:"inline-flex", background:tn.bg, color:tn.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7 }}>{g.score}</span> : <span style={{color:C.muted}}>—</span>}
                      </td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{term?.name ?? "—"}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, fontSize:12.5 }}>{(g as {remarks?:string|null}).remarks ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timetable */}
      <div className="cd-card" style={{ padding:22, marginBottom:18 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Weekly Schedule</h2>
        {!slots.length ? (
          <p style={{ color:C.muted, fontSize:13 }}>No schedule set yet.</p>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {slots.map(slot => (
              <span key={slot.id} style={{ fontSize:12.5, fontWeight:600, color:"#166534", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"7px 13px", whiteSpace:"nowrap" }}>
                {DAY_NAMES[slot.day_of_week]} · {fmtTime(slot.start_time)}–{fmtTime(slot.end_time)}{slot.room ? ` · ${slot.room}` : ""}
                {slot.classes && <span style={{ color:"#1a6b18", marginLeft:6, fontWeight:500 }}>({slot.classes.name})</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="cd-card" style={{ padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{t("latestAnnouncements")}</h2>
          <Link href="/parent/announcements" style={{ color:C.green, fontSize:12.5, fontWeight:700, textDecoration:"none" }}>{t("viewAllAnnouncements")} →</Link>
        </div>
        {!announcements.length ? (
          <p style={{ color:C.muted, fontSize:13 }}>{t("noAnnouncements")}</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {announcements.map(a => (
              <div key={a.id} style={{ paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{a.title}</p>
                  <time style={{ fontSize:11, color:C.muted, flexShrink:0 }}>{fmtDate(a.published_at)}</time>
                </div>
                {a.body && <p style={{ fontSize:12.5, color:C.muted, marginTop:4, lineHeight:1.6 }}>{a.body.slice(0,100)}{a.body.length>100?"…":""}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
