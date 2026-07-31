import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "./NavLinks";

const ADMIN_NAV = [
  { href: "/admin",              label: "Overview" },
  { href: "/admin/students",     label: "Students" },
  { href: "/admin/payments",     label: "Payments" },
  { href: "/admin/grades",       label: "English Level" },
  { href: "/admin/announcements",label: "Announcements" },
  { href: "/admin/calendar",     label: "Calendar" },
  { href: "/admin/classes",      label: "Classes" },
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
          { href: "/staff",           label: "My classes" },
          { href: "/staff/levels",    label: "English Level" },
          { href: "/staff/resources", label: "Library" },
        ]
      : roleName === "student"
      ? [
          { href: "/student",               label: "My progress" },
          { href: "/student/grades",        label: "My level" },
          { href: "/student/materials",     label: "Library" },
          { href: "/student/announcements", label: "Announcements" },
          { href: "/student/calendar",      label: "Calendar" },
        ]
      : [];

  return <NavLinks items={items} />;
}
