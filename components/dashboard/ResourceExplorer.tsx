"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteMaterial, createFolder, deleteFolder, renameFolder } from "@/app/dashboard/actions/classes";
import { DocumentViewer, type ViewerDoc } from "./DocumentViewer";
import { UploadPanel } from "./UploadPanel";

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  ink:        "#0f172a",
  sub:        "#374151",
  muted:      "#6b7280",
  faint:      "#9ca3af",
  border:     "#e5e7eb",
  borderHover:"#d1d5db",
  bg:         "#f9fafb",
  surface:    "#ffffff",
  blue:       "#2563eb",
  blueDark:   "#1d4ed8",
  blueLight:  "#eff6ff",
  blueBorder: "#bfdbfe",
  green:      "#16a34a",
  greenDark:  "#15803d",
  greenLight: "#f0fdf4",
  greenBorder:"#bbf7d0",
  red:        "#dc2626",
  redLight:   "#fef2f2",
  redBorder:  "#fecaca",
  shadow:     "0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)",
  shadowMd:   "0 4px 6px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.06)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

type Material = {
  id: string;
  title: string;
  material_type: string;
  url: string | null;
  folder_id: string | null;
  created_at: string;
  teacher_only?: boolean;
  student_level_id?: string | null;
  levels?: { name: string } | { name: string }[] | null;
  questionCount?: number;
};

