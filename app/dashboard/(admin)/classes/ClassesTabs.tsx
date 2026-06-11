"use client";

import { useState, useMemo, useTransition } from "react";
// useTransition kept for RemoveStaffChip and DeleteSlotButton
import { createClass, assignStaffToClass, createTimetableSlot, deleteTimetableSlot, removeStaffFromClass } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", bg: "#f4f7f2" };
const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function fmtTime(t: string) { return t.slice(0, 5); }

const TYPE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  pdf:      { bg: "#fef2f2", fg: "#b91c1c", label: "PDF" },
  link:     { bg: "#eff6ff", fg: "#1d4ed8", label: "Link" },
  video:    { bg: "#f5f3ff", fg: "#7c3aed", label: "Video" },
  document: { bg: "#f9fafb", fg: "#374151", label: "Document" },
  other:    { bg: "#f8fafc", fg: "#475569", label: "Other" },
};

function LevelPill({ level }: { level: string }) {
  const order: Record<string, number> = { A1:0,A2:1,B1:2,B2:3,C1:4,C2:5,Beginner:0,Elementary:1,"Pre-Intermediate":2,Intermediate:3,"Upper-Intermediate":4,Advanced:5 };
  const hue = 95 + (order[level] ?? 0) * 6;
  return <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:30, height:22, padding:"0 8px", borderRadius:6, fontSize:11.5, fontWeight:800, background:`oklch(0.93 0.06 ${hue})`, color:`oklch(0.40 0.10 ${hue})` }}>{level}</span>;
}
function TypeBadge({ type }: { type: string }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.other;
  return <span style={{ display:"inline-flex", background:s.bg, color:s.fg, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:6 }}>{s.label}</span>;
}

const th: React.CSSProperties = { textAlign: "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.ink, verticalAlign: "middle" };

type StaffAssignment = { profileId: string; name: string };
type ClassRow = { id: string; name: string; level_id: string; levelName: string; staff: StaffAssignment[]; studentCount: number };
type Slot = { id: string; class_id: string; className: string; day_of_week: number; start_time: string; end_time: string; room: string | null };

function RemoveStaffChip({ profileId, classId, name }: { profileId: string; classId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.greenWash, borderRadius: 7, padding: "3px 8px", fontSize: 12.5, fontWeight: 600, color: C.greenDark, opacity: pending ? 0.5 : 1 }}>
      {name}
      <button onClick={() => startTransition(async () => { await removeStaffFromClass(profileId, classId); })} disabled={pending} title="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: "#b3402f", fontWeight: 800, fontSize: 12, lineHeight: 1, padding: "0 0 0 2px" }}>×</button>
    </span>
  );
}

