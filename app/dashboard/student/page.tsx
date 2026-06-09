import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenDeep:"#0e3b0c", greenWash:"#eef6ec", greenBright:"#6fdc6a" };

function Ring({ value, size=92, stroke=9, label, color=C.green }: { value:number; size?:number; stroke?:number; label?:string; color?:string }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, off = circ*(1-value/100);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.greenWash} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.26, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>{value}%</span>
        {label && <span style={{ fontSize:10.5, fontWeight:600, color:C.muted, marginTop:1 }}>{label}</span>}
      </div>
    </div>
  );
}

function LevelTrack({ current }: { current: string }) {
  const order = ["A1","A2","B1","B2","C1","C2"];
  const idx = order.indexOf(current);
  return (
    <div style={{ display:"flex", alignItems:"center", minWidth:0, width:"100%" }}>
      {order.map((l, i) => (
        <div key={l} style={{ display:"flex", alignItems:"center", flex: i<order.length-1?1:"0 0 auto", minWidth:0 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11.5, fontWeight:800, flexShrink:0,
            background: i<=idx ? "#fff" : "rgba(255,255,255,.15)", color: i<=idx ? C.greenDeep : "rgba(255,255,255,.5)",
            boxShadow: i===idx ? "0 0 0 3px rgba(111,220,106,.6)" : "none" }}>{l}</div>
          {i<order.length-1 && <div style={{ flex:1, height:3, background: i<idx ? C.greenBright : "rgba(255,255,255,.15)", borderRadius:3, minWidth:8 }} />}
        </div>
      ))}
    </div>
  );
}

export default async function StudentDashboardPage() {
  const t = await getTranslations("dashboard.student");
  const result = await getStudentForCurrentUser();

  if (!result?.student) {
    return (
      <div style={{ padding:"30px 30px 60px" }}>
        <h1 style={{ fontSize:23, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>{t("progress")}</h1>
        <p style={{ marginTop:8, fontSize:14, color:C.muted, maxWidth:560, lineHeight:1.6 }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const { student } = result;
  const supabase = await createClient();

  const { data: attendanceRows } = await supabase.from("attendance").select("status").eq("student_id", student.id);
  const total = attendanceRows?.length ?? 0;
  const presentOrLate = attendanceRows?.filter(r => r.status==="present"||r.status==="late").length ?? 0;
  const attendancePct = total>0 ? Math.round((presentOrLate/total)*100) : 0;

  const { data: grades } = await supabase
    .from("grades").select("id, subject_or_type, score, academic_terms(name)")
    .eq("student_id", student.id).order("created_at",{ascending:false}).limit(8);
  const scored = (grades ?? []).map(g=>Number(g.score)).filter(n=>!isNaN(n));
  const avgScore = scored.length ? Math.round(scored.reduce((a,b)=>a+b,0)/scored.length) : 0;

  const today = new Date().toISOString().slice(0,10);
  const { data: events } = await supabase
    .from("calendar_events").select("id, title, event_date, event_type")
    .gte("event_date", today).order("event_date",{ascending:true}).limit(4);

  const level = levelName(student.levels);
  const firstName = student.full_name.split(" ")[0];
  const knownLevel = ["A1","A2","B1","B2","C1","C2"].includes(level) ? level : "A1";

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("welcome")}, {firstName} 👋</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{t("progress")}</p>
      </div>

      {total === 0 && (grades?.length ?? 0) === 0 && (
        <div className="cd-card" style={{ padding:"24px 26px", marginBottom:18, background:C.greenWash, border:`1px solid ${C.green}` }}>
          <p style={{ fontSize:14.5, fontWeight:700, color:C.greenDeep }}>Your dashboard will fill up as your classes progress. Welcome to Cedar!</p>
        </div>
      )}

      {/* Gradient hero */}
      <div className="cd-card" style={{ marginBottom:18, background:"linear-gradient(120deg, #0e3b0c, #15561a)", border:"none", color:"#fff", padding:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.greenBright, marginBottom:8 }}>Current level</div>
            <div style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.02em", lineHeight:1.12 }}>{level}</div>
            <div style={{ fontSize:13.5, opacity:.8, marginTop:10 }}>
              {student.email}{student.enrollment_date ? ` · enrolled ${new Date(student.enrollment_date).toLocaleDateString("en-GB",{month:"short",year:"numeric"})}` : ""}
            </div>
          </div>
          <LevelTrack current={knownLevel} />
        </div>
      </div>

      {/* Stat rings */}
      <div className="cd-grid-stats-3">
        <div className="cd-card" style={{ padding:22, display:"flex", alignItems:"center", gap:16 }}>
          <Ring value={attendancePct} label={t("attendance").toLowerCase()} />
          <div>
            <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{t("attendanceRate")}</div>
            <div style={{ fontSize:12.5, color:C.muted, marginTop:3 }}>{presentOrLate} of {total} sessions.</div>
          </div>
        </div>
        <div className="cd-card" style={{ padding:22, display:"flex", alignItems:"center", gap:16 }}>
          <Ring value={avgScore} label={t("grades").toLowerCase()} color="#bf9636" />
          <div>
            <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{t("averageGrade")}</div>
            <div style={{ fontSize:12.5, color:C.muted, marginTop:3 }}>Across all skills.</div>
          </div>
        </div>
        <div className="cd-card" style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:C.greenWash, color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div>
            <div style={{ fontSize:27, fontWeight:800, color:C.ink, lineHeight:1 }}>{level}</div>
            <div style={{ fontSize:12.5, fontWeight:600, color:C.muted, marginTop:6 }}>Enrolled & active</div>
          </div>
        </div>
      </div>

      {/* Grades + upcoming */}
      <div className="cd-grid-2-1" style={{ marginTop:18 }}>
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{t("grades")}</h3>
            <Link href="/student/grades" style={{ color:C.green, fontSize:12.5, fontWeight:700, textDecoration:"none" }}>View all →</Link>
          </div>
          {!grades?.length ? (
            <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>{t("noGrades")}</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr>
                  {["Skill","Score"].map((h,i)=>(
                    <th key={h} style={{ textAlign:i===1?"center":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {grades.map((g: {id:string; subject_or_type:string; score:number|null}) => (
                    <tr key={g.id} className="cd-trow">
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink, textTransform:"capitalize" }}>{g.subject_or_type}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"center", fontWeight:800, color: g.score!=null && Number(g.score)>=85?"#1a8a2a":g.score!=null&&Number(g.score)>=70?"#9a7822":C.ink }}>{g.score ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cd-card" style={{ padding:22 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Upcoming</h3>
          {!events?.length ? (
            <p style={{ color:C.muted, fontSize:13 }}>{t("noAnnouncements")}</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {events.map(e => {
                const dd = e.event_date.split("-")[2];
                const mon = new Date(e.event_date).toLocaleDateString("en-GB",{month:"short"});
                return (
                  <div key={e.id} style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:42, textAlign:"center", flexShrink:0 }}>
                      <div style={{ fontSize:17, fontWeight:800, color:C.ink, lineHeight:1 }}>{dd}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase" }}>{mon}</div>
                    </div>
                    <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{e.title}</div></div>
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
