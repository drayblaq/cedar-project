import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ParentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return null;
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "parent") return null;

  const { data: links } = await supabase
    .from("parent_students")
    .select("id, student_id")
    .eq("parent_id", user.id);
  const studentIds = (links ?? []).map((l) => l.student_id);
  if (studentIds.length === 0) {
    return (
      <div className="px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Parent portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My children</h1>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-700">
          No students are linked to your account yet. Please ask the center to link your child/children to your parent account. You will then see their progress, attendance, and payments here.
        </p>
      </div>
    );
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, levels(name)")
    .in("id", studentIds);

  const levelName = (l: { name?: string } | { name?: string }[] | null) => {
    if (!l) return "—";
    const name = Array.isArray(l) ? (l[0] as { name?: string })?.name : (l as { name?: string })?.name;
    return name ?? "—";
  };

  const summaries: { id: string; full_name: string; level: string; attendancePct: number | null; paymentsCount: number; gradesCount: number }[] = [];
  for (const s of students ?? []) {
    const { data: att } = await supabase.from("attendance").select("status").eq("student_id", s.id);
    const total = att?.length ?? 0;
    const presentOrLate = att?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
    const attendancePct = total > 0 ? Math.round((presentOrLate / total) * 100) : null;
    const { count: paymentsCount } = await supabase.from("payments").select("id", { count: "exact", head: true }).eq("student_id", s.id);
    const { count: gradesCount } = await supabase.from("grades").select("id", { count: "exact", head: true }).eq("student_id", s.id);
    summaries.push({
      id: s.id,
      full_name: s.full_name,
      level: levelName(s.levels),
      attendancePct: attendancePct ?? null,
      paymentsCount: paymentsCount ?? 0,
      gradesCount: gradesCount ?? 0,
    });
  }

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Parent portal</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">My children</h1>
      <p className="mt-2 text-slate-600">Progress, attendance, and payments for your linked students.</p>

      <div className="mt-8 space-y-6">
        {summaries.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/parent/child/${s.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-emerald-200 hover:shadow-emerald-100"
          >
            <h2 className="text-lg font-bold text-slate-900">{s.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">Level: {s.level}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="text-slate-600">Attendance: <strong>{s.attendancePct != null ? `${s.attendancePct}%` : "—"}</strong></span>
              <span className="text-slate-600">Payments: <strong>{s.paymentsCount}</strong></span>
              <span className="text-slate-600">Grades: <strong>{s.gradesCount}</strong></span>
            </div>
            <p className="mt-2 text-emerald-600 text-sm font-medium">View details →</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Announcements</h2>
        <p className="mt-2 text-slate-600">Center-wide updates.</p>
        <Link href="/dashboard/parent/announcements" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
          View announcements →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">Contact the center</h2>
        <p className="mt-2 text-slate-600">Questions about your child&apos;s progress or payments?</p>
        <Link href="/contact" className="mt-3 inline-block rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Go to Contact page
        </Link>
      </div>
    </div>
  );
}
