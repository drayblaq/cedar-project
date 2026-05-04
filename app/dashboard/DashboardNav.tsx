import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  const linkClass =
    "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300";

  if (roleName === "admin") {
    return (
      <nav className="mb-8 flex flex-wrap gap-2">
        <Link href="/admin" className={linkClass}>
          Overview
        </Link>
        <Link href="/admin/students" className={linkClass}>
          Students
        </Link>
        <Link href="/admin/payments" className={linkClass}>
          Payments
        </Link>
        <Link href="/admin/attendance" className={linkClass}>
          Attendance
        </Link>
        <Link href="/admin/grades" className={linkClass}>
          Grades
        </Link>
        <Link href="/admin/announcements" className={linkClass}>
          Announcements
        </Link>
        <Link href="/admin/calendar" className={linkClass}>
          Calendar
        </Link>
        <Link href="/admin/classes" className={linkClass}>
          Classes
        </Link>
        <Link href="/admin/parent-links" className={linkClass}>
          Parent links
        </Link>
      </nav>
    );
  }

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <Link href={roleName === "staff" ? "/staff" : roleName === "student" ? "/student" : "/parent"} className={linkClass}>
        Dashboard
      </Link>
      {roleName === "staff" && (
        <>
          <Link href="/staff" className={linkClass}>
            My classes
          </Link>
          <Link href="/staff/attendance" className={linkClass}>
            Attendance
          </Link>
        </>
      )}
      {roleName === "student" && (
        <>
          <Link href="/student" className={linkClass}>
            My progress
          </Link>
          <Link href="/student/grades" className={linkClass}>
            Grades
          </Link>
          <Link href="/student/attendance" className={linkClass}>
            Attendance
          </Link>
          <Link href="/student/announcements" className={linkClass}>
            Announcements
          </Link>
          <Link href="/student/calendar" className={linkClass}>
            Calendar
          </Link>
        </>
      )}
      {roleName === "parent" && (
        <>
          <Link href="/parent" className={linkClass}>
            My children
          </Link>
          <Link href="/parent/announcements" className={linkClass}>
            Announcements
          </Link>
        </>
      )}
    </nav>
  );
}
