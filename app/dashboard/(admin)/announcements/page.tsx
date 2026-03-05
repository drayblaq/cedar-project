import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, deleteAnnouncement } from "@/app/dashboard/actions";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Academics</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Announcements</h1>
      <p className="mt-2 text-slate-600">Create and manage center-wide announcements.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">New announcement</h2>
          <form action={createAnnouncement as unknown as (fd: FormData) => Promise<void>} className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title *</label>
              <input id="title" name="title" type="text" required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-slate-700">Body</label>
              <textarea id="body" name="body" rows={4} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg">
              Publish
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent announcements</h2>
          {!announcements?.length ? (
            <p className="mt-4 text-slate-500">No announcements yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(a.published_at).toLocaleString()}
                      </p>
                      {a.body && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{a.body}</p>}
                    </div>
                    <form action={deleteAnnouncement.bind(null, a.id) as unknown as (fd: FormData) => Promise<void>} className="shrink-0">
                      <button type="submit" className="text-sm text-red-600 hover:underline">Delete</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
