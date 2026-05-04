import { PortalShell } from "@/components/PortalShell";

const STUDENT_LINKS = [
  { href: "/student", label: "My progress" },
  { href: "/student/grades", label: "Grades" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/announcements", label: "Announcements" },
  { href: "/student/calendar", label: "Calendar" }
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell links={STUDENT_LINKS}>{children}</PortalShell>;
}
