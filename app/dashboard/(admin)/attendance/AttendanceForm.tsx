"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DateNavigator } from "./DateNavigator";

type Student = { id: string; full_name: string; levels: { name: string } | null };
type SaveAction = (formData: FormData) => Promise<{ error: string | null }>;
type Status = "present" | "absent" | undefined;

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", red: "#b3402f" };
const AVATAR = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function aColor(n: string){ let h=0; for(let i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))>>>0; return AVATAR[h%AVATAR.length]; }
function ini(n: string){ return n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase(); }

export default function AttendanceForm({
  date, students, initialStatus, saveAction,
}: {
  date: string; students: Student[]; initialStatus: Record<string, string>;
  saveAction: SaveAction; basePath?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [marks, setMarks] = useState<Record<string, Status>>(() => {
    const init: Record<string, Status> = {};
    for (const s of students) {
      const v = initialStatus[s.id];
      init[s.id] = v === "present" || v === "absent" ? v : undefined; // unmarked by default
    }
    return init;
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const hadExisting = Object.keys(initialStatus).length > 0;
  const total = students.length;
  const present = Object.values(marks).filter(m => m === "present").length;
  const absent = Object.values(marks).filter(m => m === "absent").length;
  const notMarked = total - present - absent;
  const pct = total ? Math.round((present / total) * 100) : 0;

  function setMark(id: string, status: Status) { setMarks(m => ({ ...m, [id]: status })); }
  function markAll() {
    const n: Record<string, Status> = {};
    for (const s of students) n[s.id] = "present";
    setMarks(n);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("date", date);
    for (const [sid, v] of Object.entries(marks)) {
      if (v) fd.set(`status_${sid}`, v); // skip unmarked
    }
    startTransition(async () => {
      setMsg(null);
      const r = await saveAction(fd);
      if (r?.error) { setMsg({ type: "err", text: r.error }); return; }
      setMsg({ type: "ok", text: `Attendance saved — ${present} present, ${absent} absent` });
      router.refresh();
    });
  }

  // Summary ring
  const rr = 26, circ = 2 * Math.PI * rr, off = circ * (1 - pct / 100);

  // Status pill button
  function StatusBtn({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
    return (
      <button type="button" onClick={onClick} className="attend-btn"
        style={{
          cursor: "pointer", fontWeight: 700, fontSize: 13, padding: "9px 20px", borderRadius: 9, minWidth: 96,
          fontFamily: "inherit", transition: "all .12s",
          background: active ? color : "#fff",
          color: active ? "#fff" : color,
          border: `1.5px solid ${active ? color : C.border}`,
        }}>
        {label}
      </button>
    );
  }

  function dot(status: Status) {
    const c = status === "present" ? C.green : status === "absent" ? C.red : "#cbd5cb";
    return <span style={{ width: 9, height: 9, borderRadius: "50%", background: c, flexShrink: 0 }} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header: date navigator + summary ring */}
      <div className="cd-card" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <DateNavigator currentDate={date} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width={58} height={58} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={29} cy={29} r={rr} fill="none" stroke={C.greenWash} strokeWidth={6} />
            <circle cx={29} cy={29} r={rr} fill="none" stroke={C.green} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
          </svg>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{present}/{total}</div>
            <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>present</div>
          </div>
        </div>
      </div>

      {/* Summary card */}
      {total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total", value: total, color: C.ink },
            { label: "Present", value: present, color: C.greenDark },
            { label: "Absent", value: absent, color: C.red },
            { label: "Not marked", value: notMarked, color: C.muted },
          ].map(s => (
            <div key={s.label} className="cd-card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {hadExisting && !msg && (
        <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 16px", marginBottom: 14, background: "rgba(212,168,67,.12)", border: "1px solid rgba(212,168,67,.3)", borderRadius: 12 }}>
          <span style={{ fontSize: 12.5, color: "#9a7822", lineHeight: 1.5 }}><strong>Already saved for this date.</strong> You can edit and save again to update the records.</span>
        </div>
      )}

      {/* Register */}
      {!total ? (
        <div className="cd-card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: C.muted }}>No students yet. Add students first.</p>
        </div>
      ) : (
        <div className="cd-card" style={{ padding: 0 }}>
          {students.map((s, i) => {
            const status = marks[s.id];
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: i < total - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: aColor(s.full_name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5 }}>{ini(s.full_name)}</div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  {dot(status)}
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.full_name}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <StatusBtn active={status === "present"} color={C.green} label="Present" onClick={() => setMark(s.id, "present")} />
                  <StatusBtn active={status === "absent"} color={C.red} label="Absent" onClick={() => setMark(s.id, "absent")} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: msg.type === "ok" ? "rgba(46,168,42,.1)" : "rgba(201,74,58,.1)",
          color: msg.type === "ok" ? C.greenDark : C.red,
          border: `1px solid ${msg.type === "ok" ? "rgba(46,168,42,.25)" : "rgba(201,74,58,.25)"}` }}>
          {msg.type === "ok" ? "✓ " : ""}{msg.text}
        </div>
      )}

      {total > 0 && (
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={markAll} className="cd-btn-ghost">Mark all present</button>
          <button type="submit" disabled={isPending} className="cd-btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>
            {isPending ? "Saving…" : "Save attendance"}
          </button>
        </div>
      )}
    </form>
  );
}
