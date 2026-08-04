import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createGrade } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

function scoreColor(s: number | null) {
  if (s == null) return C.muted;
  if (s >= 85) return "#1a8a2a";
  if (s >= 70) return "#9a7822";
  return "#b3402f";
}

export default async function StaffGradesPage() {
  const t = await getTranslations("dashboard.staff");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get staff's assigned classes
  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row) => {
    const c = row.classes as unknown as { id:string; name:string; level_id:string; levels:{name?:string}|{name?:string}[]|null } | null;
    const levelName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as {name?:string}).name);
    return c?.id ? { id:c.id, name:c.name, levelId:c.level_id, levelName: levelName ?? "" } : null;
  }).filter(Boolean) as { id:string; name:string; levelId:string; levelName:string }[];

  // Get students from those classes
  const levelIds = [...new Set(classList.map(c => c.levelId))];
  const students = levelIds.length ? (await supabase.from("students").select("id, full_name, levels(name)").in("level_id", levelIds).order("full_name")).data ?? [] : [];

  const studentIds = students.map(s => s.id);
  const { data: grades } = studentIds.length ? await supabase
    .from("grades")
    .select("id, subject_or_type, score, remarks, students(full_name), academic_terms(name)")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })
    .limit(50) : { data: [] };

  const { data: terms } = await supabase.from("academic_terms").select("id, name").order("start_date", { ascending: false });

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Grades &amp; feedback</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Record scores for your classes.</p>
      </div>

      <div className="cd-grid-2-1">
        {/* Roster + grades */}
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}><h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Recent grades</h3></div>
          {!grades?.length ? (
            <p style={{ padding:"40px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No grades recorded yet.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr>
                  {["Student","Skill","Score","Remark"].map((h,i)=>(
                    <th key={h} style={{ textAlign:i===2?"center":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(grades ?? []).map((g) => {
                    const st = Array.isArray(g.students)?g.students[0]:g.students;
                    return (
                      <tr key={g.id} className="cd-trow">
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink }}>
                          {(st as {full_name?:string})?.full_name ?? "-"}
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, textTransform:"capitalize" }}>{g.subject_or_type}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"center", fontWeight:800, color:scoreColor(g.score!=null?Number(g.score):null) }}>{g.score ?? "-"}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, fontSize:12.5 }}>{g.remarks ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick grade entry */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Quick grade entry</h3>
          <form action={createGrade as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Student</span>
              <select name="student_id" required defaultValue="">
                <option value="" disabled>Select student…</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </label>
            <label className="cd-fld"><span>Term</span>
              <select name="academic_term_id" defaultValue="">
                <option value="">- None -</option>
                {(terms ?? []).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <label className="cd-fld"><span>Skill</span>
                <select name="subject_or_type" defaultValue="general">
                  <option value="speaking">Speaking</option>
                  <option value="writing">Writing</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="general">General</option>
                </select>
              </label>
              <label className="cd-fld"><span>Score / 100</span>
                <input name="score" type="number" min="0" max="100" step="0.01" placeholder="80" />
              </label>
            </div>
            <label className="cd-fld"><span>Comment</span>
              <textarea name="remarks" rows={3} placeholder="Feedback for the student…" />
            </label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Save grade</button>
          </form>
        </div>
      </div>
    </div>
  );
}
