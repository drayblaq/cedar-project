import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function levelName(l: { name?: string } | { name?: string }[] | null): string {
  if (!l) return "—";
  const name = Array.isArray(l) ? (l[0] as { name?: string })?.name : (l as { name?: string })?.name;
  return name ?? "—";
}

function termName(t: { name?: string } | { name?: string }[] | null): string {
  if (!t) return "—";
  const name = Array.isArray(t) ? (t[0] as { name?: string })?.name : (t as { name?: string })?.name;
  return name ?? "—";
}

export default async function ParentChildPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const studentId = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: link } = await supabase
    .from("parent_students")
    .select("id")
    .eq("parent_id", user.id)
    .eq("student_id", studentId)
    .maybeSingle();
  if (!link) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, enrollment_date, levels(name)")
    .eq("id", studentId)
    .single();
  if (!student) notFound();

  const [attendanceRes, paymentsRes, gradesRes] = await Promise.all([
    supabase.from("attendance").select("date, status").eq("student_id", studentId).order("date", { ascending: false }).limit(30),
    supabase.from("payments").select("id, amount, currency, paid_at").eq("student_id", studentId).order("paid_at", { ascending: false }).limit(20),
    supabase.from("grades").select("id, subject_or_type, score, remarks, created_at, academic_terms(name)").eq("student_id", studentId).order("created_at", { ascending: false }).limit(20),
  ]);

  const att = attendanceRes.data ?? [];
  const total = att.length;
  const presentOrLate = att.filter((r) => r.status === "present" || r.status === "late").length;
  const attendancePct = total > 0 ? Math.round((presentOrLate / total) * 100) : null;

  return (
    <div className="px-4 sm:px-6">
      <Link href="/dashboard/parent" className="text-sm font-medium text-emerald-600 hover:underline">← My children</Link>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-emerald-600">Parent portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{student.full_name}</h1>
      <p className="mt-2 text-slate-600">
        Level: {levelName(student.levels)} · Enrolled: {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "—"}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Summary</h2>
        <p className="mt-2 text-slate-600">
          Attendance (recent): <strong>{attendancePct != null ? `${attendancePct}%` : "—"}</strong> · Payments: <strong>{(paymentsRes.data ?? []).length}</strong> · Grades: <strong>{(gradesRes.data ?? []).length}</strong>
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Recent payments</h2>
          {!paymentsRes.data?.length ? (
            <p className="mt-4 text-slate-500">No payments recorded.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {(paymentsRes.data ?? []).map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{new Date(p.paid_at).toLocaleDateString()}</span>
                  <span className="font-semibold text-emerald-700">{p.amount} {p.currency}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Recent grades</h2>
          {!gradesRes.data?.length ? (
            <p className="mt-4 text-slate-500">No grades recorded.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {(gradesRes.data ?? []).map((g) => (
                <li key={g.id} className="flex justify-between text-sm">
                  <span>{g.subject_or_type} ({termName(g.academic_terms)})</span>
                  <span className="font-semibold">{g.score != null ? g.score : "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Recent attendance</h2>
        {!att.length ? (
          <p className="mt-4 text-slate-500">No attendance records.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {att.map((a) => (
              <li key={a.date} className="flex justify-between text-sm">
                <span>{new Date(a.date).toLocaleDateString()}</span>
                <span className={`capitalize ${a.status === "present" ? "text-emerald-600" : a.status === "late" ? "text-amber-600" : "text-red-600"}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
