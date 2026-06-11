"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteMaterial } from "@/app/dashboard/actions/classes";
import { DocumentViewer, type ViewerDoc } from "./DocumentViewer";
import { UploadPanel } from "./UploadPanel";

const S = {
  ink: "#0f172a",
  sub: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenDark: "#15803d",
  greenLight: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#f59e0b",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  bg: "#f8fafc",
  surface: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,.06)",
};

// ─── Types ──────────────────────────────────────────────────────────────────

type Material = {
  id: string;
  title: string;
  description: string | null;
  material_type: string;
  url: string | null;
  file_path: string | null;
  level_id: string | null;
  week_number: number | null;
  teacher_only: boolean;
  created_at: string;
};

type LevelEntry = {
  id: string;
  name: string;
  sort_order: number;
  weekCount: number;
  fileCount: number;
};

type WeekEntry = { number: number; fileCount: number };

type View = "root" | "level" | "week";

export interface ResourceExplorerProps {
  isAdmin: boolean;
  allowedLevelIds?: string[]; // undefined = show all (admin); defined = filter (staff)
}

// ─── Folder icon ────────────────────────────────────────────────────────────

function FolderIcon({ size = 56, color = S.amber }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
    </svg>
  );
}

// ─── Type chip ───────────────────────────────────────────────────────────────

function TypeChip({ type }: { type: string }) {
  const isPdf = type === "pdf";
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: isPdf ? "#fef2f2" : "#eff6ff",
    }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>
        {isPdf ? "PDF" : "DOC"}
      </span>
    </div>
  );
}

// ─── Folder card ─────────────────────────────────────────────────────────────

function FolderCard({ name, subtitle, onClick }: { name: string; subtitle: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        padding: "16px 8px", borderRadius: 14,
        border: `1px solid ${hovered ? S.amberBorder : "transparent"}`,
        background: hovered ? S.amberLight : "transparent",
        cursor: "pointer", textAlign: "center",
        transition: "background .15s, border-color .15s",
      }}
    >
      <FolderIcon size={52} color={hovered ? "#d97706" : S.amber} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: hovered ? "#92400e" : S.ink }}>{name}</p>
        <p style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{subtitle}</p>
      </div>
    </button>
  );
}

// ─── File row ────────────────────────────────────────────────────────────────

