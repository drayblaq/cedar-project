"use client";

import { useState, useMemo, useTransition } from "react";
import {
  createClass,
  assignStaffToClass,
  removeStaffFromClass,
  createTimetableSlot,
  deleteTimetableSlot,
  assignStudentToClass,
} from "@/app/dashboard/actions/index";

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", bg: "#f4f7f2",
};
const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function fmtTime(t: string) { return t.slice(0, 5); }

type StaffAssignment = { profileId: string; name: string };
type ClassRow = { id: string; name: string; level_id: string; levelName: string; staff: StaffAssignment[]; studentCount: number };
type Slot = { id: string; class_id: string; className: string; day_of_week: number; start_time: string; end_time: string; room: string | null };
type StudentRow = { id: string; full_name: string; class_id: string | null };

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

function StudentRosterRow({ student, onRemove }: { student: StudentRow; onRemove: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8fafc", borderRadius: 9, marginBottom: 6 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{student.full_name}</span>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => { await assignStudentToClass(student.id, null); onRemove(); })}
        style={{ fontSize: 12, fontWeight: 700, color: pending ? C.muted : "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        {pending ? "…" : "Remove"}
      </button>
    </div>
  );
}

function ClassPanel({ cls, staff, allStudents, onClose }: {
  cls: ClassRow;
  staff: { id: string; full_name: string | null }[];
  allStudents: StudentRow[];
  onClose: () => void;
}) {
  const [addPending, startAddTransition] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [roster, setRoster] = useState<StudentRow[]>(() => allStudents.filter((s) => s.class_id === cls.id));
  const unassigned = allStudents.filter((s) => s.class_id === null || s.class_id === cls.id ? false : true).concat(
    allStudents.filter((s) => s.class_id === null)
  );

  function handleAdd() {
    if (!selectedStudentId) return;
    startAddTransition(async () => {
      await assignStudentToClass(selectedStudentId, cls.id);
      const student = allStudents.find((s) => s.id === selectedStudentId);
      if (student) setRoster((prev) => [...prev, { ...student, class_id: cls.id }]);
      setSelectedStudentId("");
    });
  }

  function handleRemove(studentId: string) {
    setRoster((prev) => prev.filter((s) => s.id !== studentId));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }}
      />
      {/* Panel */}
      <div className="cedar-slide-panel" style={{
        position: "fixed", inset: "0 0 0 auto", width: "100%", maxWidth: 480,
        background: "#fff", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: C.ink, margin: 0 }}>{cls.name}</h2>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "3px 0 0" }}>{cls.levelName} · {roster.length} students enrolled</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 20, lineHeight: 1, padding: "2px 4px", fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px", flex: 1 }}>
          {/* Teacher assignment */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Assigned Teachers</p>
            {cls.staff.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {cls.staff.map((s) => (
                  <RemoveStaffChip key={s.profileId} profileId={s.profileId} classId={cls.id} name={s.name} />
                ))}
              </div>
            )}
            <form action={assignStaffToClass as unknown as (fd: FormData) => Promise<void>} style={{ display: "flex", gap: 8 }}>
              <input type="hidden" name="class_id" value={cls.id} />
              <select name="profile_id" required defaultValue=""
                style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.ink, background: "#f9fafb", fontFamily: "inherit" }}>
                <option value="" disabled>Add a teacher…</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>)}
              </select>
              <button type="submit" className="cd-btn-ghost" style={{ height: 40, whiteSpace: "nowrap" }}>Assign</button>
            </form>
          </div>

          {/* Student roster */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>Students in this class</p>

            {roster.length === 0 && (
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, fontStyle: "italic" }}>No students assigned yet.</p>
            )}

            {roster.map((s) => (
              <StudentRosterRow key={s.id} student={s} onRemove={() => handleRemove(s.id)} />
            ))}

            {/* Add student */}
            {unassigned.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.ink, background: "#f9fafb", fontFamily: "inherit" }}
                >
                  <option value="">Add a student…</option>
                  {unassigned.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
                <button
                  disabled={!selectedStudentId || addPending}
                  onClick={handleAdd}
                  className="cd-btn-primary"
                  style={{ height: 40, whiteSpace: "nowrap", opacity: !selectedStudentId || addPending ? 0.5 : 1 }}
                >
                  {addPending ? "…" : "Add"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function ClassesTabs({ levels, staff, classes, timetable, students }: {
  levels: { id: string; name: string }[];
  staff: { id: string; full_name: string | null }[];
  classes: ClassRow[];
  timetable: Slot[];
  students: StudentRow[];
}) {
  const [tab, setTab] = useState<"classes" | "timetable">("classes");
  const [showAddClass, setShowAddClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);

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
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Manage classes, schedules and student assignments.</p>
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <button onClick={() => setShowAddClass((v) => !v)} className="cd-btn-primary">
              {showAddClass ? "Close" : "+ Add class"}
            </button>
          </div>

          {showAddClass && (
            <div className="cd-card" style={{ padding: 22, marginBottom: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>New class</h3>
              <form action={createClass as unknown as (fd: FormData) => Promise<void>} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "end" }}>
                <label className="cd-fld"><span>Class name</span><input name="name" type="text" required placeholder="e.g. General English, B1 Morning" /></label>
                <label className="cd-fld"><span>Level</span>
                  <select name="level_id" required defaultValue=""><option value="" disabled>Select…</option>{levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                </label>
                <button type="submit" className="cd-btn-primary" style={{ height: 42 }}>Create</button>
              </form>
            </div>
          )}

          {/* Card grid */}
          {!classes.length ? (
            <div className="cd-card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 13.5 }}>No classes yet. Use &quot;Add class&quot; to create your first one.</p>
            </div>
          ) : (
            <div className="cedar-classes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {classes.map((cls) => {
                const enrolled = students.filter((s) => s.class_id === cls.id).length;
                const teacherName = cls.staff[0]?.name ?? "Unassigned";
                const ttSlots = timetable.filter((s) => s.class_id === cls.id);
                const scheduleSummary = ttSlots.length
                  ? ttSlots.map((s) => `${DAY_NAMES[s.day_of_week]} ${fmtTime(s.start_time)}`).join(", ")
                  : "No schedule set";
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    style={{
                      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
                      padding: "18px 20px", textAlign: "left", cursor: "pointer",
                      transition: "border-color .15s, box-shadow .15s", fontFamily: "inherit",
                      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#86efac"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(46,168,42,.10)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, lineHeight: 1.3, marginRight: 10 }}>{cls.name}</span>
                      <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, background: C.greenWash, color: C.greenDark, padding: "3px 9px", borderRadius: 20 }}>
                        {enrolled} students
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 4px" }}>
                      Teacher: <span style={{ color: cls.staff.length ? C.ink : C.muted, fontWeight: cls.staff.length ? 600 : 400 }}>{teacherName}{cls.staff.length > 1 ? ` +${cls.staff.length - 1}` : ""}</span>
                    </p>
                    <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0 }}>{scheduleSummary}</p>
                  </button>
                );
              })}
            </div>
          )}
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

      {/* Class detail panel */}
      {selectedClass && (
        <ClassPanel
          cls={selectedClass}
          staff={staff}
          allStudents={students}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
}