function DeleteSlotButton({ slotId }: { slotId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => startTransition(async () => { await deleteTimetableSlot(slotId); })}
      style={{ marginTop: 6, background: "none", border: "none", color: pending ? C.muted : "#b3402f", fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>
      {pending ? "…" : "Remove"}
    </button>
  );
}

export function ClassesTabs({ levels, staff, classes, timetable }: {
  levels: { id: string; name: string }[];
  staff: { id: string; full_name: string | null }[];
  classes: ClassRow[];
  timetable: Slot[];
}) {
  const [tab, setTab] = useState<"classes" | "timetable">("classes");
  const [showAddClass, setShowAddClass] = useState(false);

  const slotsByDay = useMemo(() => {
    const m: Record<number, Slot[]> = {};
    for (const s of timetable) { (m[s.day_of_week] ??= []).push(s); }
    return m;
  }, [timetable]);
  const activeDays = [1, 2, 3, 4, 5, 6].filter((d) => slotsByDay[d]?.length);

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "classes", label: "Classes" },
    { key: "timetable", label: "Timetable" },
  ];

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Classes</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Manage classes, schedules and learning materials.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.border}`, marginBottom: 22 }}>
        {TABS.map((tdef) => (
          <button key={tdef.key} onClick={() => setTab(tdef.key)}
            style={{
              background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 700, padding: "10px 14px", marginBottom: -1,
              color: tab === tdef.key ? C.greenDark : C.muted,
              borderBottom: `2.5px solid ${tab === tdef.key ? C.green : "transparent"}`,
            }}>
            {tdef.label}
          </button>
        ))}
      </div>

      {/* ── CLASSES TAB ── */}
      {tab === "classes" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => setShowAddClass((v) => !v)} className="cd-btn-primary">
              {showAddClass ? "Close" : "+ Add class"}
            </button>
          </div>

          {showAddClass && (
            <div className="cd-card" style={{ padding: 22, marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>New class</h3>
              <form action={createClass as unknown as (fd: FormData) => Promise<void>} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "end" }}>
                <label className="cd-fld"><span>Class name</span><input name="name" type="text" required placeholder="e.g. General English — B1 Morning" /></label>
                <label className="cd-fld"><span>Level</span>
                  <select name="level_id" required defaultValue=""><option value="" disabled>Select…</option>{levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                </label>
                <button type="submit" className="cd-btn-primary" style={{ height: 42 }}>Create</button>
              </form>

              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 18, paddingTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Assign staff to a class</h3>
                <form action={assignStaffToClass as unknown as (fd: FormData) => Promise<void>} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
                  <label className="cd-fld"><span>Staff</span>
                    <select name="profile_id" required defaultValue=""><option value="" disabled>Select staff…</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>)}</select>
                  </label>
                  <label className="cd-fld"><span>Class</span>
                    <select name="class_id" required defaultValue=""><option value="" disabled>Select class…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  </label>
                  <button type="submit" className="cd-btn-ghost" style={{ height: 42 }}>Assign</button>
                </form>
              </div>
            </div>
          )}

          <div className="cd-card" style={{ padding: 0 }}>
            {!classes.length ? (
              <p style={{ padding: "40px 22px", textAlign: "center", color: C.muted, fontSize: 13.5 }}>No classes yet. Use “Add class” to create your first one.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 560 }}>
                  <thead><tr><th style={th}>Class</th><th style={th}>Level</th><th style={th}>Assigned staff</th><th style={{ ...th, textAlign: "center" }}>Students</th></tr></thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c.id} className="cd-trow">
                        <td style={{ ...td, fontWeight: 700 }}>{c.name}</td>
                        <td style={td}><LevelPill level={c.levelName} /></td>
                        <td style={{ ...td, color: c.staff.length ? C.ink : C.muted }}>
                          {c.staff.length ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {c.staff.map((s) => (
                                <RemoveStaffChip key={s.profileId} profileId={s.profileId} classId={c.id} name={s.name} />
                              ))}
                            </div>
                          ) : "Unassigned"}
                        </td>
                        <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{c.studentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TIMETABLE TAB ── */}
      {tab === "timetable" && (
        <div>
          {!activeDays.length ? (
            <div className="cd-card" style={{ padding: "40px 22px", textAlign: "center", marginBottom: 18 }}>
              <p style={{ color: C.muted, fontSize: 13.5 }}>No sessions scheduled yet. Add one below.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeDays.length}, minmax(150px, 1fr))`, gap: 12, overflowX: "auto", marginBottom: 22 }}>
              {activeDays.map((day) => (
                <div key={day} className="cd-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ background: C.greenWash, borderBottom: `1px solid ${C.border}`, padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: C.green }}>{DAY_NAMES[day]}</span>
                  </div>
                  {slotsByDay[day].map((s, i) => (
                    <div key={s.id} style={{ padding: "12px 14px", borderBottom: i < slotsByDay[day].length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{s.className}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "3px 8px", display: "inline-block" }}>
                        {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                      </div>
                      {s.room && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{s.room}</div>}
                      <DeleteSlotButton slotId={s.id} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="cd-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Add a session</h3>
            <form action={createTimetableSlot as unknown as (fd: FormData) => Promise<void>} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, alignItems: "end" }}>
              <label className="cd-fld"><span>Class</span>
                <select name="class_id" required defaultValue=""><option value="" disabled>Select…</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </label>
              <label className="cd-fld"><span>Day</span>
                <select name="day_of_week" defaultValue="1">{[1,2,3,4,5,6].map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}</select>
              </label>
              <label className="cd-fld"><span>Start</span><input name="start_time" type="time" required /></label>
              <label className="cd-fld"><span>End</span><input name="end_time" type="time" required /></label>
              <label className="cd-fld"><span>Room</span><input name="room" type="text" placeholder="Optional" /></label>
              <button type="submit" className="cd-btn-primary" style={{ height: 42 }}>+ Add</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
