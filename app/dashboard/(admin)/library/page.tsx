import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";

const C = { ink: "#0f172a", muted: "#64748b", border: "#e2e8f0", blue: "#1d4ed8", blueLight: "#eff6ff", blueBorder: "#bfdbfe", blueMid: "#93c5fd", blueDark: "#1e40af" };

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.blueMid, color: C.blueDark, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {n}
      </span>
      <p style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

export default function AdminLibraryPage() {
  return (
    <div>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Library
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          Upload and manage all teaching resources.
        </p>
      </div>

<ResourceExplorer isAdmin={true} />
    </div>
  );
}
