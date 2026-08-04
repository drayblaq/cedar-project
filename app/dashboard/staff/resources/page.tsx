"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";
import { DocumentViewer, type ViewerDoc } from "@/components/dashboard/DocumentViewer";

type StudentMaterial = {
  id: string;
  title: string;
  material_type: string;
  url: string | null;
  levels: { name: string } | { name: string }[] | null;
  library_folders: { name: string } | { name: string }[] | null;
};

function StudentMaterialsPreview() {
  const supabaseRef = useRef(createClient());
  const [materials, setMaterials] = useState<StudentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState<ViewerDoc | null>(null);

  useEffect(() => {
    supabaseRef.current
      .from("materials")
      .select("id, title, material_type, url, levels:student_level_id(name), library_folders(name)")
      .eq("teacher_only", false)
      .order("title")
      .then(({ data }) => {
        setMaterials((data ?? []) as StudentMaterial[]);
        setLoading(false);
      });
  }, []);

  // Group by level name
  const grouped: Record<string, StudentMaterial[]> = {};
  for (const m of materials) {
    const lvl = Array.isArray(m.levels) ? m.levels[0]?.name : (m.levels as { name: string } | null)?.name;
    const key = lvl || "All levels";
    (grouped[key] ??= []).push(m);
  }
  const levelOrder = Object.keys(grouped).sort((a, b) =>
    a === "All levels" ? 1 : b === "All levels" ? -1 : a.localeCompare(b)
  );

  if (loading) {
    return (
      <div className="space-y-2 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-48" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
          </svg>
        </div>
        <p className="text-gray-700 font-semibold text-sm mb-1">No student materials assigned yet</p>
        <p className="text-gray-400 text-xs">
          Upload files marked as &quot;Visible to students&quot; in My Resources.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewingDoc && <DocumentViewer material={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div className="flex flex-col gap-6">
        {levelOrder.map(level => {
          const files = grouped[level];
          return (
            <div key={level}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {level} · {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {files.map((file, i) => {
                  const isPdf = file.material_type === "pdf";
                  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");
                  const folderName = Array.isArray(file.library_folders)
                    ? file.library_folders[0]?.name
                    : (file.library_folders as { name: string } | null)?.name;
                  return (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group${i < files.length - 1 ? " border-b border-gray-50" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? "bg-red-50" : "bg-blue-50"}`}>
                        <span className={`text-xs font-bold ${isPdf ? "text-red-500" : "text-blue-500"}`}>
                          {isPdf ? "PDF" : "DOC"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                        {folderName && (
                          <p className="text-xs text-gray-400 mt-0.5">in {folderName}</p>
                        )}
                      </div>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Visible to students
                      </span>
                      {canView && (
                        <button
                          onClick={() => setViewingDoc({ title: file.title, url: file.url!, material_type: file.material_type })}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function StaffResourcesPage() {
  const [tab, setTab] = useState<"teacher" | "student">("teacher");

  return (
    <div>
      {/* Green header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5">
        <h1 className="text-xl font-bold text-white">Library</h1>
        <p className="text-green-200 text-sm mt-0.5">
          Browse teaching materials and see what students can access
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-6 pt-4 pb-0 bg-white border-b border-gray-100">
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["teacher", "student"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "teacher" ? "My Resources" : "Student Materials"}
            </button>
          ))}
        </div>
      </div>

      {tab === "teacher" && <ResourceExplorer isAdmin={false} filterTeacherOnly={true} />}
      {tab === "student" && (
        <div className="p-6 bg-gray-50 min-h-full">
          <StudentMaterialsPreview />
        </div>
      )}
    </div>
  );
}
