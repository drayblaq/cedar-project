import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: s, error } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (error || !s) notFound();

  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("id, score, max_score, time_taken_seconds, completed_at, tests(title)")
    .eq("student_id", id)
    .order("completed_at", { ascending: false });

  const rows: { label: string; value: string }[] = [
    { label: "Admission status", value: String(s.application_status ?? "—") },
    { label: "Enrollment status", value: String(s.status ?? "—") },
    { label: "First name", value: String(s.first_name ?? "—") },
    { label: "Last name", value: String(s.last_name ?? "—") },
    { label: "Email", value: String(s.email ?? "—") },
    { label: "Gender", value: String(s.gender ?? "—") },
    { label: "Date of birth", value: s.date_of_birth ? String(s.date_of_birth) : "—" },
    { label: "Nationality", value: String(s.nationality ?? "—") },
    { label: "WhatsApp", value: String(s.whatsapp ?? s.phone ?? "—") },
    { label: "Address", value: String(s.address_line ?? "—") },
    { label: "Country / city", value: `${s.country ?? "—"} / ${s.city ?? "—"}` },
    { label: "BAC year", value: String(s.bac_year ?? "—") },
    { label: "BAC series", value: String(s.bac_series ?? "—") },
    { label: "Previous school", value: String(s.previous_school ?? "—") },
    { label: "Parent WhatsApp", value: String(s.parent_whatsapp ?? "—") },
    { label: "Parent email", value: String(s.parent_email ?? "—") },
    { label: "Discovery channel", value: String(s.discovery_channel ?? "—") },
    { label: "Notes", value: String(s.notes ?? "—") },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/admin/students" className="text-sm text-slate-500 hover:text-slate-700">
          ← Students
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Application</h1>
      <p className="mt-1 text-slate-600">{s.full_name}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Registration details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-col border-b border-slate-100 pb-3 last:border-0">
                <dt className="font-medium text-slate-500">{r.label}</dt>
                <dd className="mt-1 text-slate-900">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">English placement attempts</h2>
          {!attempts?.length ? (
            <p className="mt-4 text-slate-500">No test submitted yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {attempts.map((a: { id: string; score: number; max_score: number; time_taken_seconds: number | null; completed_at: string; tests: { title?: string } | { title?: string }[] | null }) => {
                const title = Array.isArray(a.tests) ? a.tests[0]?.title : (a.tests as { title?: string })?.title;
                const pct = Math.round((Number(a.score) / (Number(a.max_score) || 1)) * 100);
                return (
                  <li key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                    <p className="font-medium text-slate-900">{title ?? "Placement test"}</p>
                    <p className="text-slate-600">
                      Score: {a.score} / {a.max_score} ({pct}%) · Time: {a.time_taken_seconds ?? "—"}s ·{" "}
                      {new Date(a.completed_at).toLocaleString()}
                    </p>
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
