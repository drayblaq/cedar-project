// PortalShell is kept for backward compatibility.
// All portals now use the unified dark sidebar via app/dashboard/layout.tsx + Sidebar.tsx.
// This file is no longer used as a wrapper.

export function PortalShell({
  children,
}: {
  children: React.ReactNode;
  links?: { href: string; label: string }[];
}) {
  return <>{children}</>;
}
