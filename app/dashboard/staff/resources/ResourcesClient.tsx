"use client";

import { useState, useMemo } from "react";
import { DocumentViewer, type ViewerMaterial } from "./DocumentViewer";

const C = {
  ink: "#0f172a",
  sub: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenDark: "#15803d",
  greenLight: "#f0fdf4",
  greenBorder: "#bbf7d0",
  bg: "#f8fafc",
  surface: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

export type ResourceMaterial = {
  id: string;
  title: string;
  description: string | null;
  material_type: string;
  url: string | null;
  level_id: string | null;
  week_number: number | null;
  teacher_only: boolean;
  levels: { name: string } | { name: string }[] | null;
};

function levelName(m: ResourceMaterial): string {
  if (!m.levels) return "Unassigned";
  if (Array.isArray(m.levels)) return m.levels[0]?.name ?? "Unassigned";
  return m.levels.name;
}

function TypeChip({ type }: { type: string }) {
  const isPdf = type === "pdf";
  const isAudio = type === "audio";
  const isVideo = type === "video";
  const bg = isPdf ? "#fef2f2" : isAudio ? "#fdf4ff" : isVideo ? "#f5f3ff" : "#eff6ff";
  const fg = isPdf ? "#b91c1c" : isAudio ? "#7e22ce" : isVideo ? "#7c3aed" : "#1d4ed8";
  const label = isPdf ? "PDF" : isAudio ? "MP3" : isVideo ? "MP4" : "DOC";
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bg }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: fg }}>{label}</span>
    </div>
  );
}

function DocumentCard({ material, onOpen }: { material: ResourceMaterial; onOpen: (m: ViewerMaterial) => void }) {
  const [hovered, setHovered] = useState(false);
  const canView = !!material.url && (material.material_type === "pdf" || material.material_type === "document");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hovered ? C.greenBorder : C.border}`,
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: hovered ? "0 4px 12px rgba(22,163,74,.08)" : C.shadow,
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      <TypeChip type={material.material_type} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {material.title}
        </p>
        {material.description && (
          <p style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {material.description}
          </p>
        )}
        <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>
          {material.material_type.toUpperCase()}
          {material.week_number != null && ` · Week ${material.week_number}`}
        </p>
      </div>

      {canView ? (
        <button
          onClick={() => onOpen({ id: material.id, title: material.title, url: material.url!, material_type: material.material_type, description: material.description })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: hovered ? C.green : C.greenLight,
            color: hovered ? "#fff" : C.greenDark,
            border: `1px solid ${hovered ? C.green : C.greenBorder}`,
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            transition: "background .15s, color .15s, border-color .15s",
          }}
        >
          Open
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      ) : (
        <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>Preview not available</span>
      )}
    </div>
  );
}

interface Props {
  materials: ResourceMaterial[];
}

export function ResourcesClient({ materials }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ViewerMaterial | null>(null);

  // Build level + week index
  const levelMap = useMemo(() => {
    const map = new Map<string, { id: string | null; name: string; weeks: Set<number> }>();
    for (const m of materials) {
      const key = m.level_id ?? "__none";
      const name = levelName(m);
      if (!map.has(key)) map.set(key, { id: m.level_id, name, weeks: new Set() });
      if (m.week_number != null) map.get(key)!.weeks.add(m.week_number);
    }
    return map;
  }, [materials]);

  const levels = useMemo(() => [...levelMap.values()], [levelMap]);

  // Default selection to first level
  const activeLevel = selectedLevel ?? levels[0]?.id ?? null;
  const activeLevelKey = activeLevel ?? "__none";
  const activeLevelData = levelMap.get(activeLevelKey);
  const sortedWeeks = useMemo(() => [...(activeLevelData?.weeks ?? [])].sort((a, b) => a - b), [activeLevelData]);

  // Filter materials
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const levelMatch = (m.level_id ?? "__none") === activeLevelKey;
      const weekMatch = selectedWeek === "all" || m.week_number === selectedWeek;
      const searchMatch = !search.trim() || m.title.toLowerCase().includes(search.toLowerCase());
      return levelMatch && weekMatch && searchMatch;
    });
  }, [materials, activeLevelKey, selectedWeek, search]);

  if (!materials.length) {
    return (
      <div style={{ padding: "48px 32px", textAlign: "center", background: C.bg, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.greenLight, color: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 8 }}>No teacher resources yet</h2>
          <p style={{ fontSize: 14, color: C.sub, maxWidth: 340, margin: "0 auto", lineHeight: 1.7 }}>
            Upload lesson plans and teacher-only documents in the Library section. Mark them as "Teacher only" when uploading.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentViewer material={viewing} onClose={() => setViewing(null)} />

      <div style={{ display: "flex", height: "calc(100vh - 120px)", background: C.bg, overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          background: C.bg,
          overflowY: "auto",
          paddingTop: 8,
          paddingBottom: 24,
        }}>
          {levels.map((lvl) => {
            const key = lvl.id ?? "__none";
            const isActive = key === activeLevelKey;
            return (
              <div key={key}>
                <button
                  onClick={() => { setSelectedLevel(lvl.id); setSelectedWeek("all"); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? C.greenDark : C.muted,
                    backgroundColor: isActive ? C.greenLight : "transparent",
                    transition: "color .12s, background .12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = C.sub; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = C.muted; }}
                >
                  {lvl.name}
                </button>

                {isActive && (
                  <>
                    <button
                      onClick={() => setSelectedWeek("all")}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 16px 6px 24px",
                        fontSize: 13,
                        background: "none",
                        border: "none",
                        borderRight: selectedWeek === "all" ? `2px solid ${C.green}` : "2px solid transparent",
                        cursor: "pointer",
                        color: selectedWeek === "all" ? C.greenDark : C.sub,
                        fontWeight: selectedWeek === "all" ? 700 : 400,
                        backgroundColor: selectedWeek === "all" ? C.greenLight : "transparent",
                        transition: "background .12s",
                      }}
                    >
                      All weeks
                    </button>
                    {sortedWeeks.map((wk) => (
                      <button
                        key={wk}
                        onClick={() => setSelectedWeek(wk)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 16px 6px 24px",
                          fontSize: 13,
                          background: "none",
                          border: "none",
                          borderRight: selectedWeek === wk ? `2px solid ${C.green}` : "2px solid transparent",
                          cursor: "pointer",
                          color: selectedWeek === wk ? C.greenDark : C.sub,
                          fontWeight: selectedWeek === wk ? 700 : 400,
                          backgroundColor: selectedWeek === wk ? C.greenLight : "transparent",
                          transition: "background .12s",
                        }}
                      >
                        Week {wk}
                      </button>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </aside>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Section header */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em" }}>
              {activeLevelData?.name ?? "Resources"}
              {selectedWeek !== "all" && ` — Week ${selectedWeek}`}
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
              {filtered.length} {filtered.length === 1 ? "document" : "documents"}
            </p>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
              width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 14px 9px 36px",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 13,
                color: C.ink,
                background: C.surface,
                outline: "none",
              }}
            />
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: C.muted }}>No documents match your search.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((m) => (
                <DocumentCard key={m.id} material={m} onOpen={setViewing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
