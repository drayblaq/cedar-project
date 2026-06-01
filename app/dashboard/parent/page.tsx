import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };
const AVATAR = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function aColor(n:string){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return AVATAR[h%AVATAR.length];}
function ini(n:string){return n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();}
function resolveNested<T>(v: T | T[] | null): T | null { if (v==null) return null; return Array.isArray(v)?(v[0]??null):v; }

function MiniRing({ value, color=C.green, label }: { value:number; color?:string; label:string }) {
  const size=72, stroke=8, r=(size-stroke)/2, circ=2*Math.PI*r, off=circ*(1-value/100);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.greenWash} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:16, fontWeight:800, color:C.ink }}>{value}%</span>
        <span style={{ fontSize:8.5, fontWeight:600, color:C.muted }}>{label}</span>
      </div>
    </div>
  );
}

export default async function ParentDashboardPage() {
  const t = await getTranslations("dashboard.parent");
  const ts = await getTranslations("dashboard.status");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const parentName = (profile as { full_name?:string|null } | null)?.full_name ?? "";

  const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
  const studentIds = (links ?? []).map(l => l.student_id);

  if (!studentIds.length) {
    return (
      <div style={{ padding:"30px 30px 60px" }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("welcome")}{parentName?`, ${parentName.split(" ")[0]}`:""}</h1>
        <div className="cd-card" style={{ marginTop:24, padding:32, textAlign:"center", background:"rgba(212,168,67,.07)", borderColor:"rgba(212,168,67,.3)" }}>
          <p style={{ fontSize:16, fontWeight:700, color:"#9a7822" }}>{t("myChildren")}</p>
          <p style={{ fontSize:13.5, color:"#9a7822", marginTop:8, opacity:.85 }}>{t("noChildren")}</p>
        </div>
      </div>
    );
  }

  const { data: students } = await supabase.from("students").select("id, full_name, status, levels(name)").in("id", studentIds);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);

  const summaries = [];
  for (const s of students ?? []) {
    const lvl = resolveNested(s.levels as {name?:string}|{name?:string}[]|null)?.name ?? "—";
    const { data: att } = await supabase.from("attendance").select("status").eq("student_id", s.id).gte("date", monthStart);
    const totalM = att?.length ?? 0;
    const presM = att?.filter(r=>r.status==="present"||r.status==="late").length ?? 0;
    const attPct = totalM>0 ? Math.round((presM/totalM)*100) : 0;
    const { data: gr } = await supabase.from("grades").select("score").eq("student_id", s.id).not("score","is",null);
    const scores = (gr ?? []).map(g=>Number(g.score)).filter(n=>!isNaN(n));
    const gradeAvg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    summaries.push({ id:s.id, full_name:s.full_name, status:s.status ?? "pending", level:lvl, attPct, gradeAvg });
  }

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("welcome")}{parentName?`, ${parentName.split(" ")[0]}`:""}</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{t("progressDesc")}</p>
      </div>

      <div className="cd-grid-cards">
        {summaries.map(s => (
          <div key={s.id} className="cd-card" style={{ padding:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:18 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", flexShrink:0, background:aColor(s.full_name), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:17 }}>{ini(s.full_name)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.ink }}>{s.full_name}</h2>
                <p style={{ fontSize:12.5, color:C.muted, marginTop:2 }}>Level {s.level}</p>
              </div>
              <span style={{ display:"inline-flex", background: s.status==="active"?"rgba(46,168,42,.12)":"#eef2ec", color: s.status==="active"?"#1a6b18":"#4a5a4d", fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:7, textTransform:"capitalize" }}>
                {ts(s.status as "active"|"pending"|"inactive")}
              </span>
            </div>

            <div style={{ display:"flex", gap:16, justifyContent:"space-around", padding:"4px 0 16px" }}>
              <MiniRing value={s.attPct} label={t("present").toLowerCase()} />
              <MiniRing value={s.gradeAvg} color="#bf9636" label={t("average").toLowerCase()} />
            </div>

            <Link href={`/parent/student/${s.id}`} className="cd-btn-primary" style={{ width:"100%", justifyContent:"center", textDecoration:"none" }}>
              {t("viewDetails")} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
