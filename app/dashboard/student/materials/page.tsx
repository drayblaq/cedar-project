import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser } from "@/lib/student-auth";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec" };

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
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>
    </svg>
  );
  if (type === "link") return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
  if (type === "video") return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
    </svg>
  );
}

export default async function StudentMaterialsPage() {
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  if (!result.student) {
    return (
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>Materials</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: C.muted }}>No student record linked to your account yet.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { student } = result;

  // Get classes at the student's level
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("level_id", student.level_id ?? "");

  const classIds = (classes ?? []).map(c => c.id);

  const { data: materials } = classIds.length
    ? await supabase
        .from("materials")
        .select("*, classes(name)")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  type MatRow = { id: string; title: string; description: string | null; material_type: string; url: string | null; created_at: string; class_id: string; classes: { name: string } | null };
  const byClass: Record<string, { className: string; items: MatRow[] }> = {};
  for (const m of materials ?? []) {
    const mat = m as { id: string; title: string; description: string | null; material_type: string; url: string | null; created_at: string; class_id: string; classes: { name: string } | null };
    const className = mat.classes?.name ?? "General";
    if (!byClass[mat.class_id]) byClass[mat.class_id] = { className, items: [] };
    byClass[mat.class_id]!.items!.push(mat);
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Course Materials</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
          Learning resources shared by your instructor.
        </p>
      </div>

      {!Object.keys(byClass).length ? (
        <div className="cd-card" style={{ padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>No materials yet</p>
          <p style={{ fontSize: 13.5, color: C.muted, maxWidth: 360, margin: "0 auto" }}>
            No materials have been shared yet. Check back after your next class.
          </p>
        </div>
      ) : (
        Object.values(byClass).map(({ className, items }) => (
          <div key={className} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{className}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(items ?? []).map((m) => {
                const mat = m as { id: string; title: string; description: string | null; material_type: string; url: string | null; created_at: string };
                return (
                  <div key={mat.id} className="cd-card" style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <TypeIcon type={mat.material_type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{mat.title}</span>
                        <TypeBadge type={mat.material_type} />
                      </div>
                      {mat.description && (
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 4 }}>{mat.description}</p>
                      )}
                      <span style={{ fontSize: 11.5, color: C.muted }}>{fmtDate(mat.created_at)}</span>
                    </div>
                    {mat.url && (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
                          border: `1.5px solid ${C.green}`, color: C.green, background: "transparent",
                          borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700,
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        Open
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
