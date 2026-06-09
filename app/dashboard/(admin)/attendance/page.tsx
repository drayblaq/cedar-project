import { createClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/dashboard/actions/index";
import AttendanceForm from "./AttendanceForm";

const C = { ink:"#16241a", muted:"#687a6c" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; class?: string }>;
}) {
  const { date: dateParam, class: classParam } = await searchParams;
  const date = dateParam || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name").order("name");

  let query = supabase.from("students").select("id, full_name, class_id, levels(name), classes(name)").order("full_name");
  if (classParam) query = query.eq("class_id", classParam);

  const { data: studentsRaw } = await query;

  const students = (studentsRaw ?? []).map((s: { id:string; full_name:string; class_id:string|null; levels:{name:string}|{name:string}[]|null; classes:{name:string}|{name:string}[]|null }) => ({
    id: s.id,
    full_name: s.full_name,
    levels: Array.isArray(s.levels) ? (s.levels[0] ?? null) : s.levels,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
  }));

  const { data: existing } = await supabase.from("attendance").select("student_id, status").eq("date", date);
  const byStudent = (existing ?? []).reduce((acc: Record<string,string>, r: {student_id:string;status:string}) => {
    acc[r.student_id] = r.status; return acc;
  }, {});

  const selectedClass = (classes ?? []).find(c => c.id === classParam);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Attendance</h1>
          <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>
            {selectedClass ? `${selectedClass.name} · ` : "All classes · "}
            Mark each student present or absent for the selected day.
          </p>
        </div>
        <form style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="hidden" name="date" value={date} />
          <select name="class" defaultValue={classParam ?? ""} onChange={undefined}
            style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:13, color:C.ink, fontFamily:"inherit", cursor:"pointer" }}>
            <option value="">All classes</option>
            {(classes ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" style={{ background:"#eef6ec", border:"1px solid #d3ead0", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, color:C.ink, cursor:"pointer", fontFamily:"inherit" }}>Filter</button>
        </form>
      </div>
      <AttendanceForm date={date} students={students} initialStatus={byStudent} saveAction={saveAttendance} />
    </div>
  );
}
