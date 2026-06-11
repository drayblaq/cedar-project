"use client";

const C = {
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f1f5f9",
};

export type ViewerMaterial = {
  id: string;
  title: string;
  url: string;
  material_type: string;
  description: string | null;
};

interface Props {
  material: ViewerMaterial | null;
  onClose: () => void;
}

function TypeChip({ type }: { type: string }) {
  const isPdf = type === "pdf";
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
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
  const viewerUrl = isPdf
    ? material.url
    : `https://docs.google.com/gview?url=${encodeURIComponent(material.url)}&embedded=true`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        background: "#fff",
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <TypeChip type={material.material_type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {material.title}
          </p>
          {material.description && (
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {material.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "#fff", color: C.muted, fontSize: 13, fontWeight: 600,
            cursor: "pointer", flexShrink: 0, transition: "background .12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      </div>

      {/* Iframe viewer */}
      <div style={{ flex: 1, background: C.bg, overflow: "hidden" }}>
        <iframe
          src={viewerUrl}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title={material.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
