import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };

function termName(t: { name?: string } | { name?: string }[] | null): string {
  if (!t) return "—";
  return Array.isArray(t) ? (t[0] as {name?:string})?.name ?? "—" : (t as {name?:string})?.name ?? "—";
}
function scoreColor(s: number|null) { if (s==null) return C.muted; if (s>=85) return "#1a8a2a"; if (s>=70) return "#9a7822"; return "#b3402f"; }

export default async function StudentGradesPage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div style={{ padding:"30px 30px 60px" }}>
        <h1 style={{ fontSize:23, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>{t("myGrades")}</h1>
        <p style={{ marginTop:8, fontSize:14, color:C.muted }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: grades } = await supabase
    .from("grades").select("id, subject_or_type, score, remarks, created_at, academic_terms(name)")
    .eq("student_id", result.student.id).order("created_at",{ascending:false});

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("myGrades")}</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{result.student.full_name} · {tc("level")}: {levelName(result.student.levels)}</p>
      </div>

      {!grades?.length ? (
        <div className="cd-card" style={{ padding:48, textAlign:"center" }}><p style={{ color:C.muted }}>{t("noGrades")}</p></div>
      ) : (
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}><h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Grade history</h3></div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr>
                {[t("subjectType"),t("term"),tc("score"),t("remarks"),tc("date")].map((h,i)=>(
                  <th key={i} style={{ textAlign:i===2?"center":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {grades.map(g => (
                  <tr key={g.id} className="cd-trow">
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink, textTransform:"capitalize" }}>{g.subject_or_type}</td>
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{termName(g.academic_terms)}</td>
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"center", fontWeight:800, color:scoreColor(g.score!=null?Number(g.score):null) }}>{g.score ?? "—"}</td>
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, fontSize:12.5 }}>{g.remarks ?? "—"}</td>
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{new Date(g.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
