import { createClient } from "@/lib/supabase/server";
import { SidebarClient, ICONS } from "./SidebarClient";

const ADMIN_NAV = [
  { href: "/admin",               label: "Overview",       icon: ICONS.overview },
  { href: "/admin/students",      label: "Students",       icon: ICONS.students },
  { href: "/admin/payments",      label: "Payments",       icon: ICONS.payments },
  { href: "/admin/attendance",    label: "Attendance",     icon: ICONS.attendance },
  { href: "/admin/grades",        label: "Grades",         icon: ICONS.grades },
  { href: "/admin/announcements", label: "Announcements",  icon: ICONS.announcements },
  { href: "/admin/calendar",      label: "Calendar",       icon: ICONS.calendar },
  { href: "/admin/classes",       label: "Classes",        icon: ICONS.classes },
  { href: "/admin/parent-links",  label: "Parent Links",   icon: ICONS.parentLinks },
];

const STAFF_NAV = [
  { href: "/staff",            label: "My Classes",  icon: ICONS.myClasses },
  { href: "/staff/attendance", label: "Attendance",  icon: ICONS.attendance },
];

const STUDENT_NAV = [
  { href: "/student",               label: "My Progress",    icon: ICONS.progress },
  { href: "/student/grades",        label: "Grades",         icon: ICONS.grades },
  { href: "/student/attendance",    label: "Attendance",     icon: ICONS.attendance },
  { href: "/student/announcements", label: "Announcements",  icon: ICONS.announcements },
  { href: "/student/calendar",      label: "Calendar",       icon: ICONS.calendar },
];

const PARENT_NAV = [
  { href: "/parent",               label: "My Children",    icon: ICONS.myChildren },
  { href: "/parent/announcements", label: "Announcements",  icon: ICONS.announcements },
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
    const { data: roleRow } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
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
