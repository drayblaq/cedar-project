import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";

const C = { ink: "#0f172a", muted: "#64748b", border: "#e2e8f0" };

export default function AdminLibraryPage() {
  return (
    <div>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Library
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          Upload and manage all teaching resources. Use the Upload button to add lesson plans by level and week.
        </p>
      </div>
      <ResourceExplorer isAdmin={true} />
    </div>
  );
}
