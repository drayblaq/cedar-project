"use client";

export type ViewerDoc = {
  title: string;
  url: string;
  material_type: string;
};

interface Props {
  material: ViewerDoc | null;
  onClose: () => void;
}

const S = {
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f1f5f9",
  surface: "#ffffff",
};

function TypeBadge({ type }: { type: string }) {
  const isPdf = type === "pdf";
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      background: isPdf ? "#fef2f2" : "#eff6ff",
    }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: isPdf ? "#b91c1c" : "#1d4ed8" }}>
        {isPdf ? "PDF" : "DOC"}
      </span>
    </div>
  );
}

export function DocumentViewer({ material, onClose }: Props) {
  if (!material) return null;

  const isPdf = material.material_type === "pdf";
  const src = isPdf
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(material.url)}&embedded=true`
    : `https://docs.google.com/gview?url=${encodeURIComponent(material.url)}&embedded=true`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      background: "rgba(15,23,42,0.8)",
    }}>
      {/* Top bar */}
      <div style={{
        background: S.surface, borderBottom: `1px solid ${S.border}`,
        padding: "10px 20px", display: "flex", alignItems: "center",
        gap: 12, flexShrink: 0,
      }}>
        <TypeBadge type={material.material_type} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {material.title}
        </span>
        <button
          onClick={onClose}
          style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
            padding: "7px 16px", borderRadius: 8,
            border: `1px solid ${S.border}`, background: S.surface,
            fontSize: 13, fontWeight: 600, color: S.muted, cursor: "pointer",
          }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, background: S.bg, overflow: "hidden", position: "relative" }}>
        {/* Loading backdrop — iframe renders on top once loaded */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 13, color: S.muted }}>Loading document…</p>
        </div>
        <iframe
          src={src}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          title={material.title}
          allow="autoplay"
        />
      </div>
    </div>
  );
}