export interface ResourceExplorerProps {
  isAdmin: boolean;
  allowedLevelIds?: string[];
  filterTeacherOnly?: boolean;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconFolder({ size = 18, color = S.blue }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconFile({ isPdf }: { isPdf: boolean }) {
  const color = isPdf ? "#dc2626" : "#2563eb";
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

// ─── FolderCard ───────────────────────────────────────────────────────────────
function FolderCard({
  folder, count, isAdmin, onClick, onDelete,
  isRenaming, renameValue, onRenameStart, onRenameChange, onRenameSave, onRenameCancel,
}: {
  folder: Folder; count?: number; isAdmin: boolean; onClick: () => void; onDelete: () => void;
  isRenaming: boolean; renameValue: string;
  onRenameStart: () => void; onRenameChange: (v: string) => void;
  onRenameSave: () => void; onRenameCancel: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // ── Renaming mode: standalone row, NOT inside a button ────────────────────
  if (isRenaming) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        border: `2px solid ${S.blue}`, borderRadius: 10,
        background: S.surface,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: S.blueLight, border: `1px solid ${S.blueBorder}`,
        }}>
          <IconFolder size={20} color={S.blue} />
        </div>
        <input
          autoFocus
          value={renameValue}
          onChange={e => onRenameChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") onRenameSave();
            if (e.key === "Escape") onRenameCancel();
          }}
          style={{
            flex: 1, minWidth: 0,
            fontSize: 14, fontWeight: 600, color: S.ink,
            border: `1px solid ${S.blueBorder}`, borderRadius: 7,
            padding: "6px 10px", outline: "none", background: S.surface,
          }}
        />
        <button
          onClick={onRenameSave}
          style={{
            flexShrink: 0, padding: "6px 14px",
            background: S.green, color: "#fff", border: "none",
            borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={onRenameCancel}
          style={{
            flexShrink: 0, padding: "6px 12px",
            background: S.surface, color: S.muted,
            border: `1px solid ${S.border}`, borderRadius: 7,
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // ── Normal mode ───────────────────────────────────────────────────────────
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable area */}
      <button
        onClick={onClick}
        style={{
          flex: 1, minWidth: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px",
          borderRadius: isAdmin && hovered ? "10px 0 0 10px" : 10,
          border: `1px solid ${hovered ? S.borderHover : S.border}`,
          borderRight: isAdmin && hovered ? "none" : `1px solid ${hovered ? S.borderHover : S.border}`,
          background: hovered ? S.bg : S.surface,
          cursor: "pointer", textAlign: "left",
          transition: "background .1s, border-color .1s",
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#dbeafe", border: `1.5px solid #93c5fd`,
        }}>
          <IconFolder size={20} color="#1d4ed8" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 700, color: S.ink,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {folder.name}
          </p>
          <p style={{ fontSize: 12, color: S.muted, marginTop: 1 }}>
            {count === undefined ? "..." : `${count} item${count !== 1 ? "s" : ""}`}
          </p>
        </div>
      </button>

      {/* Admin action buttons — appear as attached right segment on hover */}
      {isAdmin && hovered && (
        <div style={{
          display: "flex", flexShrink: 0,
          border: `1px solid ${S.borderHover}`, borderLeft: "none",
          borderRadius: "0 10px 10px 0",
          overflow: "hidden",
        }}>
          <button
            onClick={e => { e.stopPropagation(); onRenameStart(); }}
            title="Rename"
            style={{
              width: 38, height: 58,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: S.blueLight, border: "none",
              borderRight: `1px solid ${S.blueBorder}`,
              cursor: "pointer", color: S.blue,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            style={{
              width: 38, height: 58,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: S.redLight, border: "none",
              cursor: "pointer", color: S.red,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── FileRow (list view) ──────────────────────────────────────────────────────
function FileRow({ file, isAdmin, isLast, onOpen, onDelete }: {
  file: Material; isAdmin: boolean; isLast?: boolean; onOpen: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPdf = file.material_type === "pdf";
  const canView = !!file.url && (isPdf || file.material_type === "document");
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px",
        borderBottom: isLast ? "none" : `1px solid ${S.border}`,
        background: hovered ? S.bg : S.surface,
        transition: "background .1s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 9, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isPdf ? "#fee2e2" : "#dbeafe",
        border: `1.5px solid ${isPdf ? "#fca5a5" : "#93c5fd"}`,
      }}>
        <IconFile isPdf={isPdf} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.title}
        </p>
        <p style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{added}</p>
      </div>

      <span style={{
        fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 5, flexShrink: 0, letterSpacing: "0.05em",
        background: isPdf ? "#fee2e2" : "#dbeafe",
        color: isPdf ? "#991b1b" : "#1e40af",
        border: `1px solid ${isPdf ? "#fca5a5" : "#93c5fd"}`,
      }}>
        {isPdf ? "PDF" : "DOC"}
      </span>

      {file.teacher_only !== undefined && (
        <span style={{
          fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 5, flexShrink: 0,
          background: file.teacher_only ? "#faf5ff" : S.greenLight,
          color: file.teacher_only ? "#6d28d9" : S.greenDark,
          border: `1px solid ${file.teacher_only ? "#ede9fe" : S.greenBorder}`,
        }}>
          {file.teacher_only ? "Staff only" : (() => {
            const lvl = Array.isArray(file.levels) ? file.levels[0]?.name : file.levels?.name;
            return lvl ? `Students · ${lvl}` : "All students";
          })()}
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {isAdmin && (
          <a
            href={`/admin/library/questions/${file.id}`}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 11.5, fontWeight: 600, color: "#6d28d9",
              padding: "4px 9px", borderRadius: 6,
              background: hovered ? "#faf5ff" : "transparent",
              border: `1px solid ${hovered ? "#ede9fe" : "transparent"}`,
              textDecoration: "none", transition: "background .1s, border-color .1s",
            }}
          >
            Quiz {file.questionCount !== undefined ? `(${file.questionCount})` : ""}
          </a>
        )}
        {canView && (
          <button
            onClick={onOpen}
            style={{
              fontSize: 12, fontWeight: 600, color: S.green,
              padding: "4px 10px", borderRadius: 6,
              background: hovered ? S.greenLight : "transparent",
              border: `1px solid ${hovered ? S.greenBorder : "transparent"}`,
              cursor: "pointer", transition: "background .1s, border-color .1s",
            }}
          >
            Open
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            style={{
              fontSize: 11.5, fontWeight: 600, color: S.red,
              padding: "4px 9px", borderRadius: 6, border: "1px solid transparent",
              background: "transparent", cursor: "pointer",
              opacity: hovered ? 1 : 0, transition: "opacity .1s, background .1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = S.redLight; e.currentTarget.style.borderColor = S.redBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── GridFileCard ─────────────────────────────────────────────────────────────
function GridFileCard({ file, isAdmin, onOpen, onDelete }: {
  file: Material; isAdmin: boolean; onOpen: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPdf = file.material_type === "pdf";
  const canView = !!file.url && (isPdf || file.material_type === "document");
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        background: S.surface,
        border: `1px solid ${hovered ? (isPdf ? S.redBorder : S.blueBorder) : S.border}`,
        borderRadius: 12, overflow: "hidden",
        transition: "border-color .1s, box-shadow .1s",
        boxShadow: hovered ? S.shadowMd : S.shadow,
      }}
    >
      <div style={{
        height: 80, display: "flex", alignItems: "center", justifyContent: "center",
        background: isPdf ? "#fee2e2" : "#dbeafe",
        borderBottom: `1.5px solid ${isPdf ? "#fca5a5" : "#93c5fd"}`,
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={isPdf ? "#dc2626" : "#2563eb"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>

      <div style={{
        position: "absolute", top: 8, left: 8,
        fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
        background: isPdf ? S.red : S.blue, color: "#fff", letterSpacing: "0.06em",
      }}>
        {isPdf ? "PDF" : "DOC"}
      </div>

      <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{
          fontSize: 12.5, fontWeight: 700, color: S.ink, lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {file.title}
        </p>
        <p style={{ fontSize: 10.5, color: S.muted }}>{added}</p>
        {canView && (
          <button
            onClick={onOpen}
            style={{
              marginTop: "auto",
              width: "100%", padding: "6px 0",
              fontSize: 12, fontWeight: 600,
              color: hovered ? "#fff" : S.green,
              background: hovered ? S.green : S.greenLight,
              border: `1px solid ${S.greenBorder}`,
              borderRadius: 7, cursor: "pointer",
              transition: "background .1s, color .1s",
            }}
          >
            Open
          </button>
        )}
      </div>

      {isAdmin && hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: "absolute", top: 8, right: 8,
            width: 24, height: 24, borderRadius: 6,
            background: S.redLight, border: `1px solid ${S.redBorder}`,
            color: S.red, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
          title="Delete file"
        >
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ResourceExplorer({ isAdmin, filterTeacherOnly }: ResourceExplorerProps) {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [viewingDoc, setViewingDoc] = useState<ViewerDoc | null>(null);
  const [search, setSearch] = useState("");

  // ── Load contents ─────────────────────────────────────────────────────────
  const loadContents = useCallback(async (folderId: string | null) => {
    setLoading(true);

    let fq = supabase.from("library_folders").select("*").order("sort_order").order("name");
    if (folderId) fq = fq.eq("parent_id", folderId);
    else fq = fq.is("parent_id", null);
    const { data: foldersData } = await fq;

    let mq = supabase
      .from("materials")
      .select("id, title, material_type, url, folder_id, created_at, teacher_only, student_level_id, levels:student_level_id(name)")
      .order("title");
    if (filterTeacherOnly === true)  mq = mq.eq("teacher_only", true);
    if (filterTeacherOnly === false) mq = mq.eq("teacher_only", false);
    if (folderId) mq = mq.eq("folder_id", folderId);
    else          mq = mq.is("folder_id", null);
    const { data: filesData, error } = await mq;

    console.log("[ResourceExplorer] loadContents:", { folderId, filterTeacherOnly, count: filesData?.length ?? 0, error: error?.message ?? null });

    setFolders((foldersData ?? []) as Folder[]);
    setFiles((filesData ?? []) as Material[]);

    if (isAdmin && filesData && filesData.length > 0) {
      const ids = (filesData as Material[]).map(f => f.id);
      const { data: qRows } = await supabase
        .from("quiz_questions")
        .select("material_id")
        .in("material_id", ids);
      const qc: Record<string, number> = {};
      for (const row of qRows ?? []) {
        const r = row as { material_id: string };
        qc[r.material_id] = (qc[r.material_id] ?? 0) + 1;
      }
      setQuestionCounts(qc);
    }

    setLoading(false);
  }, [supabase, filterTeacherOnly]);

  useEffect(() => {
    setCurrentFolder(null);
    setBreadcrumb([]);
    setSearch("");
    loadContents(null);
  }, [loadContents]);

  // ── Folder item counts ────────────────────────────────────────────────────
  useEffect(() => {
    if (folders.length === 0) { setFolderCounts({}); return; }
    async function loadFolderCounts() {
      const counts: Record<string, number> = {};
      for (const folder of folders) {
        let fq = supabase.from("materials").select("*", { count: "exact", head: true }).eq("folder_id", folder.id);
        if (filterTeacherOnly === true)  fq = fq.eq("teacher_only", true);
        if (filterTeacherOnly === false) fq = fq.eq("teacher_only", false);
        const { count: files } = await fq;
        const { count: subs } = await supabase.from("library_folders").select("*", { count: "exact", head: true }).eq("parent_id", folder.id);
        counts[folder.id] = (files ?? 0) + (subs ?? 0);
      }
      setFolderCounts(counts);
    }
    loadFolderCounts();
  }, [folders, supabase, filterTeacherOnly]);

  // ── Navigation ────────────────────────────────────────────────────────────
  function openFolder(folder: Folder) {
    setCurrentFolder(folder);
    setBreadcrumb(prev => [...prev, folder]);
    loadContents(folder.id);
    setSearch("");
    setShowNewFolder(false);
  }

  function navigateToBreadcrumb(folder: Folder | null, index: number) {
    setCurrentFolder(folder);
    setBreadcrumb(prev => (folder === null ? [] : prev.slice(0, index + 1)));
    loadContents(folder?.id ?? null);
    setSearch("");
    setShowNewFolder(false);
  }

  function goBack() {
    const prev = breadcrumb[breadcrumb.length - 2] ?? null;
    navigateToBreadcrumb(prev, breadcrumb.length - 2);
  }

  // ── Folder CRUD ───────────────────────────────────────────────────────────
  async function handleCreateFolder() {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      const res = await createFolder(newFolderName, currentFolder?.id ?? null);
      if (res.success) {
        setNewFolderName("");
        setShowNewFolder(false);
        loadContents(currentFolder?.id ?? null);
      }
    } finally {
      setCreatingFolder(false);
    }
  }

  async function handleRenameFolder(folder: Folder) {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    const result = await renameFolder(folder.id, renameValue.trim());
    if (result.success) {
      setRenamingId(null);
      loadContents(currentFolder?.id ?? null);
    } else {
      alert("Failed to rename: " + result.error);
    }
  }

  async function handleDeleteFolder(folder: Folder) {
    const [{ count: fileCount }, { count: subCount }] = await Promise.all([
      supabase.from("materials").select("*", { count: "exact", head: true }).eq("folder_id", folder.id),
      supabase.from("library_folders").select("*", { count: "exact", head: true }).eq("parent_id", folder.id),
    ]);
    const total = (fileCount ?? 0) + (subCount ?? 0);
    let message = `Delete folder "${folder.name}"?\n\nThis cannot be undone.`;
    if (total > 0) {
      const parts: string[] = [];
      if (fileCount && fileCount > 0) parts.push(`${fileCount} file${fileCount > 1 ? "s" : ""}`);
      if (subCount && subCount > 0) parts.push(`${subCount} subfolder${subCount > 1 ? "s" : ""}`);
      message = `Delete folder "${folder.name}"?\n\nThis folder contains ${parts.join(" and ")}. All contents will be permanently deleted.\n\nThis cannot be undone.`;
    }
    if (!confirm(message)) return;
    const result = await deleteFolder(folder.id);
    if (result.success) {
      loadContents(currentFolder?.id ?? null);
    } else {
      alert("Failed to delete folder: " + result.error);
    }
  }

  // ── File delete ───────────────────────────────────────────────────────────
  async function handleDeleteFile(fileId: string, title: string) {
    if (!confirm(`Delete "${title}"?\n\nThis file will be permanently removed and cannot be recovered.`)) return;
    await deleteMaterial(fileId);
    loadContents(currentFolder?.id ?? null);
  }

  // ── Filtered files ────────────────────────────────────────────────────────
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter(f => f.title.toLowerCase().includes(q));
  }, [files, search]);

  const isEmpty = !loading && folders.length === 0 && files.length === 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {viewingDoc && <DocumentViewer material={viewingDoc} onClose={() => setViewingDoc(null)} />}

      {showUpload && (
        <UploadPanel
          folderId={currentFolder?.id ?? null}
          folderName={currentFolder?.name ?? "Library (root)"}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); loadContents(currentFolder?.id ?? null); }}
        />
      )}

      <div style={{ padding: "20px 28px 48px", background: S.bg, minHeight: "100%" }}>

        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => navigateToBreadcrumb(null, -1)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
              fontWeight: currentFolder === null ? 700 : 500,
              color: currentFolder === null ? S.ink : S.blue,
              fontSize: 13, borderRadius: 4,
            }}
          >
            Library
          </button>
          {breadcrumb.map((f, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: S.muted, fontSize: 12 }}>/</span>
              <button
                onClick={() => navigateToBreadcrumb(f, i)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
                  fontWeight: i === breadcrumb.length - 1 ? 700 : 500,
                  color: i === breadcrumb.length - 1 ? S.ink : S.blue,
                  fontSize: 13, borderRadius: 4,
                }}
              >
                {f.name}
              </button>
            </span>
          ))}
        </nav>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {currentFolder && (
            <button
              onClick={goBack}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: S.surface, border: `1px solid ${S.border}`,
                borderRadius: 8, padding: "7px 12px",
                fontSize: 13, fontWeight: 500, color: S.sub, cursor: "pointer",
                boxShadow: S.shadow,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}

          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <svg
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: S.faint, pointerEvents: "none" }}
              width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 12px 7px 32px",
                fontSize: 13, border: `1px solid ${S.border}`, borderRadius: 8,
                outline: "none", color: S.ink, background: S.surface, boxShadow: S.shadow,
              }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 2, gap: 2, boxShadow: S.shadow }}>
              {(["list", "grid"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
                  style={{
                    padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: viewMode === mode ? S.bg : "transparent",
                    color: viewMode === mode ? S.ink : S.muted,
                    transition: "background .1s, color .1s",
                  }}
                >
                  {mode === "list" ? (
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  ) : (
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {isAdmin && (
              <>
                <button
                  onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: S.surface, border: `1px solid ${S.border}`,
                    color: S.sub, borderRadius: 8, padding: "7px 14px",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", boxShadow: S.shadow,
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                  </svg>
                  <span className="re-btn-label">New folder</span>
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: S.green, color: "#fff", border: "none",
                    borderRadius: 8, padding: "7px 14px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,.1)",
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                  </svg>
                  <span className="re-btn-label">Upload</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── New folder input ───────────────────────────────────────────── */}
        {showNewFolder && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            padding: "12px 14px",
            background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10,
            boxShadow: S.shadow,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7, flexShrink: 0,
              background: S.blueLight, border: `1px solid ${S.blueBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconFolder size={16} color={S.blue} />
            </div>
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
              }}
              placeholder="Folder name (e.g. A1-A2, Unit 1)"
              style={{
                flex: 1, padding: "7px 10px", fontSize: 13,
                border: `1px solid ${S.border}`, borderRadius: 7,
                outline: "none", color: S.ink,
              }}
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              style={{
                background: S.green, color: "#fff", border: "none",
                borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {creatingFolder ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              style={{ background: "none", border: "none", fontSize: 13, color: S.muted, cursor: "pointer", padding: "7px 4px" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 58, borderRadius: 10, background: S.border }} />
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {isEmpty && (
          <div style={{
            padding: "64px 24px", textAlign: "center",
            background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: S.blueLight, border: `1px solid ${S.blueBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <IconFolder size={24} color={S.blue} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: S.sub, marginBottom: 6 }}>
              {currentFolder ? "This folder is empty" : "No folders yet"}
            </p>
            {isAdmin && (
              <p style={{ fontSize: 13, color: S.muted }}>
                {currentFolder ? "Use Upload to add files here" : "Use New folder to create your first folder"}
              </p>
            )}
          </div>
        )}

        {/* ── Folders section ────────────────────────────────────────────── */}
        {!loading && folders.length > 0 && (
          <div style={{ marginBottom: files.length > 0 ? 24 : 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>
              Folders ({folders.length})
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  count={folderCounts[folder.id]}
                  isAdmin={isAdmin}
                  onClick={() => openFolder(folder)}
                  onDelete={() => handleDeleteFolder(folder)}
                  isRenaming={renamingId === folder.id}
                  renameValue={renamingId === folder.id ? renameValue : folder.name}
                  onRenameStart={() => { setRenamingId(folder.id); setRenameValue(folder.name); }}
                  onRenameChange={setRenameValue}
                  onRenameSave={() => handleRenameFolder(folder)}
                  onRenameCancel={() => setRenamingId(null)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Files section ──────────────────────────────────────────────── */}
        {!loading && files.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.muted, marginBottom: 8 }}>
              Files ({files.length})
            </p>

            {filteredFiles.length === 0 ? (
              <div style={{
                padding: "32px 24px", textAlign: "center",
                background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12,
              }}>
                <p style={{ fontSize: 13, color: S.muted }}>No files match your search.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="re-file-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {filteredFiles.map(f => (
                  <GridFileCard
                    key={f.id}
                    file={f}
                    isAdmin={isAdmin}
                    onOpen={() => f.url && setViewingDoc({ title: f.title, url: f.url, material_type: f.material_type })}
                    onDelete={() => handleDeleteFile(f.id, f.title)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ background: S.surface, borderRadius: 12, border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: S.shadow }}>
                <div style={{
                  display: "flex", alignItems: "center", padding: "8px 16px",
                  borderBottom: `1px solid ${S.border}`, background: S.bg,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: S.muted }}>Name</span>
                  </div>
                  <div style={{ display: "flex", gap: 24, paddingRight: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: S.muted }}>Type</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: S.muted }}>Visibility</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: S.muted }}>Actions</span>
                  </div>
                </div>
                {filteredFiles.map((f, i) => (
                  <FileRow
                    key={f.id}
                    file={{ ...f, questionCount: questionCounts[f.id] }}
                    isAdmin={isAdmin}
                    isLast={i === filteredFiles.length - 1}
                    onOpen={() => f.url && setViewingDoc({ title: f.title, url: f.url, material_type: f.material_type })}
                    onDelete={() => handleDeleteFile(f.id, f.title)}
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
