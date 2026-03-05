import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser } from "@/lib/student-auth";

export default async function StudentCalendarPage() {
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, event_date, event_type")
    .order("event_date", { ascending: true })
    .limit(50);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events?.filter((e) => e.event_date >= today) ?? [];
  const past = events?.filter((e) => e.event_date < today) ?? [];

  const eventTypeBadge = (type: string | null) => {
    if (!type || type === "other") return "bg-slate-100 text-slate-700";
    if (type === "exam") return "bg-red-100 text-red-800";
    if (type === "holiday") return "bg-emerald-100 text-emerald-800";
    if (type === "deadline") return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Student portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Calendar</h1>
      <p className="mt-2 text-slate-600">Academic events, exams, and deadlines.</p>

      {!events?.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">No events yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming</h2>
              <ul className="mt-4 space-y-3">
                {upcoming.map((e) => (
                  <li key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{e.title}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${eventTypeBadge(e.event_type)}`}>
                        {e.event_type ?? "other"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(e.event_date).toLocaleDateString()}
                    </p>
                    {e.description && <p className="mt-2 text-slate-600">{e.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Past events</h2>
              <ul className="mt-4 space-y-3">
                {past.map((e) => (
                  <li key={e.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-700">{e.title}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${eventTypeBadge(e.event_type)}`}>
                        {e.event_type ?? "other"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(e.event_date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
