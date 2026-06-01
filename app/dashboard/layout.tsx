import { Sidebar } from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cedar-dash" style={{ minHeight: "100vh" }}>
      {/* Fixed sidebar — 250px, desktop only */}
      <Sidebar />
      {/* Main column offset by sidebar width */}
      <div style={{ marginLeft: 250, minHeight: "100vh", display: "flex", flexDirection: "column" }}
           className="cedar-dash-main">
        {children}
      </div>

      {/* Mobile: no offset — sidebar is a drawer */}
      <style>{`
        @media (max-width: 900px) {
          .cedar-dash-main { margin-left: 0 !important; padding-top: 60px; }
        }
      `}</style>
    </div>
  );
}
