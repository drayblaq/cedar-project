import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";
import { getStudentAssessmentHistory } from "@/app/dashboard/actions/index";
import { ProgressGraph } from "@/components/dashboard/ProgressGraph";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const SKILLS = [
  { key: "speaking",          label: "Speaking",       icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "listening",         label: "Listening",      icon: "M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" },
  { key: "grammar_vocabulary", label: "Grammar & Vocab", icon: "M4 7V4h16v3 M9 20h6 M12 4v16" },
  { key: "reading",           label: "Reading",        icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
  { key: "writing",           label: "Writing",        icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
  { key: "overall",           label: "Overall Level",  icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CEFR_LABEL: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper-Intermediate", C1: "Advanced", C2: "Proficient",
};

function levelStyle(l?: string): { bg: string; fg: string; bar: string; ring: string } {
  if (l === "A1" || l === "A2") return { bg: "#fef3c7", fg: "#92400e", bar: "#f59e0b", ring: "#fde68a" };
  if (l === "B1" || l === "B2") return { bg: "#dbeafe", fg: "#1e3a8a", bar: "#3b82f6", ring: "#bfdbfe" };
  if (l === "C1" || l === "C2") return { bg: S.greenMid, fg: S.greenDark, bar: S.green, ring: "#bbf7d0" };
  return { bg: "#f1f5f9", fg: S.muted, bar: "#cbd5e1", ring: "#e2e8f0" };
}

function SIcon({ d }: { d: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
    </svg>
  );
}

export default async function StudentLevelPage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div style={{ padding: "40px 30px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: S.ink }}>{t("myGrades")}</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: S.sub }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: grades }, assessmentHistory] = await Promise.all([
    supabase.from("grades").select("skill_area, skill_level").eq("student_id", result.student.id),
    getStudentAssessmentHistory(result.student.id),
  ]);

  const levels: Record<string, string> = {};
  for (const g of (grades ?? []) as { skill_area: string | null; skill_level: string | null }[]) {
    if (g.skill_area && g.skill_level) levels[g.skill_area] = g.skill_level;
  }
  const hasAny = SKILLS.some(s => levels[s.key]);
  const overallLevel = levels["overall"];
  const studentLevel = levelName(result.student.levels);
  const displayLevel = overallLevel ?? studentLevel;
  const lvlStyle = levelStyle(displayLevel);

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>My English Level</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>
            {result.student.full_name}
          </h1>
          {displayLevel !== "—" && (
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: lvlStyle.bg, color: lvlStyle.fg,
              fontSize: 14, fontWeight: 800, padding: "6px 16px", borderRadius: 10, letterSpacing: "0.04em",
            }}>{displayLevel} · {CEFR_LABEL[displayLevel] ?? displayLevel}</span>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: S.sub, marginTop: 6 }}>
          {tc("level")}: {tc("level")} {studentLevel} · CEFR Assessment Results
        </p>
      </div>

      {/* Progress over time */}
      {assessmentHistory.length > 0 && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 20, padding: "22px 24px", marginBottom: 28, boxShadow: S.card }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>Progress Over Time</p>
          <ProgressGraph history={assessmentHistory} />
        </div>
      )}

      {!hasAny ? (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 20, padding: "60px 32px", textAlign: "center", boxShadow: S.card, maxWidth: 520 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: S.ink, marginBottom: 10 }}>Assessment Pending</h2>
          <p style={{ fontSize: 14, color: S.sub, lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
            Your teacher will update your English level after your assessment. Check back here to see your CEFR scores across all skill areas.
          </p>
        </div>
      ) : (
        <>
          {/* ── Skill grid ────────────────────────────────── */}
          <div className="cd-grid-stats-3" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: 28 }}>
            {SKILLS.map(skill => {
              const lvl = levels[skill.key];
              const ls = levelStyle(lvl);
              const idx = lvl ? CEFR.indexOf(lvl) : -1;
              const pct = idx >= 0 ? ((idx + 1) / CEFR.length) * 100 : 0;
              const isOverall = skill.key === "overall";

              return (
                <div key={skill.key} style={{
                  background: isOverall ? `linear-gradient(135deg, ${lvlStyle.fg}18, ${lvlStyle.ring}40)` : S.surface,
                  border: `1.5px solid ${isOverall ? ls.bar + "40" : S.border}`,
                  borderRadius: 16, padding: "22px 22px 20px",
                  boxShadow: isOverall ? `0 4px 16px ${ls.bar}20` : S.card,
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: ls.bg, color: ls.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <SIcon d={skill.icon} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isOverall ? S.ink : S.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {skill.label}
                        </div>
                        {isOverall && <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>Combined assessment</div>}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: ls.bg, color: ls.fg, fontSize: isOverall ? 15 : 13, fontWeight: 800,
                      padding: isOverall ? "5px 14px" : "3px 10px", borderRadius: 8, flexShrink: 0, letterSpacing: "0.03em",
                    }}>
                      {lvl ?? "—"}
                    </span>
                  </div>

                  {/* Progress bar A1 → C2 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: S.muted }}>A1</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: S.muted }}>C2</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 6, background: ls.ring, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: ls.bar, borderRadius: 6, transition: "width .4s ease" }} />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: ls.fg }}>
                      {lvl ? CEFR_LABEL[lvl] : "Not assessed yet"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Legend ──────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "16px 20px", background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14 }}>
            {[
              { label: "A1–A2 · Beginner / Elementary", bg: "#fef3c7", dot: "#f59e0b" },
              { label: "B1–B2 · Intermediate", bg: "#dbeafe", dot: "#3b82f6" },
              { label: "C1–C2 · Advanced / Proficient", bg: S.greenMid, dot: S.green },
            ].map(lk => (
              <div key={lk.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: S.sub }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: lk.bg, border: `2px solid ${lk.dot}`, flexShrink: 0 }} />
                {lk.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
