import { createClient } from "@/lib/supabase/server";
import { TopNavClient, type NavItem } from "./TopNavClient";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin",              label: "Overview",      iconKey: "overview" },
  { href: "/admin/students",     label: "Students",      iconKey: "students" },
  { href: "/admin/payments",     label: "Payments",      iconKey: "payments" },
  { href: "/admin/attendance",   label: "Attendance",    iconKey: "attendance" },
  { href: "/admin/grades",       label: "English Level",    iconKey: "grades" },
  { href: "/admin/classes",      label: "Classes",       iconKey: "classes" },
  { href: "/admin/announcements",label: "Announcements", iconKey: "announcements" },
  { href: "/admin/calendar",     label: "Calendar",      iconKey: "calendar" },
  { href: "/admin/parent-links", label: "Parent Links",  iconKey: "parentLinks" },
  { href: "/admin/messages",     label: "Messages",      iconKey: "mail" },
  { href: "/admin/staff",        label: "Staff",         iconKey: "students" },
  { href: "/admin/library",      label: "Resources",  iconKey: "doc" },
  { href: "/admin/settings",     label: "Settings",   iconKey: "settings" },
];

const STAFF_NAV: NavItem[] = [
  { href: "/staff",              label: "My Classes",    iconKey: "myClasses" },
  { href: "/staff/attendance",   label: "Attendance",    iconKey: "attendance" },
  { href: "/staff/grades",       label: "Grades",        iconKey: "grades" },
  { href: "/staff/levels",       label: "English Level", iconKey: "grades" },
  { href: "/staff/materials",    label: "Library",       iconKey: "book" },
  { href: "/staff/resources",   label: "Resources",     iconKey: "doc" },
];

const STUDENT_NAV: NavItem[] = [
  { href: "/student",               label: "Overview",       iconKey: "progress" },
  { href: "/student/grades",        label: "My Level",       iconKey: "grades" },
  { href: "/student/materials",     label: "Library",        iconKey: "book" },
  { href: "/student/announcements", label: "Announcements",  iconKey: "announcements" },
  { href: "/student/calendar",      label: "Calendar",       iconKey: "calendar" },
];

const PARENT_NAV: NavItem[] = [
  { href: "/parent",               label: "Overview",       iconKey: "overview" },
  { href: "/parent/attendance",    label: "Attendance",     iconKey: "attendance" },
  { href: "/parent/payments",      label: "Payments",       iconKey: "payments" },
  { href: "/parent/announcements", label: "Announcements",  iconKey: "announcements" },
];

export async function TopNav() {
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

  // Admin notifications (e.g. new registrations, messages, payments)
  let notifications: { id: string; type: string; title: string; body: string | null; link: string | null; is_read: boolean; created_at: string }[] = [];
  let unreadCount = 0;
  if (roleName === "admin") {
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    notifications = data ?? [];
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    unreadCount = count ?? notifications.filter((n) => !n.is_read).length;
  }

  return (
    <TopNavClient
      items={navItems}
      userName={userName}
      userRole={roleName}
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}
