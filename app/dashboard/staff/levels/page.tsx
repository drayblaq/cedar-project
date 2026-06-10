import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillMatrix } from "@/app/dashboard/(admin)/grades/SkillMatrix";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4" };

const SKILL_AREAS = ["speaking", "listening", "grammar_vocabulary", "reading", "writing", "overall"] as const;

export default async function StaffLevelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Find this staff member's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!profile) notFound();

  // Fetch classes assigned to this staff member, with students and grades
  const { data: staffClasses } = await supabase
    .from("staff_classes")
    .select(`
      class:classes(
        id, name,
        level:levels(name),
        students:students(
          id, full_name,
          grades(skill_area, skill_level)
        )
      )
    `)
    .eq("profile_id", profile.id);

  type GradeRow = { skill_area: string | null; skill_level: string | null };
  type StudentRaw = { id: string; full_name: string; grades: GradeRow[] };
  type ClassRaw = {
    id: string; name: string;
    level: { name?: string } | { name?: string }[] | null;
    students: StudentRaw[] | null;
  };

  const classes: { id: string; name: string; levelName: string; rows: { id: string; full_name: string; programLevel: string; levels: Record<string, string> }[] }[] = [];

  for (const sc of staffClasses ?? []) {
    const cls = (Array.isArray(sc.class) ? sc.class[0] : sc.class) as ClassRaw | null;
    if (!cls) continue;
    const lvl = Array.isArray(cls.level) ? cls.level[0]?.name : (cls.level as { name?: string } | null)?.name;
    const rows = (cls.students ?? []).map((s) => {
      const levels: Record<string, string> = {};
      for (const g of s.grades ?? []) {
        if (g.skill_area && g.skill_level && SKILL_AREAS.includes(g.skill_area as typeof SKILL_AREAS[number])) {
          levels[g.skill_area] = g.skill_level;
        }
      }
      return { id: s.id, full_name: s.full_name, programLevel: lvl ?? "—", levels };
    });
    classes.push({ id: cls.id, name: cls.name, levelName: lvl ?? "—", rows });
  }

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>My Students — English Level</h1>
      </div>

      {!classes.length ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>You have no assigned classes yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {classes.map((cls) => (
            <div key={cls.id}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{cls.name}</h2>
                <span style={{ fontSize: 12, color: C.muted }}>{cls.levelName}</span>
              </div>
              {!cls.rows.length ? (
                <div className="cd-card" style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: C.muted, fontSize: 13.5 }}>No students enrolled in this class.</p>
                </div>
              ) : (
                <SkillMatrix rows={cls.rows} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
