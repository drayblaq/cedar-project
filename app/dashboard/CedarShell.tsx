import { Sidebar } from "./Sidebar";

/**
 * The unified dashboard chrome: dark Cedar sidebar + main content area.
 * Wraps everything in `.cedar-dash` so the Cedar design-system CSS applies.
 * Used by every portal layout (admin, staff, student, parent, and /dashboard).
 */
export function CedarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cedar-dash" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="cedar-dash-main" style={{ marginLeft: 250, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .cedar-dash-main { margin-left: 0 !important; padding-top: 60px; }
        }
      `}</style>
    </div>
  );
}
