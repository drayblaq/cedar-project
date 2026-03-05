import { createClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/dashboard/actions";
import AttendanceForm from "./AttendanceForm";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const { data: studentsRaw } = await supabase
    .from("students")
    .select("id, full_name, levels(name)")
    .order("full_name");

  const students = (studentsRaw ?? []).map((s: { id: string; full_name: string; levels: { name: string } | { name: string }[] | null }) => ({
    id: s.id,
    full_name: s.full_name,
    levels: Array.isArray(s.levels) ? (s.levels[0] ?? null) : s.levels,
  }));

  const { data: existing } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("date", date);

  const byStudent = (existing ?? []).reduce(
    (acc: Record<string, string>, r: { student_id: string; status: string }) => {
      acc[r.student_id] = r.status;
      return acc;
    },
    {}
  );

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Daily
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Attendance
      </h1>
      <p className="mt-2 text-slate-600">
        Mark present, absent, or late for a given date.
      </p>

      <AttendanceForm
        date={date}
        students={students}
        initialStatus={byStudent}
        saveAction={saveAttendance}
      />
    </div>
  );
}
