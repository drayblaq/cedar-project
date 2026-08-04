import { createClient } from "@/lib/supabase/server";
import { SkillMatrix } from "./SkillMatrix";

const C = { ink: "#16241a", muted: "#687a6c" };

export default async function GradesPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: terms }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, levels(name)")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("academic_terms")
      .select("id, name, start_date, end_date")
      .order("start_date", { ascending: false }),
  ]);

  const rows = (students ?? []).map((s) => {
    const lvl = Array.isArray(s.levels)
      ? (s.levels[0] as { name?: string })?.name
      : (s.levels as { name?: string } | null)?.name;
    return { id: s.id as string, full_name: s.full_name as string, programLevel: lvl ?? "-" };
  });

  const termList = (terms ?? []) as { id: string; name: string; start_date: string; end_date: string }[];

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>English Level</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Track each student&apos;s CEFR level per skill area and term.</p>
      </div>

      {!rows.length ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>No active students yet. Enrol students to start assessing levels.</p>
        </div>
      ) : (
        <SkillMatrix rows={rows} terms={termList} />
      )}
    </div>
  );
}
