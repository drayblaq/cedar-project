import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudentsTableClient } from "./StudentsTableClient";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select(
      "id, full_name, first_name, last_name, email, phone, user_id, enrollment_date, status, application_status, last_invite_sent_at, levels(name)"
    )
    .order("full_name");

  const { data: paidRows } = await supabase.from("payments").select("student_id");
  const paidStudentIds = (paidRows ?? []).map((p: { student_id: string }) => p.student_id);

  const studentIds = (students ?? []).map((s) => s.id);
  const bestTestPct: Record<string, number> = {};
  if (studentIds.length) {
    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("student_id, score, max_score, completed_at")
      .in("student_id", studentIds)
      .order("completed_at", { ascending: false });
    for (const a of attempts ?? []) {
      if (bestTestPct[a.student_id] != null) continue;
      const max = Number(a.max_score) || 1;
      bestTestPct[a.student_id] = Math.round((Number(a.score) / max) * 100);
    }
  }

  return (
    <div className="px-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Management</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Students & applicants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review applications, set admission status, record payments, then send portal invites.
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-700"
        >
          + Add student
        </Link>
      </div>

      {!students?.length ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <span className="text-5xl">👥</span>
          <p className="mt-4 text-lg font-semibold text-slate-700">No students yet</p>
          <p className="mt-1 text-sm text-slate-400">Add your first student to get started.</p>
          <Link
            href="/admin/students/new"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
          >
            Add first student →
          </Link>
        </div>
      ) : (
        <StudentsTableClient
          students={students as Parameters<typeof StudentsTableClient>[0]["students"]}
          bestTestPct={bestTestPct}
          paidStudentIds={paidStudentIds}
        />
      )}
    </div>
  );
}
