import { createClient } from "@/lib/supabase/server";
import { createMaterial, deleteMaterial } from "@/app/dashboard/actions/index";

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
    <span style={{ display: "inline-flex", alignItems: "center", background: s.bg, color: s.fg,
      fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function TypeIcon({ type }: { type: string }) {
  if (type === "pdf") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>
    </svg>
  );
  if (type === "link") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
  if (type === "video") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
    </svg>
  );
}

export default async function StaffMaterialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row) => {
    const c = row.classes as unknown as { id: string; name: string; level_id: string; levels: { name?: string } | null };
    const levelName = Array.isArray(c?.levels) ? c.levels[0]?.name : (c?.levels as { name?: string } | null)?.name;
    return c?.id ? { id: c.id, name: c.name, levelId: c.level_id, levelName: levelName ?? "" } : null;
  }).filter(Boolean) as { id: string; name: string; levelId: string; levelName: string }[];

  const classIds = classList.map(c => c.id);
  const { data: allMaterials } = classIds.length
    ? await supabase.from("materials").select("*").in("class_id", classIds).order("created_at", { ascending: false })
    : { data: [] };

  type MatRow = { id: string; title: string; description: string | null; material_type: string; url: string | null; created_at: string; class_id: string };
  const materialsByClass: Record<string, MatRow[]> = {};
  for (const m of allMaterials ?? []) {
    const mat = m as MatRow;
    if (!materialsByClass[mat.class_id]) materialsByClass[mat.class_id] = [];
    materialsByClass[mat.class_id]!.push(mat);
  }

  if (!classList.length) {
    return (
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, marginBottom: 8 }}>Materials</h1>
        <div className="cd-card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: C.muted }}>You are not assigned to any class yet. Ask an admin to assign you from Classes.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Course Materials</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Add and manage learning materials for your classes.</p>
      </div>

      {classList.map(cls => (
        <div key={cls.id} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 14 }}>
            {cls.name}
            <span style={{ marginLeft: 10, fontSize: 12.5, fontWeight: 600, color: C.muted }}>{cls.levelName}</span>
          </h2>

          <div className="cd-grid-2-1" style={{ alignItems: "flex-start" }}>
            {/* Materials list */}
            <div className="cd-card" style={{ padding: 0 }}>
              {!(materialsByClass[cls.id] ?? []).length ? (
                <p style={{ padding: "32px 22px", textAlign: "center", color: C.muted, fontSize: 13.5 }}>
                  No materials added yet for this class.
                </p>
              ) : (
                <div>
                  {(materialsByClass[cls.id] ?? []).map((m) => {
                    const mat = m as { id: string; title: string; description: string | null; material_type: string; url: string | null; created_at: string };
                    return (
                      <div key={mat.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <TypeIcon type={mat.material_type} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{mat.title}</span>
                            <TypeBadge type={mat.material_type} />
                          </div>
                          {mat.description && <p style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{mat.description}</p>}
                          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{fmtDate(mat.created_at)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                          {mat.url && (
                            <a href={mat.url} target="_blank" rel="noopener noreferrer"
                              className="cd-mini-btn" style={{ textDecoration: "none" }}>
                              Open
                            </a>
                          )}
                          <form action={deleteMaterial.bind(null, mat.id) as unknown as (fd: FormData) => Promise<void>} style={{ display: "inline" }}>
                            <button type="submit" style={{ background: "rgba(201,74,58,.1)", border: "none", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 700, color: "#b3402f", cursor: "pointer" }}>
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add material form */}
            <div className="cd-card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Add material</h3>
              <form action={createMaterial as unknown as (fd: FormData) => Promise<void>} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input type="hidden" name="class_id" value={cls.id} />
                <label className="cd-fld">
                  <span>Title</span>
                  <input name="title" type="text" required placeholder="e.g. Unit 3 Grammar Notes" />
                </label>
                <label className="cd-fld">
                  <span>Description (optional)</span>
                  <input name="description" type="text" placeholder="Brief description…" />
                </label>
                <label className="cd-fld">
                  <span>Type</span>
                  <select name="material_type" defaultValue="link">
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="cd-fld">
                  <span>URL</span>
                  <input name="url" type="url" placeholder="https://…" />
                </label>
                <button type="submit" className="cd-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Add material
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
