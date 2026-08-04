"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveTermSkillLevel } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", bg: "#f4f7f2" };

const SKILLS: { key: string; label: string }[] = [
  { key: "speaking",          label: "Speaking" },
  { key: "listening",         label: "Listening" },
  { key: "grammar_vocabulary", label: "Grammar & Vocabulary" },
  { key: "reading",           label: "Reading" },
  { key: "writing",           label: "Writing" },
  { key: "overall",           label: "Overall Level" },
];
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

function levelTone(level?: string) {
  if (level === "A1" || level === "A2") return { bg: "rgba(212,168,67,.16)", fg: "#9a7822", active: "#d97706" };
  if (level === "B1" || level === "B2") return { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b", active: "#2563eb" };
  if (level === "C1" || level === "C2") return { bg: "rgba(46,168,42,.14)", fg: "#1a6b18", active: "#16a34a" };
  return { bg: "#f1f5ee", fg: "#9aa89c", active: "#6b7280" };
}

function avatarColor(name: string) {
  const palette = ["#2ea82a", "#1a6b18", "#d4a843", "#3f7d8c", "#8c6a3f", "#6a8c3f"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }

type Term = { id: string; name: string; start_date: string; end_date: string };
type Row = { id: string; full_name: string; programLevel: string };
type AssessmentMap = Record<string, Record<string, string>>;

function SkillBadge({ level }: { level?: string }) {
  const t = levelTone(level);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 22, borderRadius: 5,
      fontSize: 10, fontWeight: 800,
      background: level ? t.bg : "#f1f5ee",
      color: level ? t.fg : "#d1d5db",
    }}>
      {level ?? "-"}
    </span>
  );
}

