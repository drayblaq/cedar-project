import { createClient } from "@/lib/supabase/server";
import { SkillMatrix } from "./SkillMatrix";

const C = { ink: "#16241a", muted: "#687a6c" };

const SKILL_AREAS = ["speaking", "listening", "grammar_vocabulary", "reading", "writing", "overall"] as const;

export default async function GradesPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, levels(name), grades(skill_area, skill_level)")
    .eq("status", "active")
    .order("full_name");

  const rows = (students ?? []).map((s) => {
    const levels: Record<string, string> = {};
    const grades = (s.grades ?? []) as { skill_area: string | null; skill_level: string | null }[];
    for (const g of grades) {
      if (g.skill_area && g.skill_level && SKILL_AREAS.includes(g.skill_area as typeof SKILL_AREAS[number])) {
        levels[g.skill_area] = g.skill_level;
      }
    }
    const lvl = Array.isArray(s.levels) ? (s.levels[0] as { name?: string })?.name : (s.levels as { name?: string } | null)?.name;
    return { id: s.id as string, full_name: s.full_name as string, programLevel: lvl ?? "—", levels };
  });

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>English Level Assessment</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Track each student&apos;s CEFR level per skill area.</p>
      </div>

      {!rows.length ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>No active students yet. Enrol students to start assessing levels.</p>
        </div>
      ) : (
        <SkillMatrix rows={rows} />
      )}
    </div>
  );
}
