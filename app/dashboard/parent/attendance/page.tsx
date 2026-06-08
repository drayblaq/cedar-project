import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };

const TONE: Record<string,{bg:string;fg:string}> = {
  present: { bg:"rgba(46,168,42,.12)",  fg:"#1a6b18" },
  late:    { bg:"rgba(212,168,67,.16)", fg:"#9a7822" },
  absent:  { bg:"rgba(201,74,58,.12)",  fg:"#b3402f" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

function Ring({ value, size=130, stroke=12 }: { value:number; size?:number; stroke?:number }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, off=circ*(1-value/100);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.greenWash} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.green} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.26, fontWeight:800, color:C.ink }}>{value}%</span>
        <span style={{ fontSize:10.5, fontWeight:600, color:C.muted, marginTop:1 }}>present</span>
      </div>
    </div>
  );
}

export default async function ParentAttendancePage() {
  const t = await getTranslations("dashboard.parent");
  const ts = await getTranslations("dashboard.status");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
  const studentIds = (links ?? []).map(l => l.student_id);

  if (!studentIds.length) {
    return (
      <div>
        <h1 style={{ fontSize:23, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>Attendance</h1>
        <div className="cd-card" style={{ marginTop:24, padding:40, textAlign:"center" }}>
          <p style={{ color:C.muted }}>{t("noChildren")}</p>
        </div>
      </div>
    );
  }

  const { data: students } = await supabase.from("students")
    .select("id, full_name, levels(name)").in("id", studentIds);

  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);

  const childData = await Promise.all((students ?? []).map(async s => {
    const lvl = Array.isArray(s.levels) ? (s.levels[0] as {name?:string})?.name : (s.levels as {name?:string}|null)?.name;
    const { data: rows } = await supabase.from("attendance")
      .select("date, status").eq("student_id", s.id)
      .gte("date", thirtyDaysAgo).order("date", { ascending:false });
    const total = rows?.length ?? 0;
    const present = rows?.filter(r=>r.status==="present"||r.status==="late").length ?? 0;
    const pct = total>0 ? Math.round((present/total)*100) : 0;
    return { id:s.id, full_name:s.full_name, level:lvl ?? "—", rows:rows ?? [], total, present, pct };
  }));

  const first = childData[0];

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Attendance</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>
          {first.full_name} · {first.level} · last 30 days
        </p>
      </div>

      {/* Child switcher if multiple */}
      {childData.length > 1 && (
        <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
          {childData.map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, background:C.greenWash,
              border:`1.5px solid ${C.green}`, borderRadius:11, padding:"6px 14px 6px 6px" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:C.green, color:"#fff",
                display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:10 }}>
                {c.full_name.split(" ").map((p: string)=>p[0]).slice(0,2).join("").toUpperCase()}
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:"#1a6b18" }}>{c.full_name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}

      {childData.map(child => (
        <div key={child.id} style={{ marginBottom: childData.length > 1 ? 32 : 0 }}>
          {childData.length > 1 && (
            <h2 style={{ fontSize:16, fontWeight:700, color:C.ink, marginBottom:14 }}>{child.full_name}</h2>
          )}
          <div className="cd-grid-2-1">
            <div className="cd-card" style={{ padding:24, display:"flex", alignItems:"center", gap:24 }}>
              <Ring value={child.pct} />
              <div>
                <h3 style={{ fontSize:17, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("attendanceSummary")}</h3>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>
                  {child.total > 0
                    ? `${child.present} of ${child.total} sessions attended.`
                    : t("noAttendance30")}
                </p>
              </div>
            </div>

            <div className="cd-card" style={{ padding:0 }}>
              <div style={{ padding:"18px 22px 6px" }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Recent sessions</h3>
              </div>
              {!child.rows.length ? (
                <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted }}>{t("noAttendance30")}</p>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                    <thead><tr>
                      <th style={{ textAlign:"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>Date</th>
                      <th style={{ textAlign:"right", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>Status</th>
                    </tr></thead>
                    <tbody>
                      {child.rows.map(r => {
                        const tn = TONE[r.status] ?? TONE.absent;
                        return (
                          <tr key={r.date} className="cd-trow">
                            <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink }}>{fmtDate(r.date)}</td>
                            <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                              <span style={{ display:"inline-flex", background:tn.bg, color:tn.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7 }}>
                                {ts((r.status === "late" ? "absent" : r.status) as "present"|"absent")}
                              </span>
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
      ))}
    </div>
  );
}
