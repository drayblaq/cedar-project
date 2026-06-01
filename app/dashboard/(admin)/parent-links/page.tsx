import { createClient } from "@/lib/supabase/server";
import { linkParentToStudent, unlinkParentFromStudent } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };
const AVATAR = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function aColor(n:string){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return AVATAR[h%AVATAR.length];}
function ini(n:string){return n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();}

export default async function ParentLinksPage() {
  const supabase = await createClient();
  const { data: parentRole } = await supabase.from("roles").select("id").eq("name", "parent").single();
  const { data: parents } = await supabase.from("profiles").select("id, full_name").eq("role_id", parentRole?.id ?? "").order("full_name");
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: links } = await supabase.from("parent_students").select("id, parent_id, student_id").order("id");

  const parentIds = [...new Set((links ?? []).map(l => l.parent_id))];
  const studentIds = [...new Set((links ?? []).map(l => l.student_id))];
  const { data: parentProfiles } = await supabase.from("profiles").select("id, full_name").in("id", parentIds.length?parentIds:["_"]);
  const { data: studentRows } = await supabase.from("students").select("id, full_name").in("id", studentIds.length?studentIds:["_"]);
  const pNames: Record<string,string> = {}; (parentProfiles ?? []).forEach(p => { pNames[p.id] = p.full_name ?? p.id.slice(0,8); });
  const sNames: Record<string,string> = {}; (studentRows ?? []).forEach(s => { sNames[s.id] = s.full_name; });

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Parent links</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Connect parent accounts to their children for portal access.</p>
      </div>

      <div className="cd-grid-2-1">
        {/* Current links */}
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}><h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Current links</h3></div>
          {!links?.length ? (
            <p style={{ padding:"40px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No parent–student links yet. Add one with the form.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column" }}>
              {links.map((l, i) => (
                <div key={l.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 22px", borderBottom: i<links.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background:aColor(pNames[l.parent_id]??"?"), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11.5 }}>{ini(pNames[l.parent_id]??"?")}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, color:C.ink }}>
                      <strong>{pNames[l.parent_id] ?? "—"}</strong>
                      <span style={{ color:C.muted, margin:"0 8px" }}>→</span>
                      {sNames[l.student_id] ?? "—"}
                    </div>
                  </div>
                  <form action={unlinkParentFromStudent.bind(null, l.id) as unknown as (fd: FormData) => Promise<void>}>
                    <button type="submit" style={{ background:"rgba(201,74,58,.1)", border:"none", borderRadius:8, padding:"5px 11px", fontSize:12, fontWeight:700, color:"#b3402f", cursor:"pointer" }}>Remove</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link form */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Link parent to student</h3>
          <form action={linkParentToStudent as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Parent</span>
              <select name="parent_id" required defaultValue=""><option value="" disabled>Select parent…</option>{(parents ?? []).map(p=><option key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0,8)}</option>)}</select>
            </label>
            <label className="cd-fld"><span>Student</span>
              <select name="student_id" required defaultValue=""><option value="" disabled>Select student…</option>{(students ?? []).map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
            </label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Add link</button>
          </form>
        </div>
      </div>
    </div>
  );
}
