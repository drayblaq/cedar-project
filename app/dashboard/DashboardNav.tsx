import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "./NavLinks";

const ADMIN_NAV = [
  { href: "/admin",              label: "Overview" },
  { href: "/admin/students",     label: "Students" },
  { href: "/admin/payments",     label: "Payments" },
  { href: "/admin/attendance",   label: "Attendance" },
  { href: "/admin/grades",       label: "Grades" },
  { href: "/admin/announcements",label: "Announcements" },
  { href: "/admin/calendar",     label: "Calendar" },
  { href: "/admin/classes",      label: "Classes" },
  { href: "/admin/parent-links", label: "Parent links" },
];

export async function DashboardNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();
  if (!profile?.role_id) return null;

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();
  const roleName = role?.name ?? "";

  if (roleName === "admin") {
    return <NavLinks items={ADMIN_NAV} />;
  }

  const items =
    roleName === "staff"
      ? [
          { href: "/staff",            label: "My classes" },
          { href: "/staff/attendance", label: "Attendance" },
        ]
      : roleName === "student"
      ? [
          { href: "/student",               label: "My progress" },
          { href: "/student/grades",        label: "Grades" },
          { href: "/student/attendance",    label: "Attendance" },
          { href: "/student/announcements", label: "Announcements" },
          { href: "/student/calendar",      label: "Calendar" },
        ]
      : roleName === "parent"
      ? [
          { href: "/parent",               label: "My children" },
          { href: "/parent/announcements", label: "Announcements" },
        ]
      : [];

  return <NavLinks items={items} />;
}
