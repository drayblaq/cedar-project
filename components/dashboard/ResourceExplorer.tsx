"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteMaterial, createFolder, deleteFolder, renameFolder } from "@/app/dashboard/actions/classes";
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
  amberDark: "#d97706",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#dc2626",
  bg: "#f8fafc",
  surface: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,.06)",
};

// ─── Types ───────────────────────────────────────────────────────────────────

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
  allowedLevelIds?: string[]; // kept for API compat — not used in folder mode
  filterTeacherOnly?: boolean; // when set, filters materials by teacher_only value
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FolderIcon({ size = 48, color = S.amber }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
    </svg>
  );
}

function TypeChip({ type }: { type: string }) {
  const isPdf = type === "pdf";
  return (
    <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isPdf ? "#fef2f2" : "#eff6ff" }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>{isPdf ? "PDF" : "DOC"}</span>
    </div>
  );
}

function FolderCard({ folder, count, isAdmin, onClick, onDelete, isRenaming, renameValue, onRenameStart, onRenameChange, onRenameSave, onRenameCancel }: {
  folder: Folder; count?: number; isAdmin: boolean; onClick: () => void; onDelete: () => void;
  isRenaming: boolean; renameValue: string;
  onRenameStart: () => void; onRenameChange: (v: string) => void; onRenameSave: () => void; onRenameCancel: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [deleteBtnHovered, setDeleteBtnHovered] = useState(false);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setDeleteBtnHovered(false); }}>
      <button
        onClick={isRenaming ? undefined : onClick}
        style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          padding: "16px 8px 12px", borderRadius: 14,
          border: `1px solid ${isRenaming ? "#93c5fd" : hovered ? S.amberBorder : "transparent"}`,
          background: isRenaming ? "#eff6ff" : hovered ? S.amberLight : "transparent",
          cursor: isRenaming ? "default" : "pointer", textAlign: "center",
          transition: "background .12s, border-color .12s",
        }}
      >
        <FolderIcon size={48} color={isRenaming ? "#60a5fa" : hovered ? S.amberDark : S.amber} />
        {isRenaming ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%", padding: "0 4px" }} onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={renameValue}
              onChange={e => onRenameChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") onRenameSave();
                if (e.key === "Escape") onRenameCancel();
              }}
              style={{ flex: 1, fontSize: 11, border: "1px solid #93c5fd", borderRadius: 6, padding: "3px 6px", outline: "none", color: S.ink, minWidth: 0 }}
              onClick={e => e.stopPropagation()}
            />
            <button onClick={e => { e.stopPropagation(); onRenameSave(); }} style={{ background: "none", border: "none", cursor: "pointer", color: S.green, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</button>
            <button onClick={e => { e.stopPropagation(); onRenameCancel(); }} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 13, flexShrink: 0 }}>✗</button>
          </div>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 600, color: hovered ? "#92400e" : S.ink, lineHeight: 1.3, wordBreak: "break-word" }}>
            {folder.name}
          </span>
        )}
        <span style={{ fontSize: 10.5, color: S.muted }}>
          {count === undefined ? "…" : `${count} item${count !== 1 ? "s" : ""}`}
        </span>
      </button>

      {/* Rename button (pencil) */}
      {isAdmin && hovered && !isRenaming && (
        <button
          onClick={e => { e.stopPropagation(); onRenameStart(); }}
          style={{
            position: "absolute", top: 6, left: 6,
            width: 22, height: 22, borderRadius: 7,
            background: "#eff6ff", border: "1px solid #93c5fd",
            color: "#3b82f6", fontSize: 13, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .1s",
          }}
          title="Rename folder"
        >
          ✎
        </button>
      )}

      {/* Delete button */}
      {isAdmin && hovered && !isRenaming && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onMouseEnter={() => setDeleteBtnHovered(true)}
          onMouseLeave={() => setDeleteBtnHovered(false)}
          style={{
            position: "absolute", top: 6, right: 6,
            width: 22, height: 22, borderRadius: 7,
            background: deleteBtnHovered ? S.red : "#fee2e2",
            border: `1px solid ${deleteBtnHovered ? S.red : "#fca5a5"}`,
            color: deleteBtnHovered ? "#fff" : S.red,
            fontSize: 14, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .1s, color .1s, border-color .1s",
            boxShadow: deleteBtnHovered ? "0 2px 8px rgba(220,38,38,.3)" : "none",
          }}
          title="Delete folder"
        >
          ×
        </button>
      )}
    </div>
  );
}

