import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

export default async function StudentDashboardPage() {
  const result = await getStudentForCurrentUser();
  if (!result?.student) {
    return (
      <div className="px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">Student portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My progress</h1>
        <p className="mt-4 text-slate-600">
          No student record is linked to your account yet. Please contact the center if you have already received your login email.
        </p>
      </div>
    );
  }

  const { student } = result;
  const supabase = await createClient();

  // Attendance stats: present+late vs total
  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", student.id);
  const total = attendanceRows?.length ?? 0;
  const presentOrLate = attendanceRows?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const attendancePct = total > 0 ? Math.round((presentOrLate / total) * 100) : null;

  // Recent grades (last 5)
  const { data: grades } = await supabase
    .from("grades")
    .select("id, subject_or_type, score, remarks, academic_terms(name)")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Upcoming calendar events (next 5)
  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, event_date, event_type")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);

  // Latest announcement
  const { data: latestAnnouncement } = await supabase
    .from("announcements")
    .select("id, title, published_at")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  const level = levelName(student.levels);

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Student portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">My progress</h1>
      <p className="mt-2 text-slate-600">
        Welcome, <strong>{student.full_name}</strong>.{level !== "—" ? ` Level: ${level}.` : ""}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/student/grades"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-emerald-200 hover:shadow-emerald-100"
        >
          <h3 className="text-sm font-medium text-slate-500">Grades</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">{grades?.length ?? 0} recorded</p>
          <p className="mt-1 text-sm text-emerald-600">View all →</p>
        </Link>
        <Link
          href="/dashboard/student/attendance"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-emerald-200 hover:shadow-emerald-100"
        >
          <h3 className="text-sm font-medium text-slate-500">Attendance</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {attendancePct != null ? `${attendancePct}%` : "—"}
          </p>
          <p className="mt-1 text-sm text-emerald-600">View history →</p>
        </Link>
        <Link
          href="/dashboard/student/announcements"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-emerald-200 hover:shadow-emerald-100"
        >
          <h3 className="text-sm font-medium text-slate-500">Announcements</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {latestAnnouncement ? "Latest" : "—"}
          </p>
          <p className="mt-1 text-sm text-emerald-600">View all →</p>
        </Link>
        <Link
          href="/dashboard/student/calendar"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-emerald-200 hover:shadow-emerald-100"
        >
          <h3 className="text-sm font-medium text-slate-500">Calendar</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">{events?.length ?? 0} upcoming</p>
          <p className="mt-1 text-sm text-emerald-600">View events →</p>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Recent grades</h2>
          {!grades?.length ? (
            <p className="mt-4 text-slate-500">No grades recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {grades.map((g) => (
                <li key={g.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <span className="font-medium text-slate-700">{g.subject_or_type}</span>
                  <span className="text-slate-900 font-semibold">{g.score != null ? `${g.score}` : "—"}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/student/grades" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline">
            View all grades →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Upcoming events</h2>
          {!events?.length ? (
            <p className="mt-4 text-slate-500">No upcoming events.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <span className="font-medium text-slate-700">{e.title}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(e.event_date).toLocaleDateString()} {e.event_type ? `(${e.event_type})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/student/calendar" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline">
            View calendar →
          </Link>
        </div>
      </div>
    </div>
  );
}
