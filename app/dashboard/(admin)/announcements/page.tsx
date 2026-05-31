import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, deleteAnnouncement } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary, btnDanger } from "../../ui";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="mt-1 text-sm text-slate-500">Publish center-wide updates visible to all students and parents.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Create form */}
        <div className={`${card} p-6 h-fit`}>
          <h2 className="mb-5 text-sm font-semibold text-slate-900">New announcement</h2>
          <form action={createAnnouncement as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <div>
              <label htmlFor="title" className={label}>Title *</label>
              <input id="title" name="title" type="text" required className={input} placeholder="Announcement title…" />
            </div>
            <div>
              <label htmlFor="body" className={label}>Body</label>
              <textarea id="body" name="body" rows={5} className={input} placeholder="Full announcement text…" />
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>
              📢 Publish
            </button>
          </form>
        </div>

        {/* List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Published announcements</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {announcements?.length ?? 0}
            </span>
          </div>

          {!announcements?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <span className="text-4xl">📢</span>
              <p className="mt-3 font-semibold text-slate-600">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {a.body && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">{a.body}</p>
                      )}
                    </div>
                    <form action={deleteAnnouncement.bind(null, a.id) as unknown as (fd: FormData) => Promise<void>} className="shrink-0">
                      <button type="submit" className={btnDanger}>Delete</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
