import { createClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/dashboard/actions/index";
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

  const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">{dateFormatted}</p>
      </div>
      <AttendanceForm
        date={date}
        students={students}
        initialStatus={byStudent}
        saveAction={saveAttendance}
      />
    </div>
  );
}