function FileRow({
  file, isAdmin, onOpen, onDelete,
}: {
  file: Material;
  isAdmin: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 16px",
        borderBottom: `1px solid ${S.border}`,
        background: hovered ? S.bg : S.surface,
        transition: "background .12s",
      }}
    >
      {/* Icon + title */}
      <TypeChip type={file.material_type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.title}
        </p>
        {file.description && (
          <p style={{ fontSize: 12, color: S.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.description}
          </p>
        )}
      </div>

      {/* Type label (desktop) */}
      <span style={{ fontSize: 12, color: S.muted, flexShrink: 0, minWidth: 90, display: "none" }}>
        {file.material_type === "pdf" ? "PDF Document" : "Word Document"}
      </span>

      {/* Date (desktop) */}
      <span style={{ fontSize: 12, color: S.muted, flexShrink: 0, minWidth: 60 }}>{added}</span>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {canView && (
          <button
            onClick={onOpen}
            style={{
              fontSize: 12, fontWeight: 700, color: S.greenDark,
              padding: "5px 10px", borderRadius: 7,
              background: hovered ? S.greenLight : "transparent",
              border: "none", cursor: "pointer",
              transition: "background .12s",
            }}
          >
            Open
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            style={{
              fontSize: 12, fontWeight: 600, color: "#dc2626",
              padding: "5px 10px", borderRadius: 7,
              background: "transparent",
              border: "none", cursor: "pointer",
              opacity: hovered ? 1 : 0,
              transition: "opacity .12s, background .12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: 110, borderRadius: 14, background: S.border, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ message, subMessage }: { message: string; subMessage?: string }) {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <FolderIcon size={64} color="#cbd5e1" />
      <p style={{ fontSize: 15, fontWeight: 700, color: S.sub, marginTop: 16 }}>{message}</p>
      {subMessage && <p style={{ fontSize: 13, color: S.muted, marginTop: 6, maxWidth: 320, margin: "8px auto 0" }}>{subMessage}</p>}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ResourceExplorer({ isAdmin, allowedLevelIds }: ResourceExplorerProps) {
  const supabase = createClient();

  const [view, setView] = useState<View>("root");
  const [selectedLevel, setSelectedLevel] = useState<LevelEntry | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const [levels, setLevels] = useState<LevelEntry[]>([]);
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [files, setFiles] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewingDoc, setViewingDoc] = useState<ViewerDoc | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ levelId: string; levelName: string; weekNumber: number } | null>(null);
  const [search, setSearch] = useState("");

  // ── Fetch levels ────────────────────────────────────────────────────────────
  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("materials")
        .select("level_id, week_number, levels(id, name, sort_order)")
        .eq("teacher_only", true)
        .not("level_id", "is", null);

      if (!data) return;

      // Aggregate per level
      const map = new Map<string, { name: string; sort_order: number; weeks: Set<number>; files: number }>();
      for (const row of data) {
        const lvlArr = row.levels as { id: string; name: string; sort_order: number }[] | { id: string; name: string; sort_order: number } | null;
        const lvl = Array.isArray(lvlArr) ? lvlArr[0] : lvlArr;
        if (!lvl || !row.level_id) continue;
        if (allowedLevelIds && !allowedLevelIds.includes(row.level_id)) continue;
        if (!map.has(row.level_id)) map.set(row.level_id, { name: lvl.name, sort_order: lvl.sort_order ?? 0, weeks: new Set(), files: 0 });
        const entry = map.get(row.level_id)!;
        entry.files++;
        if (row.week_number != null) entry.weeks.add(row.week_number);
      }

      const result: LevelEntry[] = [...map.entries()]
        .map(([id, v]) => ({ id, name: v.name, sort_order: v.sort_order, weekCount: v.weeks.size, fileCount: v.files }))
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

      setLevels(result);
    } finally {
      setLoading(false);
    }
  }, [supabase, allowedLevelIds]);

  // ── Fetch weeks ─────────────────────────────────────────────────────────────
  const fetchWeeks = useCallback(async (levelId: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("materials")
        .select("week_number")
        .eq("teacher_only", true)
        .eq("level_id", levelId)
        .not("week_number", "is", null)
        .order("week_number");

      if (!data) return;

      const counts = new Map<number, number>();
      for (const row of data) {
        if (row.week_number != null) counts.set(row.week_number, (counts.get(row.week_number) ?? 0) + 1);
      }

      setWeeks([...counts.entries()].map(([number, fileCount]) => ({ number, fileCount })));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ── Fetch files ─────────────────────────────────────────────────────────────
  const fetchFiles = useCallback(async (levelId: string, week: number) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("materials")
        .select("id, title, description, material_type, url, file_path, level_id, week_number, teacher_only, created_at")
        .eq("teacher_only", true)
        .eq("level_id", levelId)
        .eq("week_number", week)
        .order("title");
      setFiles((data ?? []) as Material[]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  function goToLevel(level: LevelEntry) {
    setSelectedLevel(level);
    setSelectedWeek(null);
    setSearch("");
    setView("level");
    fetchWeeks(level.id);
  }

  function goToWeek(week: number) {
    setSelectedWeek(week);
    setSearch("");
    setView("week");
    fetchFiles(selectedLevel!.id, week);
  }

  function goBack() {
    if (view === "week") { setView("level"); setSelectedWeek(null); setFiles([]); }
    else if (view === "level") { setView("root"); setSelectedLevel(null); setWeeks([]); }
    setSearch("");
  }

  function goRoot() { setView("root"); setSelectedLevel(null); setSelectedWeek(null); setFiles([]); setWeeks([]); setSearch(""); }

  // ── Delete ────────────────────────────────────────────────────────────────────
  async function handleDelete(fileId: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await deleteMaterial(fileId);
    if (selectedLevel && selectedWeek != null) fetchFiles(selectedLevel.id, selectedWeek);
  }

  // ── Upload success ────────────────────────────────────────────────────────────
  function handleUploadSuccess() {
    setUploadTarget(null);
    if (selectedLevel && selectedWeek != null) {
      fetchFiles(selectedLevel.id, selectedWeek);
    }
    fetchLevels();
  }

  // ── Filtered files ────────────────────────────────────────────────────────────
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.title.toLowerCase().includes(q));
  }, [files, search]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {viewingDoc && <DocumentViewer material={viewingDoc} onClose={() => setViewingDoc(null)} />}

      {uploadTarget && (
        <UploadPanel
          levelId={uploadTarget.levelId}
          levelName={uploadTarget.levelName}
          weekNumber={uploadTarget.weekNumber}
          onClose={() => setUploadTarget(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      <div style={{ background: S.bg, minHeight: "100%", padding: "24px 28px 48px" }}>

        {/* ── Breadcrumb + header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 10, flexWrap: "wrap" }}>
            <button
              onClick={goRoot}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontWeight: view === "root" ? 700 : 600,
                color: view === "root" ? S.ink : S.green,
                fontSize: 13,
              }}
            >
              Resources
            </button>
            {selectedLevel && (
              <>
                <span style={{ color: "#cbd5e1" }}>/</span>
                <button
                  onClick={() => { if (view === "week") { setView("level"); setSelectedWeek(null); setFiles([]); setSearch(""); } }}
                  style={{
                    background: "none", border: "none", cursor: view === "week" ? "pointer" : "default", padding: 0,
                    fontWeight: view === "level" ? 700 : 600,
                    color: view === "level" ? S.ink : S.green,
                    fontSize: 13,
                  }}
                >
                  {selectedLevel.name}
                </button>
              </>
            )}
            {selectedWeek != null && (
              <>
                <span style={{ color: "#cbd5e1" }}>/</span>
                <span style={{ fontWeight: 700, color: S.ink }}>Week {selectedWeek}</span>
              </>
            )}
          </nav>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {view !== "root" && (
              <button
                onClick={goBack}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: S.surface, border: `1px solid ${S.border}`,
                  borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600,
                  color: S.sub, cursor: "pointer",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
            <h1 style={{ fontSize: 22, fontWeight: 900, color: S.ink, letterSpacing: "-0.02em" }}>
              {view === "root" && "Resources"}
              {view === "level" && selectedLevel?.name}
              {view === "week" && `Week ${selectedWeek}`}
            </h1>
            {isAdmin && view === "week" && selectedLevel && selectedWeek != null && (
              <button
                onClick={() => setUploadTarget({ levelId: selectedLevel.id, levelName: selectedLevel.name, weekNumber: selectedWeek })}
                style={{
                  marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                  background: S.green, color: "#fff", border: "none", borderRadius: 9,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Upload files
              </button>
            )}
          </div>
        </div>

        {/* ── Root view — level folders ────────────────────────────────────── */}
        {view === "root" && (
          loading ? <Skeleton /> :
          levels.length === 0 ? (
            <EmptyState
              message="No resources uploaded yet"
              subMessage={isAdmin ? "Upload your first lesson plan using the button above." : "Ask your admin to upload lesson plans marked as Teacher Only."}
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
              {levels.map((lvl) => (
                <FolderCard
                  key={lvl.id}
                  name={lvl.name}
                  subtitle={`${lvl.weekCount} week${lvl.weekCount !== 1 ? "s" : ""}`}
                  onClick={() => goToLevel(lvl)}
                />
              ))}
            </div>
          )
        )}

        {/* ── Level view — week folders ────────────────────────────────────── */}
        {view === "level" && (
          loading ? <Skeleton /> :
          weeks.length === 0 ? (
            <EmptyState message="No weeks in this level yet" subMessage={isAdmin ? "Upload files to create weeks." : undefined} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 6 }}>
              {weeks.map((wk) => (
                <FolderCard
                  key={wk.number}
                  name={`Week ${wk.number}`}
                  subtitle={`${wk.fileCount} file${wk.fileCount !== 1 ? "s" : ""}`}
                  onClick={() => goToWeek(wk.number)}
                />
              ))}
            </div>
          )
        )}

        {/* ── Week view — file list ────────────────────────────────────────── */}
        {view === "week" && (
          <div style={{ background: S.surface, borderRadius: 14, border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: S.shadow }}>
            {/* Search */}
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${S.border}` }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                  width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search in this week…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "8px 12px 8px 34px", fontSize: 13,
                    border: `1px solid ${S.border}`, borderRadius: 9,
                    outline: "none", color: S.ink, background: S.bg,
                  }}
                />
              </div>
            </div>

            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: S.bg, borderBottom: `1px solid ${S.border}` }}>
              <div style={{ width: 34 }} />
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted }}>Name</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted, minWidth: 60 }}>Added</span>
              <div style={{ width: 120 }} />
            </div>

            {/* Files */}
            {loading ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: S.muted }}>Loading…</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: S.muted }}>
                  {search ? "No files match your search." : isAdmin ? "No files yet — click Upload to add files." : "No files in this week yet."}
                </p>
              </div>
            ) : (
              <div>
                {filteredFiles.map((f) => (
                  <FileRow
                    key={f.id}
                    file={f}
                    isAdmin={isAdmin}
                    onOpen={() => f.url && setViewingDoc({ title: f.title, url: f.url, material_type: f.material_type })}
                    onDelete={() => handleDelete(f.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
