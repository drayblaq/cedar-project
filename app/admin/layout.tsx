import { PortalShell } from "@/components/PortalShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/grades", label: "Grades" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/parent-links", label: "Parent links" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) redirect("/auth/login?next=/admin");

  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") redirect("/auth/login?next=/admin");

  return <PortalShell links={ADMIN_LINKS}>{children}</PortalShell>;
}
