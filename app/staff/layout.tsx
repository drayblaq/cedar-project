import { PortalShell } from "@/components/PortalShell";

const STAFF_LINKS = [
  { href: "/staff", label: "My classes" },
  { href: "/staff/attendance", label: "Attendance" }
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell links={STAFF_LINKS}>{children}</PortalShell>;
}
