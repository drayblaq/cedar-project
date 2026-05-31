import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudentsTableClient } from "./StudentsTableClient";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, first_name, last_name, email, phone, user_id, enrollment_date, status, application_status, last_invite_sent_at, levels(name)")
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
      bestTestPct[a.student_id] = Math.round((Number(a.score) / (Number(a.max_score) || 1)) * 100);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students & Applicants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review applications, track admission status, and manage portal access.
          </p>
        </div>
        <Link href="/admin/students/new"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add student
        </Link>
      </div>

      {!students?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <span className="text-5xl">👥</span>
          <p className="mt-4 text-lg font-semibold text-slate-700">No students yet</p>
          <p className="mt-1 text-sm text-slate-400">Add your first student to get started.</p>
          <Link href="/admin/students/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm">
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
