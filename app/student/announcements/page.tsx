import { createClient } from "@/lib/supabase/server";

export default async function StudentAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(30);

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Student portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Announcements</h1>
      <p className="mt-2 text-slate-600">Latest updates from Cedar Training Center.</p>

      {!announcements?.length ? (
        <p className="mt-8 text-slate-500">No announcements yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-slate-900">{a.title}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(a.published_at).toLocaleString()}</p>
              {a.body ? <p className="mt-3 text-sm text-slate-700">{a.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
