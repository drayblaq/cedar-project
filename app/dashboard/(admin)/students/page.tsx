import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InviteStudentButton } from "./InviteStudentButton";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, email, phone, user_id, enrollment_date, levels(name)")
    .order("full_name");

  const { data: paidRows } = await supabase.from("payments").select("student_id");
  const paidStudentIds = new Set((paidRows ?? []).map((p: { student_id: string }) => p.student_id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Management
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Students
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Send a login invite (to their email) only after the student has paid. They use that email to sign in.
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-teal-600"
        >
          Add student
        </Link>
      </div>

      {!students?.length ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
          <p className="text-slate-500">
            No students yet. Add your first student above.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700">Name</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Email</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Phone</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Level</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Enrolled</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Login</th>
                <th className="px-5 py-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const hasPayment = paidStudentIds.has(s.id);
                const hasLogin = !!s.user_id;
                const canInvite = hasPayment && !hasLogin;
                return (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {s.full_name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.email}</td>
                  <td className="px-5 py-4 text-slate-600">{s.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {Array.isArray(s.levels) ? (s.levels[0] as { name?: string })?.name ?? "—" : (s.levels as { name?: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {s.enrollment_date
                      ? new Date(s.enrollment_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {hasLogin ? (
                      <span className="text-slate-500 text-xs">Has login</span>
                    ) : (
                      <InviteStudentButton studentId={s.id} disabled={!canInvite} />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/students/${s.id}/edit`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Edit
                    </Link>
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
