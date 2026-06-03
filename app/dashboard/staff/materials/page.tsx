import { createClient } from "@/lib/supabase/server";
import { deleteMaterial } from "@/app/dashboard/actions/index";
import { MaterialUploadForm } from "./MaterialUploadForm";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  pdf:      { bg: "#fef2f2", fg: "#b91c1c", label: "PDF" },
  link:     { bg: "#eff6ff", fg: "#1d4ed8", label: "Link" },
  video:    { bg: "#f5f3ff", fg: "#7c3aed", label: "Video" },
  document: { bg: "#f9fafb", fg: "#374151", label: "Document" },
  other:    { bg: "#f8fafc", fg: "#475569", label: "Other" },
};
function TypeBadge({ type }: { type: string }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.other;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", background: s.bg, color: s.fg, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 6, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

type Material = {
  id: string; title: string; description: string | null; material_type: string;
  url: string | null; level_id: string | null; topic: string | null;
  week_number: number | null; is_public: boolean; created_at: string;
};

export default async function StaffMaterialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const levelName: Record<string, string> = {};
  for (const l of levels ?? []) levelName[l.id] = l.name;

  const { data: materialsRaw } = await supabase
    .from("materials")
    .select("id, title, description, material_type, url, level_id, topic, week_number, is_public, created_at")
    .eq("uploaded_by", user.id)
    .order("week_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const materials = (materialsRaw ?? []) as Material[];

  // Group by level
  const groups: Record<string, Material[]> = {};
  for (const m of materials) {
    const key = m.is_public ? "__public" : (m.level_id ?? "__none");
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  const groupKeys = Object.keys(groups);

  function groupLabel(key: string) {
    if (key === "__public") return "All students (public)";
    if (key === "__none") return "Unassigned";
    return levelName[key] ?? "Level";
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Course Materials</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Upload PDFs and resources for your students.</p>
      </div>

      <div className="cd-grid-2-1" style={{ alignItems: "flex-start" }}>
        {/* Section B — uploaded materials grouped by level */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {!materials.length ? (
            <div className="cd-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 13.5 }}>No materials uploaded yet. Use the form to add your first resource.</p>
            </div>
          ) : (
            groupKeys.map((key) => (
              <div key={key}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
                  {groupLabel(key)}
                </p>
                <div className="cd-card" style={{ padding: 0 }}>
                  {groups[key].map((m, i) => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < groups[key].length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {m.week_number != null && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.greenDark, background: C.greenWash, borderRadius: 6, padding: "2px 8px" }}>Week {m.week_number}</span>
                          )}
                          {m.topic && <span style={{ fontSize: 12, color: C.muted }}>{m.topic}</span>}
                          <TypeBadge type={m.material_type} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 3 }}>{m.title}</div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{fmtDate(m.created_at)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                        {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="cd-mini-btn" style={{ textDecoration: "none" }}>Open</a>}
                        <form action={deleteMaterial.bind(null, m.id) as unknown as (fd: FormData) => Promise<void>} style={{ display: "inline" }}>
                          <button type="submit" style={{ background: "rgba(201,74,58,.1)", border: "none", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 700, color: "#b3402f", cursor: "pointer" }}>Delete</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section A — upload form */}
        <div className="cd-card" style={{ padding: 22, height: "fit-content" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Upload new material</h2>
          <MaterialUploadForm levels={(levels ?? []) as { id: string; name: string }[]} />
        </div>
      </div>
    </div>
  );
}
