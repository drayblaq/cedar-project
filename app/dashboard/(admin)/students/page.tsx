import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InviteStudentButton } from "./InviteStudentButton";
import { AdmissionActions } from "./AdmissionActions";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select(
      "id, full_name, first_name, last_name, email, phone, user_id, enrollment_date, status, application_status, levels(name)"
    )
    .order("full_name");

  const { data: paidRows } = await supabase.from("payments").select("student_id");
  const paidStudentIds = new Set((paidRows ?? []).map((p: { student_id: string }) => p.student_id));

  const studentIds = (students ?? []).map((s) => s.id);
  const bestTestPct = new Map<string, number>();
  if (studentIds.length) {
    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("student_id, score, max_score, completed_at")
      .in("student_id", studentIds)
      .order("completed_at", { ascending: false });
    for (const a of attempts ?? []) {
      if (bestTestPct.has(a.student_id)) continue;
      const max = Number(a.max_score) || 1;
      const pct = Math.round((Number(a.score) / max) * 100);
      bestTestPct.set(a.student_id, pct);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Management
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Students & applicants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review applications, set admission status, record payments, then send portal invites once the account is
            active.
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-teal-600"
        >
          Add student
        </Link>
      </div>

      {!students?.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">No students yet. Add your first student above.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700">Name</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Email</th>
                <th className="px-5 py-4 font-semibold text-slate-700">WhatsApp</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Level</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Admission</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Placement</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Login</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const hasPayment = paidStudentIds.has(s.id);
                const hasLogin = !!s.user_id;
                const canInvite = hasPayment && !hasLogin && s.status === "active";
                const displayName =
                  s.first_name && s.last_name
                    ? `${s.first_name} ${s.last_name}`
                    : s.full_name;
                const app = (s as { application_status?: string | null }).application_status ?? "submitted";
                const wa = (s as { whatsapp?: string | null }).whatsapp ?? s.phone;
                return (
                  <tr key={s.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{displayName}</td>
                    <td className="px-5 py-4 text-slate-600">{s.email}</td>
                    <td className="px-5 py-4 text-slate-600">{wa ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {Array.isArray(s.levels)
                        ? (s.levels[0] as { name?: string })?.name ?? "—"
                        : (s.levels as { name?: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 capitalize">{app.replace("_", " ")}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {bestTestPct.has(s.id) ? `${bestTestPct.get(s.id)}%` : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 capitalize">{s.status ?? "pending"}</td>
                    <td className="px-5 py-4">
                      {hasLogin ? (
                        <span className="text-slate-500 text-xs">Has login</span>
                      ) : (
                        <InviteStudentButton studentId={s.id} disabled={!canInvite} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/students/${s.id}/application`}
                          className="text-xs font-medium text-sky-600 hover:underline"
                        >
                          Application
                        </Link>
                        <Link href={`/admin/students/${s.id}/edit`} className="text-xs font-medium text-emerald-600 hover:underline">
                          Edit
                        </Link>
                        {s.status === "pending" && app !== "rejected" ? (
                          <AdmissionActions studentId={s.id} applicationStatus={app} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
