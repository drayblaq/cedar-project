import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDeep: "#0e3b0c", greenBright: "#6fdc6a" };

type Material = {
  id: string; title: string; description: string | null; material_type: string;
  url: string | null; topic: string | null; week_number: number | null; is_public: boolean;
};

function TypeIcon({ type }: { type: string }) {
  if (type === "link") return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  );
  if (type === "video") return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  );
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>
  );
}
function openLabel(type: string) {
  if (type === "video") return "Watch Video";
  if (type === "link") return "Open Link";
  if (type === "pdf") return "Read PDF";
  return "Open Lesson";
}

export default async function StudentMaterialsPage() {
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  if (!result.student) {
    return (
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>Learning Library</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: C.muted }}>No student record linked to your account yet.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { student } = result;
  const level = levelName(student.levels);

  let materials: Material[] = [];
  if (student.level_id) {
    const { data } = await supabase
      .from("materials")
      .select("id, title, description, material_type, url, topic, week_number, is_public")
      .or(`level_id.eq.${student.level_id},is_public.eq.true`)
      .order("week_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    materials = (data ?? []) as Material[];
  } else {
    const { data } = await supabase
      .from("materials")
      .select("id, title, description, material_type, url, topic, week_number, is_public")
      .eq("is_public", true)
      .order("created_at", { ascending: true });
    materials = (data ?? []) as Material[];
  }

  // Group: weeks (sorted) then "General Resources" (no week_number)
  const weekGroups = new Map<number, Material[]>();
  const general: Material[] = [];
  for (const m of materials) {
    if (m.week_number != null) {
      if (!weekGroups.has(m.week_number)) weekGroups.set(m.week_number, []);
      weekGroups.get(m.week_number)!.push(m);
    } else {
      general.push(m);
    }
  }
  const sortedWeeks = [...weekGroups.keys()].sort((a, b) => a - b);

  const count = materials.length;

  return (
    <div>
      {/* Header */}
      <div className="cd-card" style={{ marginBottom: 22, background: "linear-gradient(120deg, #0e3b0c, #15561a)", border: "none", color: "#fff", padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.greenBright, marginBottom: 8 }}>Learning Library</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.12 }}>{level}</div>
        <div style={{ fontSize: 13.5, opacity: 0.85, marginTop: 8 }}>
          {count} {count === 1 ? "lesson" : "lessons"} available
        </div>
      </div>

      {!count ? (
        <div className="cd-card" style={{ padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Your course materials will appear here. Your teacher will add them before each class.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sortedWeeks.map((wk) => {
            const items = weekGroups.get(wk)!;
            const topic = items.find((m) => m.topic)?.topic;
            return (
              <section key={wk}>
                <h2 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                  Week {wk}{topic ? ` — ${topic}` : ""}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map((m) => <MaterialCard key={m.id} m={m} />)}
                </div>
              </section>
            );
          })}

          {general.length > 0 && (
            <section>
              <h2 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                General Resources
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {general.map((m) => <MaterialCard key={m.id} m={m} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MaterialCard({ m }: { m: Material }) {
  return (
    <div className="cd-card material-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <TypeIcon type={m.material_type} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{m.title}</div>
        {m.description && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{m.description}</div>}
      </div>
      {m.url && (
        <a href={m.url} target="_blank" rel="noopener noreferrer"
          className="material-btn"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0, background: C.green, color: "#fff",
            borderRadius: 9, padding: "11px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", minHeight: 44 }}>
          {openLabel(m.material_type)}
        </a>
      )}
    </div>
  );
}
