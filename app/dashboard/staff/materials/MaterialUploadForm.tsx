"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18" };

type Level = { id: string; name: string };

export function MaterialUploadForm({ levels, defaultLevelId }: { levels: Level[]; defaultLevelId?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState("pdf");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const usesFile = type === "pdf" || type === "document";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("is_public", isPublic ? "true" : "false");
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await createMaterial(fd);
        if (res?.error) {
          setMsg({ ok: false, text: res.error });
        } else {
          setMsg({ ok: true, text: "Material uploaded." });
          formRef.current?.reset();
          setFileName(null);
          setIsPublic(false);
          setType("pdf");
          router.refresh();
        }
      } catch (e) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed. Please try again." });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="cd-fld">
        <span>Title</span>
        <input name="title" type="text" required placeholder="e.g. Unit 1 Vocabulary List" />
      </label>

      <label className="cd-fld">
        <span>Description (optional)</span>
        <input name="description" type="text" placeholder="Short description…" />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="cd-fld">
          <span>Level</span>
          <select name="level_id" defaultValue={defaultLevelId ?? ""}>
            <option value="">— Select level —</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
        <label className="cd-fld">
          <span>Week number (optional)</span>
          <input name="week_number" type="number" min="1" placeholder="1" />
        </label>
      </div>

      <label className="cd-fld">
        <span>Topic</span>
        <input name="topic" type="text" placeholder="e.g. Unit 1: Greetings" />
      </label>

      <label className="cd-fld">
        <span>Type</span>
        <select name="material_type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="document">Document</option>
          <option value="link">Link</option>
          <option value="video">Video</option>
        </select>
      </label>

      {/* File upload vs URL */}
      {usesFile ? (
        <div>
          <input
            ref={fileRef}
            name="file"
            type="file"
            accept={type === "pdf" ? ".pdf" : ".pdf,.doc,.docx,.ppt,.pptx,image/*"}
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: "100%", padding: "16px", borderRadius: 11, cursor: "pointer",
              border: `2px dashed ${fileName ? C.green : C.border}`,
              background: fileName ? C.greenWash : "#fafdf9", color: fileName ? C.greenDark : C.muted,
              fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "border-color .15s, background .15s",
            }}
          >
            {fileName ? `✓ ${fileName}` : "Click to upload PDF"}
          </button>
        </div>
      ) : (
        <label className="cd-fld">
          <span>URL</span>
          <input name="url" type="url" placeholder="https://…" />
        </label>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: C.ink, cursor: "pointer" }}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.green }} />
        Visible to all students (regardless of level)
      </label>

      <button type="submit" disabled={pending} className="cd-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
        {pending ? "Uploading…" : "Upload material"}
      </button>

      {msg && (
        <p style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? C.greenDark : "#b3402f" }}>
          {msg.ok ? "✓ " : ""}{msg.text}
        </p>
      )}
    </form>
  );
}
