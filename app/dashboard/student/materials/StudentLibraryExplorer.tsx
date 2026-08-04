"use client";

import { useState } from "react";
import { DocumentViewer, type ViewerDoc } from "@/components/dashboard/DocumentViewer";

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

export function StudentLibraryExplorer({ materials }: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [viewingDoc, setViewingDoc] = useState<ViewerDoc | null>(null);

  // Build folder map from joined data
  const folderMap = new Map<string, { id: string; name: string; parent_id: string | null }>();
  for (const m of materials) {
    const f = Array.isArray(m.library_folders) ? m.library_folders[0] : m.library_folders;
    if (f) folderMap.set(f.id, f);
  }

  const currentFolders = [...folderMap.values()].filter(f =>
    currentFolderId ? f.parent_id === currentFolderId : f.parent_id === null
  );
  const currentFiles = materials.filter(m =>
    currentFolderId ? m.folder_id === currentFolderId : !m.folder_id
  );
  const isEmpty = currentFolders.length === 0 && currentFiles.length === 0;

  // Progress indicator (no data wired yet, kept for future use)
  const completedCount = 0;
  const totalCount = 0;

  return (
    <>
      {viewingDoc && <DocumentViewer material={viewingDoc} onClose={() => setViewingDoc(null)} />}

      <div className="p-6 bg-gray-50 min-h-full">

        {/* Progress bar (only shown when data available) */}
        {completedCount > 0 && totalCount > 0 && (
          <div className="flex items-center gap-3 mb-5 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-800">Your progress</span>
                <span className="text-xs font-bold text-green-700">{completedCount}/{totalCount} completed</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm mb-5 flex-wrap">
          <button
            onClick={() => { setCurrentFolderId(null); setBreadcrumb([]); }}
            className={`font-semibold transition-colors ${currentFolderId === null ? "text-gray-900" : "text-green-600 hover:text-green-700"}`}
          >
            Library
          </button>
          {breadcrumb.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1">
              <span className="text-gray-300 text-xs">/</span>
              <button
                onClick={() => {
                  setCurrentFolderId(f.id);
                  setBreadcrumb(prev => prev.slice(0, i + 1));
                }}
                className={`font-medium transition-colors ${i === breadcrumb.length - 1 ? "text-gray-900" : "text-green-600 hover:text-green-700"}`}
              >
                {f.name}
              </button>
            </span>
          ))}
        </nav>

        {/* Folder grid */}
        {currentFolders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {currentFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => {
                  setCurrentFolderId(folder.id);
                  setBreadcrumb(prev => [...prev, folder]);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all text-center"
              >
                <svg className="w-12 h-12 text-amber-400 hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                </svg>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                  {folder.name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* File list */}
        {currentFiles.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {currentFiles.map((f, i) => {
              const isPdf = f.material_type === "pdf";
              const canView = !!f.url && (isPdf || f.material_type === "document");
              const added = new Date(f.created_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              });

              return (
                <div
                  key={f.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group${i < currentFiles.length - 1 ? " border-b border-gray-50" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? "bg-red-50" : "bg-blue-50"}`}>
                    <span className={`text-xs font-bold ${isPdf ? "text-red-500" : "text-blue-500"}`}>
                      {isPdf ? "PDF" : "DOC"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{added}</p>
                  </div>

                  {canView && (
                    <button
                      onClick={() => setViewingDoc({ title: f.title, url: f.url!, material_type: f.material_type })}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                    >
                      Open
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-sm mb-1">
              {currentFolderId ? "This folder is empty" : "No materials yet"}
            </p>
            <p className="text-gray-400 text-xs">
              Your teacher will add learning materials here soon
            </p>
          </div>
        )}
      </div>
    </>
  );
}
