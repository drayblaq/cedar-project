import { createClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/dashboard/actions/index";
import AttendanceForm from "./AttendanceForm";

const C = { ink:"#16241a", muted:"#687a6c" };

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

  const students = (studentsRaw ?? []).map((s: { id:string; full_name:string; levels:{name:string}|{name:string}[]|null }) => ({
    id: s.id,
    full_name: s.full_name,
    levels: Array.isArray(s.levels) ? (s.levels[0] ?? null) : s.levels,
  }));

  const { data: existing } = await supabase.from("attendance").select("student_id, status").eq("date", date);
  const byStudent = (existing ?? []).reduce((acc: Record<string,string>, r: {student_id:string;status:string}) => {
    acc[r.student_id] = r.status; return acc;
  }, {});

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Attendance</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Mark each student present or absent for the selected day.</p>
      </div>
      <AttendanceForm date={date} students={students} initialStatus={byStudent} saveAction={saveAttendance} />
    </div>
  );
}
