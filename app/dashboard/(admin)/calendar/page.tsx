import { createClient } from "@/lib/supabase/server";
import { createAcademicTerm, createCalendarEvent, deleteCalendarEvent } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary, btnDanger } from "../../ui";

const EVENT_BADGE: Record<string, string> = {
  holiday:  "bg-green-100 text-green-700",
  exam:     "bg-red-100 text-red-700",
  deadline: "bg-amber-100 text-amber-700",
  other:    "bg-slate-100 text-slate-600",
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: terms } = await supabase.from("academic_terms").select("id, name, start_date, end_date").order("start_date", { ascending: false });
  const { data: events } = await supabase.from("calendar_events").select("id, title, description, event_date, event_type").order("event_date", { ascending: false }).limit(30);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Calendar & Terms</h1>
        <p className="mt-1 text-sm text-slate-500">Manage academic terms and calendar events.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: forms */}
        <div className="space-y-6">
          <div className={`${card} p-6`}>
            <h2 className="mb-5 text-sm font-semibold text-slate-900">Add academic term</h2>
            <form action={createAcademicTerm as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
              <div>
                <label htmlFor="name" className={label}>Name *</label>
                <input id="name" name="name" type="text" required placeholder="e.g. Term 1 — 2025" className={input} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="start_date" className={label}>Start *</label>
                  <input id="start_date" name="start_date" type="date" required className={input} />
                </div>
                <div>
                  <label htmlFor="end_date" className={label}>End *</label>
                  <input id="end_date" name="end_date" type="date" required className={input} />
                </div>
              </div>
              <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Add term</button>
            </form>
          </div>

          <div className={`${card} p-6`}>
            <h2 className="mb-5 text-sm font-semibold text-slate-900">Add calendar event</h2>
            <form action={createCalendarEvent as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
              <div>
                <label htmlFor="event_title" className={label}>Title *</label>
                <input id="event_title" name="title" type="text" required className={input} placeholder="Event title…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="event_date" className={label}>Date *</label>
                  <input id="event_date" name="event_date" type="date" required className={input} />
                </div>
                <div>
                  <label htmlFor="event_type" className={label}>Type</label>
                  <select id="event_type" name="event_type" className={input}>
                    <option value="other">Other</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className={label}>Description</label>
                <textarea id="description" name="description" rows={2} className={input} placeholder="Optional…" />
              </div>
              <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>Add event</button>
            </form>
          </div>
        </div>

        {/* Right: lists */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Academic terms</h2>
            {!terms?.length ? (
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-8 text-center">
                <p className="text-sm text-slate-400">No terms yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {terms.map((t: { id: string; name: string; start_date: string; end_date: string }) => (
                  <div key={t.id} className={`${card} flex items-center justify-between px-5 py-3.5`}>
                    <div>
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(t.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} –{" "}
                        {new Date(t.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Events</h2>
            {!events?.length ? (
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-8 text-center">
                <p className="text-sm text-slate-400">No events yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((e: { id: string; title: string; description: string | null; event_date: string; event_type: string }) => (
                  <div key={e.id} className={`${card} flex items-center justify-between px-5 py-3.5`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          {new Date(e.event_date).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        <p className="text-xl font-black text-slate-900 leading-none">
                          {new Date(e.event_date).getDate()}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{e.title}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${EVENT_BADGE[e.event_type] ?? EVENT_BADGE.other}`}>
                          {e.event_type}
                        </span>
                      </div>
                    </div>
                    <form action={deleteCalendarEvent.bind(null, e.id) as unknown as (fd: FormData) => Promise<void>} className="ml-3 shrink-0">
                      <button type="submit" className={btnDanger}>Delete</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
