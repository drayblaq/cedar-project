import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec" };

const SKILLS: { key: string; label: string }[] = [
  { key: "speaking", label: "Speaking" },
  { key: "listening", label: "Listening" },
  { key: "grammar_vocabulary", label: "Grammar / Vocab" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "overall", label: "Overall Level" },
];
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CEFR_NAME: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-Intermediate", C1: "Advanced", C2: "Proficient",
};

function levelTone(level?: string): { bg: string; fg: string; bar: string } {
  if (level === "A1" || level === "A2") return { bg: "rgba(212,168,67,.16)", fg: "#9a7822", bar: "#d4a843" };
  if (level === "B1" || level === "B2") return { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b", bar: "#3f7d8c" };
  if (level === "C1" || level === "C2") return { bg: "rgba(46,168,42,.14)", fg: "#1a6b18", bar: "#2ea82a" };
  return { bg: "#f1f5ee", fg: "#9aa89c", bar: "#cbd5cb" };
}

export default async function StudentLevelPage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>{t("myGrades")}</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: C.muted }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: grades } = await supabase
    .from("grades")
    .select("skill_area, skill_level")
    .eq("student_id", result.student.id);

  const levels: Record<string, string> = {};
  for (const g of (grades ?? []) as { skill_area: string | null; skill_level: string | null }[]) {
    if (g.skill_area && g.skill_level) levels[g.skill_area] = g.skill_level;
  }
  const hasAny = SKILLS.some((s) => levels[s.key]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>{t("myGrades")}</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{result.student.full_name} · {tc("level")}: {levelName(result.student.levels)}</p>
      </div>

      {!hasAny ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted }}>{t("noGrades")}</p>
        </div>
      ) : (
        <div className="cd-card" style={{ padding: "10px 8px" }}>
          {SKILLS.map((s, i) => {
            const level = levels[s.key];
            const tone = levelTone(level);
            const idx = level ? CEFR.indexOf(level) : -1;
            const pct = idx >= 0 ? ((idx + 1) / CEFR.length) * 100 : 0;
            const isOverall = s.key === "overall";
            return (
              <div key={s.key} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", flexWrap: "wrap",
                borderBottom: i < SKILLS.length - 1 ? `1px solid ${C.border}` : "none",
                background: isOverall ? C.greenWash : "transparent", borderRadius: isOverall ? 12 : 0,
              }}>
                <div className="skill-row-label" style={{ width: 130, flexShrink: 0, fontSize: 13.5, fontWeight: isOverall ? 800 : 700, color: C.ink }}>{s.label}</div>
                <div style={{ minWidth: 42, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 40, height: 28, borderRadius: 7, background: tone.bg, color: tone.fg, fontSize: 13, fontWeight: 800 }}>
                    {level ?? "—"}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 80 }}>
                  <div style={{ height: 8, borderRadius: 5, background: "#eef2ec", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: tone.bar, borderRadius: 5, transition: "width .3s" }} />
                  </div>
                </div>
                <div className="skill-row-desc" style={{ width: 150, flexShrink: 0, fontSize: 12.5, color: C.muted, textAlign: "right" }}>
                  {level ? CEFR_NAME[level] : "Not assessed"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasAny && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14, fontSize: 11.5, color: C.muted, padding: "0 4px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(212,168,67,.16)" }} /> A1–A2 Beginner</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(63,125,140,.14)" }} /> B1–B2 Intermediate</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(46,168,42,.14)" }} /> C1–C2 Advanced</span>
        </div>
      )}
    </div>
  );
}
