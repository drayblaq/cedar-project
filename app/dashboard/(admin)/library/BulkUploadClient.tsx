"use client";

import { useRef, useState, useTransition } from "react";
import { uploadSingleMaterial } from "@/app/dashboard/actions/classes";

const C = {
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  green: "#16a34a",
  greenWash: "#f0fdf4",
  greenDark: "#15803d",
  bg: "#f8fafc",
  red: "#dc2626",
  redWash: "#fef2f2",
};

type Level = { id: string; name: string };

type FileEntry = {
  id: string;
  file: File;
  title: string;
  level_id: string;
  week_number: string;
  is_public: boolean;
  teacher_only: boolean;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

function guessType(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "document";
  if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
  if (["mp4", "mov"].includes(ext)) return "video";
  return "other";
}

export function BulkUploadClient({ levels }: { levels: Level[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [globalLevel, setGlobalLevel] = useState("");
  const [globalWeek, setGlobalWeek] = useState("");
  const [globalPublic, setGlobalPublic] = useState(false);
  const [globalTeacherOnly, setGlobalTeacherOnly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadDone, setUploadDone] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newEntries: FileEntry[] = Array.from(fileList).map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      level_id: globalLevel,
      week_number: globalWeek,
      is_public: globalPublic,
      teacher_only: globalTeacherOnly,
      status: "pending",
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    setUploadDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateEntry(id: string, patch: Partial<FileEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function applyGlobalToAll() {
    setEntries((prev) =>
      prev
        .filter((e) => e.status === "pending")
        .map((e) => ({
          ...e,
          level_id: globalLevel || e.level_id,
          week_number: globalWeek || e.week_number,
          is_public: globalPublic,
          teacher_only: globalTeacherOnly,
        }))
        .concat(prev.filter((e) => e.status !== "pending"))
    );
  }

  async function uploadAll() {
    const pending = entries.filter((e) => e.status === "pending");
    if (!pending.length) return;

    for (const entry of pending) {
      updateEntry(entry.id, { status: "uploading" });
      const fd = new FormData();
      fd.set("title", entry.title || entry.file.name);
      fd.set("file", entry.file);
      if (entry.level_id) fd.set("level_id", entry.level_id);
      if (entry.week_number) fd.set("week_number", entry.week_number);
      fd.set("is_public", String(entry.is_public));
      fd.set("teacher_only", String(entry.teacher_only));

      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            const res = await uploadSingleMaterial(fd);
            if (res.error) {
              updateEntry(entry.id, { status: "error", error: res.error });
            } else {
              updateEntry(entry.id, { status: "done" });
            }
          } catch (e) {
            updateEntry(entry.id, { status: "error", error: String(e) });
          }
          resolve();
        });
      });
    }
    setUploadDone(true);
  }

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount = entries.filter((e) => e.status === "done").length;
  const errorCount = entries.filter((e) => e.status === "error").length;
  const uploadingCount = entries.filter((e) => e.status === "uploading").length;
  const busy = uploadingCount > 0 || isPending;

  const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: "#f1f5f9", fg: "#475569", label: "Pending" },
    uploading: { bg: "#eff6ff", fg: "#1d4ed8", label: "Uploading…" },
    done:      { bg: "#f0fdf4", fg: "#15803d", label: "Done" },
    error:     { bg: "#fef2f2", fg: "#b91c1c", label: "Error" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${C.border}`,
          borderRadius: 14,
          padding: "36px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: C.bg,
          transition: "border-color .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.green)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
        <p style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>Click or drag files here</p>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>PDF, DOCX, MP3, MP4, WAV, up to 100 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.mp3,.mp4,.wav,.m4a,.mov"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Global settings row */}
      {entries.some((e) => e.status === "pending") && (
        <div style={{ background: C.greenWash, border: `1px solid #bbf7d0`, borderRadius: 12, padding: "14px 18px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.greenDark, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Apply to all pending files</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <select
              value={globalLevel}
              onChange={(e) => setGlobalLevel(e.target.value)}
              style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.ink }}
            >
              <option value="">- Level -</option>
              {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <input
              type="number"
              placeholder="Week"
              min={1}
              value={globalWeek}
              onChange={(e) => setGlobalWeek(e.target.value)}
              style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, width: 72, color: C.ink }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.ink, cursor: "pointer" }}>
              <input type="checkbox" checked={globalPublic} onChange={(e) => setGlobalPublic(e.target.checked)} />
              Public
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.ink, cursor: "pointer" }}>
              <input type="checkbox" checked={globalTeacherOnly} onChange={(e) => setGlobalTeacherOnly(e.target.checked)} />
              Teacher only
            </label>
            <button
              onClick={applyGlobalToAll}
              style={{ fontSize: 12, fontWeight: 700, background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
            >
              Apply to all
            </button>
          </div>
        </div>
      )}

      {/* File list */}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry) => {
            const ss = STATUS_STYLE[entry.status];
            return (
              <div
                key={entry.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  opacity: entry.status === "done" ? 0.7 : 1,
                }}
              >
                {/* Status badge */}
                <span style={{ fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.fg, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {ss.label}
                </span>

                {/* Title */}
                <input
                  value={entry.title}
                  disabled={entry.status !== "pending"}
                  onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                  style={{
                    flex: "1 1 180px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.ink,
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "5px 9px",
                    background: entry.status !== "pending" ? C.bg : "#fff",
                  }}
                />

                {/* Level */}
                <select
                  value={entry.level_id}
                  disabled={entry.status !== "pending"}
                  onChange={(e) => updateEntry(entry.id, { level_id: e.target.value })}
                  style={{ fontSize: 12, padding: "5px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: entry.status !== "pending" ? C.bg : "#fff", color: C.ink, flexShrink: 0 }}
                >
                  <option value="">- Level -</option>
                  {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>

                {/* Week */}
                <input
                  type="number"
                  min={1}
                  value={entry.week_number}
                  disabled={entry.status !== "pending"}
                  onChange={(e) => updateEntry(entry.id, { week_number: e.target.value })}
                  placeholder="Wk"
                  style={{ fontSize: 12, padding: "5px 8px", borderRadius: 7, border: `1px solid ${C.border}`, width: 58, background: entry.status !== "pending" ? C.bg : "#fff", color: C.ink, flexShrink: 0 }}
                />

                {/* Public toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted, cursor: "pointer", flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={entry.is_public}
                    disabled={entry.status !== "pending"}
                    onChange={(e) => updateEntry(entry.id, { is_public: e.target.checked })}
                  />
                  Public
                </label>

                {/* Teacher only toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7e22ce", cursor: "pointer", flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={entry.teacher_only}
                    disabled={entry.status !== "pending"}
                    onChange={(e) => updateEntry(entry.id, { teacher_only: e.target.checked })}
                  />
                  Teacher only
                </label>

                {/* File size */}
                <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>
                  {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                </span>

                {/* Error message */}
                {entry.error && (
                  <span style={{ fontSize: 11, color: C.red, flex: "1 1 100%" }}>{entry.error}</span>
                )}

                {/* Remove */}
                {entry.status === "pending" && (
                  <button
                    onClick={() => removeEntry(entry.id)}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary + upload button */}
      {entries.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, fontSize: 12, color: C.muted, flex: 1 }}>
            {pendingCount > 0 && <span><b style={{ color: C.ink }}>{pendingCount}</b> pending</span>}
            {doneCount > 0 && <span style={{ color: C.green }}><b>{doneCount}</b> uploaded</span>}
            {errorCount > 0 && <span style={{ color: C.red }}><b>{errorCount}</b> failed</span>}
          </div>
          {uploadDone && !pendingCount ? (
            <button
              onClick={() => { setEntries([]); setUploadDone(false); }}
              style={{ fontSize: 13, fontWeight: 700, background: C.greenWash, color: C.greenDark, border: `1px solid #bbf7d0`, borderRadius: 8, padding: "9px 20px", cursor: "pointer" }}
            >
              Upload more
            </button>
          ) : (
            <button
              onClick={uploadAll}
              disabled={busy || !pendingCount}
              style={{
                fontSize: 14,
                fontWeight: 700,
                background: busy || !pendingCount ? C.border : C.green,
                color: busy || !pendingCount ? C.muted : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                cursor: busy || !pendingCount ? "not-allowed" : "pointer",
                transition: "background .15s",
              }}
            >
              {busy ? `Uploading… (${uploadingCount})` : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
