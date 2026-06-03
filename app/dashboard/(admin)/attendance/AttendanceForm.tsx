"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Student = { id: string; full_name: string; levels: { name: string } | null };
type SaveAction = (formData: FormData) => Promise<{ error: string | null }>;

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };
const AVATAR = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function aColor(n:string){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return AVATAR[h%AVATAR.length];}
function ini(n:string){return n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();}

const TONE: Record<string,{bg:string;fg:string;t:string}> = {
  present: { bg:"rgba(46,168,42,.14)", fg:"#1a8a2a", t:"Present" },
  absent:  { bg:"rgba(201,74,58,.12)", fg:"#b3402f", t:"Absent" },
  late:    { bg:"rgba(212,168,67,.18)", fg:"#9a7822", t:"Late" },
};
const CYCLE: Record<string,string> = { present:"absent", absent:"late", late:"present" };

export default function AttendanceForm({
  date, students, initialStatus, saveAction, basePath = "/dashboard/attendance",
}: {
  date: string; students: Student[]; initialStatus: Record<string, string>;
  saveAction: SaveAction; basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const s of students) init[s.id] = initialStatus[s.id] ?? "present";
    return init;
  });
  const [msg, setMsg] = useState<{ type:"ok"|"err"; text:string } | null>(null);

  const hadExisting = Object.keys(initialStatus).length > 0;
  const present = Object.values(marks).filter(m => m === "present").length;
  const pct = students.length ? Math.round((present / students.length) * 100) : 0;

  function changeDate(d: string) {
    setMsg(null);
    const p = new URLSearchParams(searchParams.toString());
    p.set("date", d);
    router.push(`${basePath}?${p.toString()}`);
  }
  function markAll() {
    const n: Record<string,string> = {};
    for (const s of students) n[s.id] = "present";
    setMarks(n);
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("date", date);
    for (const [sid, v] of Object.entries(marks)) fd.set(`status_${sid}`, v);
    startTransition(async () => {
      setMsg(null);
      const r = await saveAction(fd);
      if (r?.error) { setMsg({ type:"err", text:r.error }); return; }
      const ab = Object.values(marks).filter(m=>m==="absent").length;
      const lt = Object.values(marks).filter(m=>m==="late").length;
      const dl = new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
      setMsg({ type:"ok", text:`Saved for ${dl} — ${present} present, ${ab} absent, ${lt} late` });
      router.refresh();
    });
  }

  // Ring mini
  const r = 18, circ = 2 * Math.PI * r, off = circ * (1 - pct/100);

  return (
    <form onSubmit={handleSubmit}>
      {/* Controls */}
      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div className="cd-select-field">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18v18H3z"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
          <input type="date" value={date} onChange={e=>changeDate(e.target.value)} />
        </div>
        <button type="button" onClick={markAll} className="cd-btn-ghost">Mark all present</button>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, fontSize:13, fontWeight:700, color:C.ink }}>
          <svg width={42} height={42} style={{ transform:"rotate(-90deg)" }}>
            <circle cx={21} cy={21} r={r} fill="none" stroke={C.greenWash} strokeWidth={5} />
            <circle cx={21} cy={21} r={r} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
          </svg>
          {present}/{students.length} present
        </div>
      </div>

      {hadExisting && !msg && (
        <div style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"12px 16px", marginBottom:14, background:"rgba(212,168,67,.12)", border:"1px solid rgba(212,168,67,.3)", borderRadius:12 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <span style={{ fontSize:12.5, color:"#9a7822", lineHeight:1.5 }}><strong>Attendance already recorded for this date.</strong> Saving will overwrite existing records.</span>
        </div>
      )}

      {!students.length ? (
        <div className="cd-card" style={{ padding:40, textAlign:"center" }}>
          <p style={{ color:C.muted }}>No students yet. Add students first.</p>
        </div>
      ) : (
        <div className="cd-card" style={{ padding:0 }}>
          {students.map((s, i) => {
            const m = marks[s.id], tn = TONE[m];
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom: i<students.length-1?`1px solid ${C.border}`:"none" }}>
                <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, background:aColor(s.full_name), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12.3 }}>{ini(s.full_name)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13.5, color:C.ink }}>{s.full_name}</div>
                  <div style={{ fontSize:11.5, color:C.muted }}>{(s.levels as {name:string}|null)?.name ?? "—"}</div>
                </div>
                <button type="button" onClick={() => setMarks({ ...marks, [s.id]: CYCLE[m] })}
                  style={{ border:"none", cursor:"pointer", background:tn.bg, color:tn.fg, fontWeight:700, fontSize:12.5, padding:"7px 16px", borderRadius:8, minWidth:92 }}>
                  {tn.t}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, fontSize:13, fontWeight:600,
          background: msg.type==="ok" ? "rgba(46,168,42,.1)" : "rgba(201,74,58,.1)",
          color: msg.type==="ok" ? C.greenDark : "#b3402f",
          border: `1px solid ${msg.type==="ok" ? "rgba(46,168,42,.25)" : "rgba(201,74,58,.25)"}` }}>
          {msg.type==="ok" ? "✓ " : ""}{msg.text}
        </div>
      )}

      {!!students.length && (
        <div style={{ marginTop:18 }}>
          <button type="submit" disabled={isPending} className="cd-btn-primary">
            {isPending ? "Saving…" : "Save register"}
          </button>
        </div>
      )}
    </form>
  );
}
