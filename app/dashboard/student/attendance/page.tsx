import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };
const TONE: Record<string,{bg:string;fg:string}> = {
  present:{bg:"rgba(46,168,42,.12)",fg:"#1a6b18"}, late:{bg:"rgba(212,168,67,.16)",fg:"#9a7822"}, absent:{bg:"rgba(201,74,58,.12)",fg:"#b3402f"},
};

function Ring({ value, size=130, stroke=12, label }: { value:number; size?:number; stroke?:number; label?:string }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, off=circ*(1-value/100);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.greenWash} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.green} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.26, fontWeight:800, color:C.ink }}>{value}%</span>
        {label && <span style={{ fontSize:10.5, fontWeight:600, color:C.muted, marginTop:1 }}>{label}</span>}
      </div>
    </div>
  );
}

export default async function StudentAttendancePage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const ts = await getTranslations("dashboard.status");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div style={{ padding:"30px 30px 60px" }}>
        <h1 style={{ fontSize:23, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>{t("myAttendance")}</h1>
        <p style={{ marginTop:8, fontSize:14, color:C.muted }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows } = await supabase.from("attendance").select("id, date, status").eq("student_id", result.student.id).order("date",{ascending:false}).limit(60);
  const total = rows?.length ?? 0;
  const presentOrLate = rows?.filter(r=>r.status==="present"||r.status==="late").length ?? 0;
  const pct = total>0 ? Math.round((presentOrLate/total)*100) : 0;

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("myAttendance")}</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{result.student.full_name} · {tc("level")}: {levelName(result.student.levels)}</p>
      </div>

      <div className="cd-grid-2-1">
        <div className="cd-card" style={{ padding:24, display:"flex", alignItems:"center", gap:24 }}>
          <Ring value={pct} label={ts("present").toLowerCase()} />
          <div>
            <h3 style={{ fontSize:17, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("attendanceRate")}</h3>
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, maxWidth:280 }}>
              {total>0 ? `${presentOrLate} ${t("ofDays")} ${total} ${t("days")}.` : t("noAttendance")}
            </p>
          </div>
        </div>

        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}><h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{t("summary")}</h3></div>
          {!rows?.length ? (
            <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted }}>{t("noAttendance")}</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr>
                  <th style={{ textAlign:"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{tc("date")}</th>
                  <th style={{ textAlign:"right", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{tc("status")}</th>
                </tr></thead>
                <tbody>
                  {rows.map(r => {
                    const tn = TONE[r.status] ?? TONE.absent;
                    return (
                      <tr key={r.id} className="cd-trow">
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink }}>{new Date(r.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                          <span style={{ display:"inline-flex", background:tn.bg, color:tn.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7 }}>{ts(r.status as "present"|"absent"|"late")}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
