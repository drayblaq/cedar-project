"use client";

import { useState, useRef } from "react";
import { uploadSingleMaterial } from "@/app/dashboard/actions/classes";

const S = {
  ink: "#0f172a",
  sub: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  red: "#dc2626",
  bg: "#f8fafc",
  surface: "#ffffff",
};

export interface UploadPanelProps {
  folderId: string | null;
  folderName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ProgressEntry = {
  name: string;
  percent: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function cleanFileName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/^Lesson \d+_/, "")
    .replace(/^EXERCISES /i, "Exercises — ")
    .replace(/^TRANSCRIPT /i, "Transcript — ")
    .replace(/^LearnEnglish-/i, "")
    .replace(/-/g, " ")
    .trim();
}

export function UploadPanel({ folderId, folderName, onClose, onSuccess }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [allDone, setAllDone] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const arr = Array.from(fileList).filter(
      (f) => !selectedFiles.find((s) => s.name === f.name && s.size === f.size)
    );
    setSelectedFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(i: number) {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function updateProgress(name: string, percent: number, status: ProgressEntry["status"], error?: string) {
    setProgress((prev) =>
      prev.map((p) => (p.name === name ? { ...p, percent, status, error } : p))
    );
  }

  async function handleUpload() {
    if (!selectedFiles.length || uploading) return;
    setUploading(true);
    setAllDone(false);
    setProgress(selectedFiles.map((f) => ({ name: f.name, percent: 0, status: "pending" })));

    for (const file of selectedFiles) {
      updateProgress(file.name, 20, "uploading");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", cleanFileName(file.name));
      fd.append("teacher_only", "true");
      if (folderId) fd.append("folder_id", folderId);

      try {
        const res = await uploadSingleMaterial(fd);
        if (res.error) updateProgress(file.name, 100, "error", res.error);
        else updateProgress(file.name, 100, "done");
      } catch (e) {
        updateProgress(file.name, 100, "error", e instanceof Error ? e.message : "Upload failed");
      }
    }

    setUploading(false);
    setAllDone(true);
    setTimeout(() => { onSuccess(); onClose(); }, 900);
  }

  const doneCount = progress.filter((p) => p.status === "done").length;
  const errorCount = progress.filter((p) => p.status === "error").length;
  const canUpload = !!selectedFiles.length && !uploading;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(15,23,42,0.4)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)", zIndex: 9999,
        background: S.surface, boxShadow: "-4px 0 32px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: S.ink }}>Upload files</h2>
            <p style={{ fontSize: 12, color: S.muted, marginTop: 3 }}>{folderName}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 20, lineHeight: 1, padding: "2px 4px" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? S.green : S.border}`,
              borderRadius: 14, padding: "32px 20px", textAlign: "center",
              background: isDragging ? S.greenLight : S.bg,
              transition: "border-color .15s, background .15s", cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: S.sub, marginBottom: 2 }}>Drag files here</p>
            <p style={{ fontSize: 12, color: S.muted }}>or</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: S.green, marginTop: 4 }}>Browse files</p>
            <p style={{ fontSize: 11, color: S.muted, marginTop: 6 }}>PDF, DOC, DOCX — up to 100 MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => addFiles(e.target.files)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Selected files */}
          {selectedFiles.length > 0 && !uploading && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted, marginBottom: 8 }}>
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedFiles.map((f, i) => {
                  const isPdf = f.name.toLowerCase().endsWith(".pdf");
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: S.bg, borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isPdf ? "#fef2f2" : "#eff6ff" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>{isPdf ? "PDF" : "DOC"}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                        <p style={{ fontSize: 11, color: S.muted }}>{formatSize(f.size)}</p>
                      </div>
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 16, lineHeight: 1, padding: "2px 4px", flexShrink: 0 }}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress */}
          {(uploading || allDone) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {progress.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: S.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, color: p.status === "done" ? S.green : p.status === "error" ? S.red : S.muted }}>
                      {p.status === "done" ? "✓" : p.status === "error" ? "✗" : `${p.percent}%`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: S.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${p.percent}%`, background: p.status === "done" ? S.green : p.status === "error" ? S.red : "#94a3b8", transition: "width .3s" }} />
                  </div>
                  {p.error && <p style={{ fontSize: 11, color: S.red, marginTop: 3 }}>{p.error}</p>}
                </div>
              ))}
              {allDone && (
                <p style={{ fontSize: 13, fontWeight: 700, color: errorCount ? S.red : S.green, textAlign: "center", marginTop: 4 }}>
                  {errorCount ? `${errorCount} failed, ${doneCount} uploaded` : `✓ All ${doneCount} file${doneCount !== 1 ? "s" : ""} uploaded`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${S.border}`, flexShrink: 0 }}>
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
              background: canUpload ? S.green : S.border,
              color: canUpload ? "#fff" : S.muted,
              fontSize: 14, fontWeight: 700,
              cursor: canUpload ? "pointer" : "not-allowed",
              transition: "background .15s",
            }}
          >
            {uploading ? "Uploading…" : `Upload ${selectedFiles.length || ""} file${selectedFiles.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}
