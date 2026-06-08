"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSkillLevel } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", bg: "#f4f7f2" };

const SKILLS: { key: string; label: string }[] = [
  { key: "speaking", label: "Speaking" },
  { key: "listening", label: "Listening" },
  { key: "grammar_vocabulary", label: "Grammar / Vocab" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "overall", label: "Overall" },
];
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

// CEFR colour bands: A1/A2 amber, B1/B2 blue, C1/C2 green
function levelTone(level?: string): { bg: string; fg: string } {
  if (level === "A1" || level === "A2") return { bg: "rgba(212,168,67,.16)", fg: "#9a7822" };
  if (level === "B1" || level === "B2") return { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" };
  if (level === "C1" || level === "C2") return { bg: "rgba(46,168,42,.14)", fg: "#1a6b18" };
  return { bg: "#f1f5ee", fg: "#9aa89c" };
}

function avatarColor(name: string) {
  const palette = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }

type Row = { id: string; full_name: string; programLevel: string; levels: Record<string, string> };

function SkillCell({ studentId, skillKey, level, onSaved }: { studentId: string; skillKey: string; level?: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const tone = levelTone(level);

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(v: string) {
    startTransition(async () => {
      const res = await saveSkillLevel(studentId, skillKey, v);
      if (!res?.error) { setOpen(false); onSaved(); }
    });
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        title="Set level"
        style={{
          minWidth: 42, height: 28, borderRadius: 7, cursor: "pointer",
          border: level ? "none" : `1px dashed ${C.border}`,
          background: tone.bg, color: tone.fg, fontSize: 12.5, fontWeight: 800, fontFamily: "inherit",
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? "…" : (level ?? "—")}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)", zIndex: 50,
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.14)", padding: 5, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {CEFR.map((v) => {
            const t = levelTone(v);
            return (
              <button key={v} onClick={() => pick(v)}
                style={{ minWidth: 38, height: 28, borderRadius: 6, border: v === level ? `2px solid ${t.fg}` : "none", background: t.bg, color: t.fg, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {v}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SkillMatrix({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const onSaved = () => router.refresh();

  const th: React.CSSProperties = { padding: "11px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "center" };

  return (
    <div className="cd-card" style={{ padding: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left", position: "sticky", left: 0, background: "#fff", zIndex: 1 }}>Student</th>
              {SKILLS.map((s) => <th key={s.key} style={th}>{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="cd-trow">
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, position: "sticky", left: 0, background: "#fff", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: avatarColor(r.full_name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{initials(r.full_name)}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{r.full_name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{r.programLevel}</div>
                    </div>
                  </div>
                </td>
                {SKILLS.map((s) => (
                  <td key={s.key} style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                    <SkillCell studentId={r.id} skillKey={s.key} level={r.levels[s.key]} onSaved={onSaved} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "12px 18px", borderTop: `1px solid ${C.border}`, fontSize: 11.5, color: C.muted }}>
        <span>Click any cell to set the level.</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(212,168,67,.16)" }} /> A1–A2</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(63,125,140,.14)" }} /> B1–B2</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(46,168,42,.14)" }} /> C1–C2</span>
      </div>
    </div>
  );
}
