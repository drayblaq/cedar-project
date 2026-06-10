import { createClient } from "@/lib/supabase/server";
import { BulkUploadClient } from "./BulkUploadClient";
import { deleteMaterial } from "@/app/dashboard/actions/index";

const C = {
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenWash: "#f0fdf4",
  greenDark: "#15803d",
  bg: "#f8fafc",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const TYPE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  pdf:      { bg: "#fef2f2", fg: "#b91c1c", label: "PDF" },
  audio:    { bg: "#fdf4ff", fg: "#7e22ce", label: "Audio" },
  link:     { bg: "#eff6ff", fg: "#1d4ed8", label: "Link" },
  video:    { bg: "#f5f3ff", fg: "#7c3aed", label: "Video" },
  document: { bg: "#f9fafb", fg: "#374151", label: "Doc" },
  other:    { bg: "#f8fafc", fg: "#475569", label: "Other" },
};

type Material = {
  id: string;
  title: string;
  material_type: string;
  url: string | null;
  level_id: string | null;
  week_number: number | null;
  is_public: boolean;
  created_at: string;
  levels: { name: string } | { name: string }[] | null;
};

export default async function AdminLibraryPage() {
  const supabase = await createClient();

  const [{ data: levels }, { data: materialsRaw }] = await Promise.all([
    supabase.from("levels").select("id, name").order("sort_order"),
    supabase
      .from("materials")
      .select("id, title, material_type, url, level_id, week_number, is_public, created_at, levels(name)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const materials = (materialsRaw ?? []) as Material[];

  // Group by level name
  const byLevel: Record<string, Material[]> = {};
  for (const m of materials) {
    const lvlName = Array.isArray(m.levels) ? m.levels[0]?.name : m.levels?.name;
    const key = lvlName ?? (m.is_public ? "All Students (Public)" : "Unassigned");
    if (!byLevel[key]) byLevel[key] = [];
    byLevel[key].push(m);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Learning Library</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Bulk upload PDFs, audio files, and resources organized by level and week.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* Left — materials table */}
        <div>
          {!materials.length ? (
            <div className="cd-card" style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: C.muted }}>No materials yet. Upload files using the panel on the right.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {Object.entries(byLevel).map(([levelName, items]) => (
                <div key={levelName}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>
                    {levelName} — {items.length} file{items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="cd-card" style={{ padding: 0, overflow: "hidden" }}>
                    {items.map((m, i) => {
                      const ts = TYPE_STYLE[m.material_type] ?? TYPE_STYLE.other;
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 18px",
                            borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, background: ts.bg, color: ts.fg, borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>
                            {ts.label}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.title}
                            </div>
                            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                              {m.week_number != null && `Week ${m.week_number} · `}
                              {fmtDate(m.created_at)}
                              {m.is_public && <span style={{ marginLeft: 6, color: C.green, fontWeight: 700 }}>Public</span>}
                            </div>
                          </div>
                          {m.url && (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 12, fontWeight: 600, color: C.greenDark, textDecoration: "none", flexShrink: 0 }}
                            >
                              Open ↗
                            </a>
                          )}
                          <form action={deleteMaterial.bind(null, m.id) as unknown as (fd: FormData) => Promise<void>} style={{ display: "inline" }}>
                            <button
                              type="submit"
                              style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, color: "#b91c1c", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — bulk upload panel */}
        <div className="cd-card" style={{ padding: 22, height: "fit-content" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Bulk Upload</h2>
          <BulkUploadClient levels={(levels ?? []) as { id: string; name: string }[]} />
        </div>
      </div>
    </div>
  );
}