function FileRow({ file, isAdmin, isLast, onOpen, onDelete }: { file: Material; isAdmin: boolean; isLast?: boolean; onOpen: () => void; onDelete: () => void; }) {
  const [hovered, setHovered] = useState(false);
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
        borderBottom: isLast ? "none" : `1px solid ${S.border}`,
        background: hovered ? S.bg : S.surface,
        transition: "background .12s",
      }}
    >
      <TypeChip type={file.material_type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.title}</p>
        <p style={{ fontSize: 11.5, color: S.muted, marginTop: 2 }}>{added}</p>
      </div>
      {file.teacher_only !== undefined && (
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
          background: file.teacher_only ? "#faf5ff" : S.greenLight,
          color: file.teacher_only ? "#7c3aed" : S.greenDark,
        }}>
          {file.teacher_only ? "Teachers" : (() => {
            const lvl = Array.isArray(file.levels) ? file.levels[0]?.name : file.levels?.name;
            return lvl ? `Students · ${lvl}` : "Students · All";
          })()}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {isAdmin && (
          <a
            href={`/admin/library/questions/${file.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 11.5, fontWeight: 700, color: "#7c3aed", padding: "4px 9px", borderRadius: 7,
              background: hovered ? "#faf5ff" : "transparent",
              border: `1px solid ${hovered ? "#ddd6fe" : "transparent"}`,
              textDecoration: "none", transition: "background .1s, border-color .1s",
              opacity: hovered ? 1 : 0.6,
            }}
          >
            Quiz {file.questionCount !== undefined ? `(${file.questionCount})` : ""}
          </a>
        )}
        {canView && (
          <button
            onClick={onOpen}
            className="re-open-btn"
            style={{ fontSize: 12, fontWeight: 700, color: S.greenDark, padding: "5px 10px", borderRadius: 7, background: hovered ? S.greenLight : "transparent", border: "none", cursor: "pointer" }}
          >
            Open →
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            style={{ fontSize: 12, fontWeight: 600, color: S.red, padding: "5px 10px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", opacity: hovered ? 1 : 0, transition: "opacity .12s" }}
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

function GridFileCard({ file, isAdmin, onOpen, onDelete }: { file: Material; isAdmin: boolean; onOpen: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [deleteBtnHovered, setDeleteBtnHovered] = useState(false);
  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");
  const isPdf = file.material_type === "pdf";
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 14, border: `1px solid ${hovered ? (isPdf ? "#fca5a5" : "#93c5fd") : S.border}`,
        background: hovered ? (isPdf ? "#fef2f2" : "#eff6ff") : S.surface,
        overflow: "hidden", transition: "border-color .12s, background .12s", cursor: canView ? "pointer" : "default",
        display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 12px 14px",
      }}
      onClick={canView ? onOpen : undefined}
    >
      {/* File icon */}
      <div style={{ width: 52, height: 64, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: isPdf ? "#fee2e2" : "#dbeafe", marginBottom: 10, flexShrink: 0 }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={isPdf ? "#b91c1c" : "#1d4ed8"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>

      {/* Type badge */}
      <div style={{ position: "absolute", top: 10, left: 10, fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4, background: isPdf ? "#b91c1c" : "#1d4ed8", color: "#fff", letterSpacing: "0.05em" }}>
        {isPdf ? "PDF" : "DOC"}
      </div>

      {/* Title */}
      <p style={{ fontSize: 11.5, fontWeight: 600, color: S.ink, textAlign: "center", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 4, width: "100%" }}>
        {file.title}
      </p>
      <p style={{ fontSize: 10, color: S.muted }}>{added}</p>

      {/* Hover overlay */}
      {hovered && canView && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", borderRadius: 13 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isPdf ? "#b91c1c" : "#1d4ed8", background: isPdf ? "#fee2e2" : "#dbeafe", padding: "6px 14px", borderRadius: 20 }}>Open</span>
        </div>
      )}

      {/* Admin delete */}
      {isAdmin && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onMouseEnter={() => setDeleteBtnHovered(true)}
          onMouseLeave={() => setDeleteBtnHovered(false)}
          style={{
            position: "absolute", top: 7, right: 7, width: 22, height: 22, borderRadius: 7,
            background: deleteBtnHovered ? S.red : "#fee2e2",
            border: `1px solid ${deleteBtnHovered ? S.red : "#fca5a5"}`,
            color: deleteBtnHovered ? "#fff" : S.red,
            fontSize: 14, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .1s, color .1s, border-color .1s",
            boxShadow: deleteBtnHovered ? "0 2px 8px rgba(220,38,38,.3)" : "none",
          }}
          title="Delete file"
        >
          ×
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [viewingDoc, setViewingDoc] = useState<ViewerDoc | null>(null);
  const [search, setSearch] = useState("");

  // ── Load contents ────────────────────────────────────────────────────────────
  const loadContents = useCallback(async (folderId: string | null) => {
    setLoading(true);

    // Subfolders
    let fq = supabase.from("library_folders").select("*").order("sort_order").order("name");
    if (folderId) fq = fq.eq("parent_id", folderId);
    else fq = fq.is("parent_id", null);
    const { data: foldersData } = await fq;

    // Files — explicit conditional chaining to avoid builder mutation issues
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

    // Fetch quiz question counts for admin quiz buttons
    if (isAdmin && filesData && filesData.length > 0) {
      const ids = (filesData as Material[]).map((f) => f.id);
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

  // ── Folder item counts ───────────────────────────────────────────────────────
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

  // ── Navigation ───────────────────────────────────────────────────────────────
  function openFolder(folder: Folder) {
    setCurrentFolder(folder);
    setBreadcrumb((prev) => [...prev, folder]);
    loadContents(folder.id);
    setSearch("");
    setShowNewFolder(false);
  }

  function navigateToBreadcrumb(folder: Folder | null, index: number) {
    setCurrentFolder(folder);
    setBreadcrumb((prev) => (folder === null ? [] : prev.slice(0, index + 1)));
    loadContents(folder?.id ?? null);
    setSearch("");
    setShowNewFolder(false);
  }

  function goBack() {
    const prev = breadcrumb[breadcrumb.length - 2] ?? null;
    navigateToBreadcrumb(prev, breadcrumb.length - 2);
  }

  // ── Folder CRUD ──────────────────────────────────────────────────────────────
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

  // ── File delete ───────────────────────────────────────────────────────────────
  async function handleDeleteFile(fileId: string, title: string) {
    if (!confirm(`Delete "${title}"?\n\nThis file will be permanently removed and cannot be recovered.`)) return;
    await deleteMaterial(fileId);
    loadContents(currentFolder?.id ?? null);
  }

  // ── Filtered files ────────────────────────────────────────────────────────────
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) => f.title.toLowerCase().includes(q));
  }, [files, search]);

  const isEmpty = !loading && folders.length === 0 && files.length === 0;

  // ─────────────────────────────────────────────────────────────────────────────

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

      <div style={{ padding: "24px 28px 48px", background: S.bg, minHeight: "100%" }}>

        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => navigateToBreadcrumb(null, -1)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: currentFolder === null ? 700 : 600, color: currentFolder === null ? S.ink : S.green, fontSize: 13 }}
          >
            Library
          </button>
          {breadcrumb.map((f, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <button
                onClick={() => navigateToBreadcrumb(f, i)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: i === breadcrumb.length - 1 ? 700 : 600, color: i === breadcrumb.length - 1 ? S.ink : S.green, fontSize: 13 }}
              >
                {f.name}
              </button>
            </span>
          ))}
        </nav>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {currentFolder && (
            <button
              onClick={goBack}
              style={{ display: "flex", alignItems: "center", gap: 5, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "7px 13px", fontSize: 13, fontWeight: 600, color: S.sub, cursor: "pointer" }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {/* View mode toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                style={{ padding: "5px 7px", borderRadius: 7, border: "none", cursor: "pointer", background: viewMode === "grid" ? S.surface : "transparent", color: viewMode === "grid" ? S.ink : S.muted, boxShadow: viewMode === "grid" ? S.shadow : "none", transition: "background .12s" }}
              >
                <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                style={{ padding: "5px 7px", borderRadius: 7, border: "none", cursor: "pointer", background: viewMode === "list" ? S.surface : "transparent", color: viewMode === "list" ? S.ink : S.muted, boxShadow: viewMode === "list" ? S.shadow : "none", transition: "background .12s" }}
              >
                <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>

            {isAdmin && (
              <>
                <button
                  onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: S.surface, border: `1px solid ${S.border}`, color: S.sub, borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span className="re-btn-label">New folder</span>
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: S.green, color: "#fff", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span className="re-btn-label">Upload files</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── New folder input ──────────────────────────────────────────────── */}
        {showNewFolder && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "12px 16px", background: S.greenLight, border: `1px solid ${S.greenBorder}`, borderRadius: 12 }}>
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
              }}
              placeholder="Folder name (e.g. A1-A2, Unit 1)"
              style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: `1px solid ${S.border}`, borderRadius: 9, outline: "none", color: S.ink }}
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              style={{ background: S.green, color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              {creatingFolder ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              style={{ background: "none", border: "none", fontSize: 13, color: S.muted, cursor: "pointer", padding: "8px" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: 100, borderRadius: 14, background: S.border }} />
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {isEmpty && (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <FolderIcon size={64} color="#cbd5e1" />
            <p style={{ fontSize: 15, fontWeight: 700, color: S.sub, marginTop: 16, marginBottom: 6 }}>
              {currentFolder ? "This folder is empty" : "No folders yet"}
            </p>
            {isAdmin && (
              <p style={{ fontSize: 13, color: S.muted }}>
                {currentFolder
                  ? 'Click "+ Upload files" to add lesson plans here'
                  : 'Click "+ New folder" to create your first folder'}
              </p>
            )}
          </div>
        )}

        {/* ── Folders grid ─────────────────────────────────────────────────── */}
        {!loading && folders.length > 0 && (
          <div className="re-folder-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6, marginBottom: files.length > 0 ? 28 : 0 }}>
            {folders.map((folder) => (
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
        )}

        {/* ── Files ────────────────────────────────────────────────────────── */}
        {!loading && files.length > 0 && (
          <div>
            {/* Search bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                  width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search files…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px 8px 34px", fontSize: 13, border: `1px solid ${S.border}`, borderRadius: 10, outline: "none", color: S.ink, background: S.surface }}
                />
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <div style={{ padding: "32px 24px", textAlign: "center", background: S.surface, borderRadius: 14, border: `1px solid ${S.border}` }}>
                <p style={{ fontSize: 13, color: S.muted }}>No files match your search.</p>
              </div>
            ) : viewMode === "grid" ? (
              /* ── Grid view ── */
              <div className="re-file-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {filteredFiles.map((f) => (
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
              /* ── List view ── */
              <div style={{ background: S.surface, borderRadius: 14, border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: S.shadow }}>
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
