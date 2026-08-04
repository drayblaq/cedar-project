"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteMaterial, createFolder, deleteFolder, renameFolder } from "@/app/dashboard/actions/classes";
import { DocumentViewer, type ViewerDoc } from "./DocumentViewer";
import { UploadPanel } from "./UploadPanel";

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
  if (isRenaming) {
    return (
      <div className="flex flex-col gap-2 p-3 rounded-xl border-2 border-green-300 bg-green-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <input
            autoFocus
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onRenameSave();
              if (e.key === "Escape") onRenameCancel();
            }}
            className="flex-1 min-w-0 text-xs border border-green-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onRenameSave}
            className="flex-1 text-xs py-1 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={onRenameCancel}
            className="flex-1 text-xs py-1 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all text-center"
      >
        <svg
          className="w-12 h-12 text-amber-400 group-hover:text-amber-500 transition-colors"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
            {folder.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {count !== undefined ? `${count} item${count !== 1 ? "s" : ""}` : "..."}
          </p>
        </div>
      </button>

      {isAdmin && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onRenameStart(); }}
            title="Rename"
            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-400 items-center justify-center hidden group-hover:flex hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm z-10 text-xs"
          >
            ✎
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-400 items-center justify-center hidden group-hover:flex hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-10 text-xs"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

// ─── FileRow ──────────────────────────────────────────────────────────────────
function FileRow({ file, isAdmin, isLast, onOpen, onDelete }: {
  file: Material; isAdmin: boolean; isLast?: boolean; onOpen: () => void; onDelete: () => void;
}) {
  const isPdf = file.material_type === "pdf";
  const canView = !!file.url && (isPdf || file.material_type === "document");
  const levelName = Array.isArray(file.levels) ? file.levels[0]?.name : file.levels?.name;

  const visibilityBadge = file.teacher_only !== undefined ? (
    file.teacher_only ? (
      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
        Staff only
      </span>
    ) : levelName ? (
      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
        Students · {levelName}
      </span>
    ) : (
      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
        All students
      </span>
    )
  ) : null;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group${!isLast ? " border-b border-gray-50" : ""}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? "bg-red-50" : "bg-blue-50"}`}>
        <span className={`text-xs font-bold ${isPdf ? "text-red-500" : "text-blue-500"}`}>
          {isPdf ? "PDF" : "DOC"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">
            {new Date(file.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
          {visibilityBadge}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isAdmin && (
          <a
            href={`/admin/library/questions/${file.id}`}
            onClick={e => e.stopPropagation()}
            className="px-2 py-1.5 text-purple-500 text-xs font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-all opacity-0 group-hover:opacity-100"
          >
            Quiz {file.questionCount !== undefined ? `(${file.questionCount})` : ""}
          </a>
        )}
        {canView && (
          <button
            onClick={onOpen}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Open
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            className="px-2 py-1.5 text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
      </div>
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
  }, [supabase, filterTeacherOnly, isAdmin]);

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
        const { count: fileCount } = await fq;
        const { count: subs } = await supabase.from("library_folders").select("*", { count: "exact", head: true }).eq("parent_id", folder.id);
        counts[folder.id] = (fileCount ?? 0) + (subs ?? 0);
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

      <div className="p-6 bg-gray-50 min-h-full">

        {/* ── Toolbar + breadcrumb ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <nav className="flex items-center gap-1 text-sm flex-1 min-w-0 flex-wrap">
            <button
              onClick={() => navigateToBreadcrumb(null, -1)}
              className={`font-semibold transition-colors ${!currentFolder ? "text-gray-900" : "text-green-600 hover:text-green-700"}`}
            >
              Library
            </button>
            {breadcrumb.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1">
                <span className="text-gray-300 text-xs">/</span>
                <button
                  onClick={() => navigateToBreadcrumb(f, i)}
                  className={`font-medium transition-colors ${i === breadcrumb.length - 1 ? "text-gray-900" : "text-green-600 hover:text-green-700"}`}
                >
                  {f.name}
                </button>
              </span>
            ))}
          </nav>

          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New folder</span>
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* ── New folder inline input ────────────────────────────────────── */}
        {showNewFolder && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
              </svg>
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
              placeholder="Folder name..."
              className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creatingFolder ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-48" />
                  <div className="h-2.5 bg-gray-100 rounded animate-pulse w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {!loading && folders.length === 0 && files.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-sm mb-1">
              {currentFolder ? "This folder is empty" : "No folders yet"}
            </p>
            <p className="text-gray-400 text-xs">
              {isAdmin
                ? currentFolder
                  ? "Upload files or create subfolders here"
                  : "Create a folder to get started"
                : "No materials available yet"}
            </p>
          </div>
        )}

        {/* ── Folder grid ────────────────────────────────────────────────── */}
        {!loading && folders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
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
            {isAdmin && (
              <button
                onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-green-200 text-green-600 hover:border-green-400 hover:bg-green-50 transition-all min-h-[100px]"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">New folder</span>
              </button>
            )}
          </div>
        )}

        {/* ── Files section ──────────────────────────────────────────────── */}
        {!loading && files.length > 0 && (
          <div>
            <div className="mb-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-2">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
            </p>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                <p className="text-sm text-gray-400">No files match your search.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
