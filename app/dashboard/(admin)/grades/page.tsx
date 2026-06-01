import { createClient } from "@/lib/supabase/server";
import { createGrade, deleteGrade } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

function scoreColor(s: number | null) {
  if (s == null) return C.muted;
  if (s >= 85) return "#1a8a2a";
  if (s >= 70) return "#9a7822";
  return "#b3402f";
}

export default async function GradesPage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: terms } = await supabase.from("academic_terms").select("id, name").order("start_date", { ascending: false });
  const { data: grades } = await supabase
    .from("grades")
    .select("id, subject_or_type, score, remarks, students(full_name), academic_terms(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Grades &amp; remarks</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Record scores and feedback by skill and term.</p>
      </div>

      <div className="cd-grid-2-1">
        {/* Recent grades */}
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}><h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Recent grades</h3></div>
          {!grades?.length ? (
            <p style={{ padding:"40px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No grades yet. Add one with the form.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr>
                  {["Student","Skill","Term","Score","Remark",""].map((h,i)=>(
                    <th key={h} style={{ textAlign:i===3?"center":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {grades.map((g: { id:string; subject_or_type:string; score:number|null; remarks:string|null; students:{full_name:string}|{full_name:string}[]|null; academic_terms:{name:string}|{name:string}[]|null }) => {
                    const st = Array.isArray(g.students)?g.students[0]:g.students;
                    const tm = Array.isArray(g.academic_terms)?g.academic_terms[0]:g.academic_terms;
                    return (
                      <tr key={g.id} className="cd-trow">
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink }}>{(st as {full_name?:string})?.full_name ?? "—"}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, textTransform:"capitalize" }}>{g.subject_or_type}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{(tm as {name?:string})?.name ?? "—"}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"center", fontWeight:800, color:scoreColor(g.score!=null?Number(g.score):null) }}>{g.score ?? "—"}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, fontSize:12.5 }}>{g.remarks ?? "—"}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                          <form action={deleteGrade.bind(null, g.id) as unknown as (fd: FormData) => Promise<void>} style={{ display:"inline" }}>
                            <button type="submit" style={{ background:"rgba(201,74,58,.1)", border:"none", borderRadius:8, padding:"5px 11px", fontSize:12, fontWeight:700, color:"#b3402f", cursor:"pointer" }}>Delete</button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add grade */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Add a grade</h3>
          <form action={createGrade as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Student</span>
              <select name="student_id" required defaultValue=""><option value="" disabled>Select student…</option>{(students ?? []).map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
            </label>
            <label className="cd-fld"><span>Term</span>
              <select name="academic_term_id" defaultValue=""><option value="">— None —</option>{(terms ?? []).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <label className="cd-fld"><span>Skill / type</span><input name="subject_or_type" type="text" defaultValue="general" /></label>
              <label className="cd-fld"><span>Score / 100</span><input name="score" type="number" min="0" max="100" step="0.01" placeholder="84" /></label>
            </div>
            <label className="cd-fld"><span>Remark</span><textarea name="remarks" rows={3} placeholder="Confident speaker, expand academic vocabulary…" /></label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Save grade</button>
          </form>
        </div>
      </div>
    </div>
  );
}