function LevelButton({ level, current, onPick, pending }: { level: string; current?: string; onPick: (l: string) => void; pending: boolean }) {
  const active = level === current;
  const t = levelTone(level);
  return (
    <button
      disabled={pending}
      onClick={() => onPick(level)}
      style={{
        width: 40, height: 40, borderRadius: 10, border: "none",
        fontSize: 12, fontWeight: 800, cursor: pending ? "not-allowed" : "pointer",
        fontFamily: "inherit", transition: "all .12s",
        background: active ? t.active : "#f4f7f2",
        color: active ? "#fff" : C.muted,
        boxShadow: active ? `0 2px 8px ${t.active}44` : "none",
        opacity: pending ? 0.5 : 1,
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {level}
    </button>
  );
}

function StudentPanel({
  student,
  assessmentData,
  termId,
  termName,
  onClose,
  onSaved,
}: {
  student: Row;
  assessmentData: Record<string, string>;
  termId: string | null;
  termName: string;
  onClose: () => void;
  onSaved: (studentId: string, skillArea: string, level: string) => void;
}) {
  const [levels, setLevels] = useState<Record<string, string>>({ ...assessmentData });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLevels({ ...assessmentData });
  }, [assessmentData]);

  function pick(skillKey: string, level: string) {
    if (!termId) return;
    startTransition(async () => {
      const res = await saveTermSkillLevel(student.id, termId, skillKey, level);
      if (!res?.error) {
        setLevels((prev) => ({ ...prev, [skillKey]: level }));
        onSaved(student.id, skillKey, level);
      }
    });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }} />
      <div className="cedar-slide-panel" style={{
        position: "fixed", inset: "0 0 0 auto", width: "100%", maxWidth: 440,
        background: "#fff", zIndex: 50, overflowY: "auto",
        boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarColor(student.full_name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {initials(student.full_name)}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>{student.full_name}</h2>
              <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>
                {termName ? `Assessment, ${termName}` : "Select a term first"} · {student.programLevel}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 20, lineHeight: 1, padding: "2px 4px", fontFamily: "inherit" }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px", flex: 1 }}>
          {!termId ? (
            <p style={{ color: C.muted, fontSize: 14 }}>Please select an academic term before assessing.</p>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 18 }}>
                Click a level to set it, saves instantly
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {SKILLS.map((skill) => (
                  <div key={skill.key}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{skill.label}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {CEFR.map((lvl) => (
                        <LevelButton
                          key={lvl}
                          level={lvl}
                          current={levels[skill.key]}
                          onPick={(l) => pick(skill.key, l)}
                          pending={pending}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontSize: 11.5, color: C.muted }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(212,168,67,.3)", display: "inline-block" }} /> A1–A2 Beginner
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(63,125,140,.3)", display: "inline-block" }} /> B1–B2 Intermediate
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(46,168,42,.3)", display: "inline-block" }} /> C1–C2 Advanced
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function SkillMatrix({ rows, terms }: { rows: Row[]; terms: Term[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(terms[0]?.id ?? null);
  const [assessments, setAssessments] = useState<AssessmentMap>({});
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const selectedTerm = terms.find((t) => t.id === selectedTermId);

  async function loadAssessments(termId: string) {
    setLoadingAssessments(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("skill_assessments")
      .select("student_id, skill_area, skill_level")
      .eq("academic_term_id", termId);

    const map: AssessmentMap = {};
    for (const a of data ?? []) {
      if (!map[a.student_id]) map[a.student_id] = {};
      map[a.student_id][a.skill_area] = a.skill_level;
    }
    setAssessments(map);
    setLoadingAssessments(false);
  }

  useEffect(() => {
    if (selectedTermId) loadAssessments(selectedTermId);
    else setAssessments({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId]);

  function handleTermChange(termId: string) {
    setSelectedTermId(termId || null);
  }

  function handleSaved(studentId: string, skillArea: string, level: string) {
    setAssessments((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [skillArea]: level },
    }));
    router.refresh();
  }

  const filtered = rows.filter((r) => r.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Term selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {terms.length === 0 ? (
          <p style={{ fontSize: 13.5, color: C.muted }}>No academic terms yet. Create a term in the Calendar page first.</p>
        ) : (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
            <span>Term:</span>
            <select
              value={selectedTermId ?? ""}
              onChange={(e) => handleTermChange(e.target.value)}
              style={{
                border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px",
                fontSize: 13.5, color: C.ink, background: "#fff", fontFamily: "inherit",
                cursor: "pointer", outline: "none",
              }}
            >
              <option value="">- select -</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {loadingAssessments && (
              <span style={{ fontSize: 12, color: C.muted }}>Loading…</span>
            )}
          </label>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 320, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "10px 14px", fontSize: 13.5, color: C.ink, background: "#fff",
            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Student list */}
      <div className="cd-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: "#f8fafc" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted }}>Student</span>
          <div style={{ display: "flex", gap: 6 }}>
            {SKILLS.slice(0, 5).map((s) => (
              <span key={s.key} title={s.label} style={{ width: 28, textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>
                {s.key === "grammar_vocabulary" ? "Gr." : s.label.slice(0, 2)}
              </span>
            ))}
            <span style={{ width: 28, textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>Ov.</span>
            <span style={{ width: 20 }} />
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: "40px 20px", textAlign: "center", color: C.muted, fontSize: 13.5 }}>
            {search ? "No students match your search." : "No active students yet."}
          </p>
        )}

        {filtered.map((r, i) => {
          const studentLevels = assessments[r.id] ?? {};
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                fontFamily: "inherit", transition: "background .1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.greenWash; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: avatarColor(r.full_name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5 }}>
                  {initials(r.full_name)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{r.full_name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.programLevel}</div>
                </div>
              </div>

              <div className="cedar-skill-badges" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {SKILLS.map((s) => <SkillBadge key={s.key} level={studentLevels[s.key]} />)}
                <span style={{ marginLeft: 4, fontSize: 11, color: C.muted }}>›</span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <StudentPanel
          student={selected}
          assessmentData={assessments[selected.id] ?? {}}
          termId={selectedTermId}
          termName={selectedTerm?.name ?? ""}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
