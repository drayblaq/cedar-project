import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

export default async function StudentDashboardPage() {
  const result = await getStudentForCurrentUser();
  if (!result?.student) {
    return (
      <div className="px-4 sm:px-6 py-8">
        <div className="animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Student portal</p>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Progress</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
            No student record is linked to your account yet. Please contact the center if you have already received your login email.
          </p>
        </div>
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
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Student Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Hello, {student.full_name.split(" ")[0]} 👋
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl leading-relaxed">
            Welcome back to your dashboard.{level !== "—" ? ` You are currently enrolled in Level ${level}.` : ""}
          </p>
        </div>

        {/* Quick action button (Optional) */}
        <Link
          href="/dashboard/student/calendar"
          className="group inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Schedule
        </Link>
      </div>

      {/* Stats Overview Grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Grades Card */}
        <Link
          href="/dashboard/student/grades"
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Grades</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{grades?.length ?? 0}</p>
              <span className="text-sm font-medium text-slate-500">recorded</span>
            </div>
            <p className="mt-4 flex items-center text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              View all results <span className="ml-1">→</span>
            </p>
          </div>
        </Link>

        {/* Attendance Card */}
        <Link
          href="/dashboard/student/attendance"
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Attendance</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <p className="text-4xl font-black text-slate-900 tracking-tight">
                {attendancePct != null ? attendancePct : "—"}
              </p>
              {attendancePct != null && <span className="text-2xl font-bold text-slate-400">%</span>}
            </div>
            <p className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              View history <span className="ml-1">→</span>
            </p>
          </div>
        </Link>

        {/* Calendar Card */}
        <Link
          href="/dashboard/student/calendar"
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-100 md:col-span-2 lg:col-span-1"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Calendar</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{events?.length ?? 0}</p>
              <span className="text-sm font-medium text-slate-500">upcoming</span>
            </div>
            <p className="mt-4 flex items-center text-sm font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
              View full schedule <span className="ml-1">→</span>
            </p>
          </div>
        </Link>

        {/* Announcements Card */}
        <Link
          href="/dashboard/student/announcements"
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-purple-100 md:col-span-2 lg:col-span-1"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Updates</h3>
            <div className="mt-3">
              {latestAnnouncement ? (
                <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                  {latestAnnouncement.title}
                </p>
              ) : (
                <p className="text-2xl font-black text-slate-900 tracking-tight">—</p>
              )}
            </div>
            <p className="mt-4 flex items-center text-sm font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
              See all news <span className="ml-1">→</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Detail Sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Grades List */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent grades</h2>
            <Link href="/dashboard/student/grades" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
              View all
            </Link>
          </div>

          {!grades?.length ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100 mb-3 shadow-sm">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">No grades recorded yet.</p>
              <p className="text-slate-400 text-xs mt-1">Check back later for updates.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {grades.map((g) => (
                <li key={g.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-100 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                      {g.subject_or_type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{g.subject_or_type}</p>
                      {g.academic_terms?.name && (
                        <p className="text-xs text-slate-500 font-medium">{g.academic_terms.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {g.score != null ? `${g.score}` : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Events List */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming events</h2>
            <Link href="/dashboard/student/calendar" className="text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors">
              View all
            </Link>
          </div>

          {!events?.length ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100 mb-3 shadow-sm">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">No schedule updates.</p>
              <p className="text-slate-400 text-xs mt-1">Your calendar is clear for now.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {events.map((e) => {
                const date = new Date(e.event_date);
                const day = date.getDate();
                const month = date.toLocaleString('default', { month: 'short' });

                return (
                  <li key={e.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="min-w-[3rem] px-2 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center group-hover:border-amber-200 transition-colors">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{month}</span>
                        <span className="text-lg font-black text-slate-900 leading-none">{day}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{e.title}</p>
                        <p className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1 mt-0.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${e.event_type === 'exam' ? 'bg-red-500' :
                              e.event_type === 'holiday' ? 'bg-emerald-500' :
                                e.event_type === 'deadline' ? 'bg-amber-500' : 'bg-slate-400'
                            }`}></span>
                          {e.event_type ?? "Event"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
