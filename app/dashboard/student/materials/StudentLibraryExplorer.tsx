"use client";

import { useState } from "react";

const S = {
  ink: "#0f172a",
  sub: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenDark: "#15803d",
  greenLight: "#f0fdf4",
  amber: "#f59e0b",
  amberDark: "#d97706",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  bg: "#f8fafc",
  surface: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,.06)",
};

type FolderRow = { id: string; name: string; parent_id: string | null } | null;

export type StudentMaterial = {
  id: string;
  title: string;
  material_type: string;
  url: string | null;
  folder_id: string | null;
  created_at: string;
  student_level_id: string | null;
  library_folders: FolderRow | FolderRow[];
};

interface Props {
  materials: StudentMaterial[];
}

function FolderIcon({ size = 48, color = S.amber }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
    </svg>
  );
}

function FolderButton({ folder, onClick }: { folder: { id: string; name: string }; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onClick}
        style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          padding: "16px 8px 12px", borderRadius: 14,
          border: `1px solid ${hovered ? S.amberBorder : "transparent"}`,
          background: hovered ? S.amberLight : "transparent",
          cursor: "pointer", textAlign: "center",
          transition: "background .12s, border-color .12s",
        }}
      >
        <FolderIcon size={48} color={hovered ? S.amberDark : S.amber} />
        <span style={{ fontSize: 12, fontWeight: 600, color: hovered ? "#92400e" : S.ink, lineHeight: 1.3, wordBreak: "break-word" }}>
          {folder.name}
        </span>
      </button>
    </div>
  );
}

function FileRow({ file, isLast, onOpen }: {
  file: StudentMaterial; isLast: boolean; onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPdf = file.material_type === "pdf";
  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");
  const added = new Date(file.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={canView ? onOpen : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderBottom: isLast ? "none" : `1px solid ${S.border}`,
        background: hovered && canView ? S.bg : S.surface,
        transition: "background .12s",
        cursor: canView ? "pointer" : "default",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isPdf ? "#fef2f2" : "#eff6ff" }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>
          {isPdf ? "PDF" : "DOC"}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.title}
        </p>
        <p style={{ fontSize: 11.5, color: S.muted, marginTop: 2 }}>{added}</p>
      </div>
      {canView && (
        <span style={{
          fontSize: 12, fontWeight: 700, color: S.greenDark,
          opacity: hovered ? 1 : 0, transition: "opacity .12s",
          flexShrink: 0,
        }}>
          Open →
        </span>
      )}
    </div>
  );
}

function DocViewer({ material, onClose }: { material: StudentMaterial; onClose: () => void }) {
  const docSrc = material.url
    ? (material.material_type === "pdf"
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(material.url)}&embedded=true`
        : `https://docs.google.com/gview?url=${encodeURIComponent(material.url)}&embedded=true`)
    : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: S.bg, overflowY: "auto" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: S.surface,
        borderBottom: `1px solid ${S.border}`, padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={onClose}
          style={{ fontSize: 13, fontWeight: 600, color: S.sub, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0, flexShrink: 0 }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Library
        </button>
        <span style={{ color: "#cbd5e1" }}>|</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {material.title}
        </span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ background: S.surface, borderRadius: 16, border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: S.shadow }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.border}` }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: S.ink, margin: 0 }}>{material.title}</h1>
          </div>
          {docSrc ? (
            <iframe
              src={docSrc}
              style={{ width: "100%", height: "70vh", border: "none", display: "block" }}
              title={material.title}
            />
          ) : (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: S.muted }}>No document preview available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentLibraryExplorer({ materials }: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [openMaterial, setOpenMaterial] = useState<StudentMaterial | null>(null);

  const folderMap = new Map<string, { id: string; name: string; parent_id: string | null }>();
  for (const m of materials) {
    const f = Array.isArray(m.library_folders) ? m.library_folders[0] : m.library_folders;
    if (f) folderMap.set(f.id, f);
  }

  const currentFolders = [...folderMap.values()].filter((f) =>
    currentFolderId ? f.parent_id === currentFolderId : f.parent_id === null
  );
  const currentFiles = materials.filter((m) =>
    currentFolderId ? m.folder_id === currentFolderId : !m.folder_id
  );
  const isEmpty = currentFolders.length === 0 && currentFiles.length === 0;

  if (openMaterial) {
    return <DocViewer material={openMaterial} onClose={() => setOpenMaterial(null)} />;
  }

  return (
    <div className="cedar-dash-page" style={{ padding: "24px 28px 48px", background: S.bg, minHeight: "100%", overflowX: "hidden" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => { setCurrentFolderId(null); setBreadcrumb([]); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: currentFolderId === null ? 700 : 600, color: currentFolderId === null ? S.ink : S.green, fontSize: 13 }}
        >
          Library
        </button>
        {breadcrumb.map((f, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#cbd5e1" }}>/</span>
            <button
              onClick={() => { setCurrentFolderId(f.id); setBreadcrumb((prev) => prev.slice(0, i + 1)); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: i === breadcrumb.length - 1 ? 700 : 600, color: i === breadcrumb.length - 1 ? S.ink : S.green, fontSize: 13 }}
            >
              {f.name}
            </button>
          </span>
        ))}
      </nav>

      {/* Folders — 2 columns max on mobile */}
      {currentFolders.length > 0 && (
        <div className="cedar-folder-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6, marginBottom: currentFiles.length > 0 ? 28 : 0 }}>
          {currentFolders.map((folder) => (
            <FolderButton
              key={folder.id}
              folder={folder}
              onClick={() => { setCurrentFolderId(folder.id); setBreadcrumb((prev) => [...prev, folder]); }}
            />
          ))}
        </div>
      )}

      {/* Files */}
      {currentFiles.length > 0 && (
        <div style={{ background: S.surface, borderRadius: 14, border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: S.shadow }}>
          {currentFiles.map((f, i) => (
            <FileRow
              key={f.id}
              file={f}
              isLast={i === currentFiles.length - 1}
              onOpen={() => setOpenMaterial(f)}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div style={{ padding: "64px 24px", textAlign: "center" }}>
          <FolderIcon size={64} color="#cbd5e1" />
          <p style={{ fontSize: 15, fontWeight: 700, color: S.sub, marginTop: 16, marginBottom: 6 }}>
            {currentFolderId ? "This folder is empty" : "No materials yet"}
          </p>
          <p style={{ fontSize: 13, color: S.muted }}>
            Your teacher will add learning materials here soon
          </p>
        </div>
      )}
    </div>
  );
}
