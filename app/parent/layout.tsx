import { PortalShell } from "@/components/PortalShell";

const PARENT_LINKS = [
  { href: "/parent", label: "My children" },
  { href: "/parent/announcements", label: "Announcements" }
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell links={PARENT_LINKS}>{children}</PortalShell>;
}
