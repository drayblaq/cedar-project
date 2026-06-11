"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";
import { DocumentViewer, type ViewerDoc } from "@/components/dashboard/DocumentViewer";

const C = {
  ink: "#0f172a", muted: "#64748b", sub: "#475569",
  border: "#e2e8f0", green: "#16a34a", greenDark: "#15803d",
  greenLight: "#f0fdf4", bg: "#f8fafc", surface: "#ffffff",
  shadow: "0 1px 3px rgba(0,0,0,.06)",
};

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
      <div style={{ padding: "48px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: C.muted }}>Loading…</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div style={{ padding: "64px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.sub, marginBottom: 6 }}>No student materials assigned yet</p>
        <p style={{ fontSize: 12, color: C.muted }}>
          Go to My Resources and upload files marked as "Visible to students".
        </p>
      </div>
    );
  }

  return (
    <>
      {viewingDoc && <DocumentViewer material={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {levelOrder.map((level) => {
          const files = grouped[level];
          return (
            <div key={level}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, marginBottom: 10 }}>
                {level} · {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.shadow }}>
                {files.map((file, i) => {
                  const isPdf = file.material_type === "pdf";
                  const canView = !!file.url && (file.material_type === "pdf" || file.material_type === "document");
                  const folderName = Array.isArray(file.library_folders) ? file.library_folders[0]?.name : (file.library_folders as { name: string } | null)?.name;
                  return (
                    <FilePreviewRow
                      key={file.id}
                      title={file.title}
                      isPdf={isPdf}
                      folderName={folderName ?? null}
                      isLast={i === files.length - 1}
                      canView={canView}
                      onOpen={canView ? () => setViewingDoc({ title: file.title, url: file.url!, material_type: file.material_type }) : undefined}
                    />
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

function FilePreviewRow({ title, isPdf, folderName, isLast, canView, onOpen }: {
  title: string; isPdf: boolean; folderName: string | null;
  isLast: boolean; canView: boolean; onOpen?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={canView ? onOpen : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
        borderBottom: isLast ? "none" : `1px solid ${C.border}`,
        background: hovered && canView ? C.bg : C.surface,
        cursor: canView ? "pointer" : "default",
        transition: "background .12s",
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isPdf ? "#fef2f2" : "#eff6ff" }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>{isPdf ? "PDF" : "DOC"}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        {folderName && <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>in {folderName}</p>}
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 700, background: C.greenLight, color: C.greenDark, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
        Visible to students
      </span>
      {canView && (
        <span style={{ fontSize: 12, fontWeight: 700, color: C.greenDark, opacity: hovered ? 1 : 0, transition: "opacity .12s", flexShrink: 0 }}>
          Open →
        </span>
      )}
    </div>
  );
}

export default function StaffResourcesPage() {
  const [tab, setTab] = useState<"teacher" | "student">("teacher");

  return (
    <div>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Library
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          Browse teaching materials and see what students can access.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ padding: "16px 28px 0", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "inline-flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
          {(["teacher", "student"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              background: tab === t ? C.surface : "transparent",
              color: tab === t ? C.ink : C.muted,
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              transition: "background .12s, color .12s",
            }}>
              {t === "teacher" ? "My Resources" : "Student Materials"}
            </button>
          ))}
        </div>
      </div>

      {tab === "teacher" && <ResourceExplorer isAdmin={false} filterTeacherOnly={true} />}
      {tab === "student" && (
        <div style={{ padding: "24px 28px 48px", background: C.bg, minHeight: "100%" }}>
          <StudentMaterialsPreview />
        </div>
      )}
    </div>
  );
}
