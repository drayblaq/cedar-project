import { createClient } from "@/lib/supabase/server";
import { SidebarClient, type NavItem } from "./SidebarClient";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin",               label: "Overview",      iconKey: "overview" },
  { href: "/admin/students",      label: "Students",      iconKey: "students" },
  { href: "/admin/payments",      label: "Payments",      iconKey: "payments" },
  { href: "/admin/attendance",    label: "Attendance",    iconKey: "attendance" },
  { href: "/admin/grades",        label: "Grades",        iconKey: "grades" },
  { href: "/admin/announcements", label: "Announcements", iconKey: "announcements" },
  { href: "/admin/calendar",      label: "Calendar",      iconKey: "calendar" },
  { href: "/admin/classes",       label: "Classes",       iconKey: "classes" },
  { href: "/admin/parent-links",  label: "Parent Links",  iconKey: "parentLinks" },
];

const STAFF_NAV: NavItem[] = [
  { href: "/staff",            label: "My Classes",  iconKey: "myClasses" },
  { href: "/staff/attendance", label: "Attendance",  iconKey: "attendance" },
];

const STUDENT_NAV: NavItem[] = [
  { href: "/student",               label: "My Progress",   iconKey: "progress" },
  { href: "/student/grades",        label: "Grades",        iconKey: "grades" },
  { href: "/student/attendance",    label: "Attendance",    iconKey: "attendance" },
  { href: "/student/announcements", label: "Announcements", iconKey: "announcements" },
  { href: "/student/calendar",      label: "Calendar",      iconKey: "calendar" },
];

const PARENT_NAV: NavItem[] = [
  { href: "/parent",               label: "My Children",   iconKey: "myChildren" },
  { href: "/parent/announcements", label: "Announcements", iconKey: "announcements" },
];

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role_id")
    .eq("id", user.id)
    .single();

  let roleName = "user";
  if (profile?.role_id) {
    const { data: roleRow } = await supabase
      .from("roles")
      .select("name")
      .eq("id", profile.role_id)
      .single();
    roleName = roleRow?.name ?? "user";
  }

  const userName =
    (profile as { full_name?: string | null } | null)?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  const navItems =
    roleName === "admin"   ? ADMIN_NAV   :
    roleName === "staff"   ? STAFF_NAV   :
    roleName === "student" ? STUDENT_NAV :
    roleName === "parent"  ? PARENT_NAV  :
    [];

  return (
    <SidebarClient
      items={navItems}
      userName={userName}
      userRole={roleName}
    />
  );
}
