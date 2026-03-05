import { createClient } from "@/lib/supabase/server";

export default async function ParentAnnouncementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return null;
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "parent") return null;

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Parent portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Announcements</h1>
      <p className="mt-2 text-slate-600">Center-wide announcements and updates.</p>

      {!announcements?.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">No announcements yet.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="font-semibold text-slate-900">{a.title}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(a.published_at).toLocaleString()}</p>
              {a.body && <p className="mt-3 text-slate-600 whitespace-pre-wrap">{a.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
