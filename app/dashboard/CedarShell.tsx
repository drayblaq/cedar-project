import { TopNav } from "./TopNav";

/**
 * Dashboard chrome: Cedar top-nav + centered content area.
 * Wraps all portal pages (admin, staff, student, parent).
 * The .cedar-dash scope activates all cd-* design-system classes.
 */
export function CedarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cedar-dash" style={{ minHeight: "100vh", background: "#f4f7f2" }}>
      <TopNav />
      <div className="cedar-page-content">
        {children}
      </div>
    </div>
  );
}
