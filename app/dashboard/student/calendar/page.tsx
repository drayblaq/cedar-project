import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser } from "@/lib/student-auth";

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getDaysOfWeek(startDate: Date) {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function timeToMinutes(timeStr: string) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":");
  return parseInt(h) * 60 + parseInt(m);
}

export default async function StudentCalendarPage(props: { searchParams: Promise<{ date?: string }> }) {
  const t = await getTranslations("dashboard.student");
  const searchParams = await props.searchParams;
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  const queryDate = searchParams.date ? new Date(searchParams.date) : new Date();
  if (isNaN(queryDate.getTime())) queryDate.setTime(new Date().getTime());

  const startOfWeek = getStartOfWeek(queryDate);
  const daysOfWeek = getDaysOfWeek(startOfWeek);
  const weekStartStr = daysOfWeek[0].toISOString().slice(0, 10);
  const weekEndStr = daysOfWeek[6].toISOString().slice(0, 10);

  const prevWeek = new Date(startOfWeek);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(startOfWeek);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, event_date, event_type, start_time, end_time")
    .gte("event_date", weekStartStr)
    .lte("event_date", weekEndStr)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  const weekEvents = events ?? [];
  const allDayEvents = weekEvents.filter(e => !e.start_time || !e.end_time);
  const timedEvents = weekEvents.filter(e => e.start_time && e.end_time);

  const eventTypeColors: Record<string, string> = {
    holiday: "bg-emerald-100 text-emerald-800 border-emerald-300",
    exam: "bg-red-100 text-red-800 border-red-300",
    deadline: "bg-amber-100 text-amber-800 border-amber-300",
    other: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };

  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
  const HOUR_HEIGHT = 60;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-1">{t("schedule")}</p>
          <h1 className="text-3xl font-extrabold text-slate-900">{t("weeklyCalendar")}</h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <Link href={`/dashboard/student/calendar?date=${prevWeek.toISOString().slice(0, 10)}`} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="text-sm font-semibold text-slate-700 w-48 text-center">
            {startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {daysOfWeek[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Link href={`/dashboard/student/calendar?date=${nextWeek.toISOString().slice(0, 10)}`} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
          <Link href="/dashboard/student/calendar" className="ml-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hidden sm:block">
            {t("today")}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
          <div className="py-4 px-2 border-r border-slate-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("time")}</span>
          </div>
          {daysOfWeek.map((day, i) => {
            const isToday = day.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
            return (
              <div key={i} className={`py-3 px-2 text-center border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-emerald-50/50' : ''}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${isToday ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-800'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {allDayEvents.length > 0 && (
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="py-2 px-2 border-r border-slate-200 flex items-center justify-center bg-slate-50">
              <span className="text-xs font-medium text-slate-400 text-center">{t("allDay")}</span>
            </div>
            {daysOfWeek.map((day, i) => {
              const dayStr = day.toISOString().slice(0, 10);
              const dayEvents = allDayEvents.filter(e => e.event_date === dayStr);
              return (
                <div key={i} className="p-1 border-r border-slate-200 last:border-r-0">
                  {dayEvents.map(e => (
                    <div key={e.id} className={`mb-1 px-2 py-1 text-xs font-semibold rounded ${eventTypeColors[e.event_type || 'other'] || eventTypeColors.other}`}>
                      {e.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="grid grid-cols-8 relative" style={{ minHeight: TOTAL_HOURS * HOUR_HEIGHT }}>
            {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
              const hour = START_HOUR + i;
              return (
                <div key={i} className="col-span-8 grid grid-cols-8 absolute w-full" style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}>
                  <div className="border-r border-b border-slate-100 flex items-start justify-center p-2 bg-slate-50/30">
                    <span className="text-xs font-medium text-slate-400 relative -top-3">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </span>
                  </div>
                  {Array.from({ length: 7 }).map((_, col) => (
                    <div key={col} className="border-r border-b border-slate-100 last:border-r-0 transition-colors hover:bg-slate-50/50"></div>
                  ))}
                </div>
              );
            })}
            {timedEvents.map(event => {
              const dayIndex = daysOfWeek.findIndex(d => d.toISOString().slice(0, 10) === event.event_date);
              if (dayIndex === -1) return null;
              const startMin = timeToMinutes(event.start_time);
              const endMin = timeToMinutes(event.end_time);
              const gridStartMin = START_HOUR * 60;
              const topMinutes = Math.max(0, startMin - gridStartMin);
              const durationMinutes = Math.max(15, endMin - startMin);
              const topPx = (topMinutes / 60) * HOUR_HEIGHT;
              const heightPx = (durationMinutes / 60) * HOUR_HEIGHT;
              if (endMin <= gridStartMin || startMin >= (END_HOUR + 1) * 60) return null;
              return (
                <div key={event.id} className="absolute px-1" style={{ top: `${topPx}px`, height: `${heightPx}px`, left: `${((dayIndex + 1) / 8) * 100}%`, width: `${(1 / 8) * 100}%` }}>
                  <div className={`w-full h-full rounded-md border-l-4 p-1.5 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:z-10 bg-white/90 backdrop-blur-sm ${eventTypeColors[event.event_type || 'other'] || eventTypeColors.other}`}>
                    <span className="text-[10px] font-bold opacity-75 leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
                    </span>
                    <span className="text-xs font-bold leading-tight line-clamp-2">{event.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
