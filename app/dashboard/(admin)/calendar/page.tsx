import { createClient } from "@/lib/supabase/server";
import { createAcademicTerm, createCalendarEvent, deleteCalendarEvent } from "@/app/dashboard/actions/index";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: terms } = await supabase
    .from("academic_terms")
    .select("id, name, start_date, end_date")
    .order("start_date", { ascending: false });
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, event_date, event_type")
    .order("event_date", { ascending: false })
    .limit(30);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Academics</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Calendar & terms</h1>
      <p className="mt-2 text-slate-600">Manage academic terms and calendar events (exams, holidays, deadlines).</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900">New academic term</h2>
            <form action={createAcademicTerm as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name *</label>
                <input id="name" name="name" type="text" required placeholder="e.g. Term 1 2025" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-slate-700">Start date *</label>
                  <input id="start_date" name="start_date" type="date" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-slate-700">End date *</label>
                  <input id="end_date" name="end_date" type="date" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
                Add term
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900">New calendar event</h2>
            <form action={createCalendarEvent as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
              <div>
                <label htmlFor="event_title" className="block text-sm font-medium text-slate-700">Title *</label>
                <input id="event_title" name="title" type="text" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              </div>
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-slate-700">Date *</label>
                <input id="event_date" name="event_date" type="date" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              </div>
              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-slate-700">Type</label>
                <select id="event_type" name="event_type" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                  <option value="other">Other</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea id="description" name="description" rows={2} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
                Add event
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Academic terms</h2>
            {!terms?.length ? (
              <p className="mt-4 text-slate-500">No terms yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {terms.map((t: { id: string; name: string; start_date: string; end_date: string }) => (
                  <li key={t.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(t.start_date).toLocaleDateString()} – {new Date(t.end_date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming events</h2>
            {!events?.length ? (
              <p className="mt-4 text-slate-500">No events yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {events.map((e: { id: string; title: string; description: string | null; event_date: string; event_type: string }) => (
                  <li key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div>
                      <p className="font-medium text-slate-900">{e.title}</p>
                      <p className="text-sm text-slate-500">{new Date(e.event_date).toLocaleDateString()} · {e.event_type}</p>
                    </div>
                    <form action={deleteCalendarEvent.bind(null, e.id) as unknown as (fd: FormData) => Promise<void>}>
                      <button type="submit" className="text-sm text-red-600 hover:underline">Delete</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
