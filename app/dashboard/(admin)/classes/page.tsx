import { createClient } from "@/lib/supabase/server";
import { createClass, assignStaffToClass, createAssignment, createMaterial, deleteMaterial } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

function LevelPill({ level }: { level: string }) {
  const order: Record<string,number> = { A1:0,A2:1,B1:2,B2:3,C1:4,C2:5,Beginner:0,Elementary:1,"Pre-Intermediate":2,Intermediate:3,"Upper-Intermediate":4,Advanced:5 };
  const hue = 95 + (order[level] ?? 0) * 6;
  return <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:30, height:22, padding:"0 8px", borderRadius:6, fontSize:11.5, fontWeight:800, background:`oklch(0.93 0.06 ${hue})`, color:`oklch(0.40 0.10 ${hue})` }}>{level}</span>;
}

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const { data: classes } = await supabase.from("classes").select("id, name, level_id, levels(name)").order("name");
  const { data: staffRole } = await supabase.from("roles").select("id").eq("name", "staff").single();
  const { data: staffList } = staffRole ? await supabase.from("profiles").select("id, full_name").eq("role_id", staffRole.id) : { data: [] };
  const staff = staffList ?? [];
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, level_id, class_id, levels(name), classes(name)")
    .order("due_date", { ascending: false })
    .limit(20);

  const classIds = (classes ?? []).map((c: { id: string }) => c.id);
  const { data: materials } = classIds.length
    ? await supabase.from("materials").select("*").in("class_id", classIds).order("created_at", { ascending: false })
    : { data: [] };

  const materialsByClass: Record<string, { id: string; title: string; material_type: string; url: string | null }[]> = {};
  for (const m of materials ?? []) {
    const mat = m as { id: string; title: string; material_type: string; url: string | null; class_id: string };
    if (!materialsByClass[mat.class_id]) materialsByClass[mat.class_id] = [];
    materialsByClass[mat.class_id]!.push(mat);
  }

  const TYPE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
    pdf:      { bg: "#fef2f2", fg: "#b91c1c", label: "PDF" },
    link:     { bg: "#eff6ff", fg: "#1d4ed8", label: "Link" },
    video:    { bg: "#f5f3ff", fg: "#7c3aed", label: "Video" },
    document: { bg: "#f9fafb", fg: "#374151", label: "Document" },
    other:    { bg: "#f8fafc", fg: "#475569", label: "Other" },
  };

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Classes</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Groups, schedules and staff assignments.</p>
      </div>

      {/* Class cards */}
      {!classes?.length ? (
        <div className="cd-card" style={{ padding:48, textAlign:"center", marginBottom:24 }}>
          <p style={{ color:C.muted, fontSize:14 }}>No classes yet. Create your first class below.</p>
        </div>
      ) : (
        <div className="cd-grid-cards" style={{ marginBottom:24 }}>
          {classes.map((cl: {id:string; name:string; level_id:string; levels:{name:string}|{name:string}[]|null}) => {
            const lvl = Array.isArray(cl.levels)?cl.levels[0]?.name:(cl.levels as {name?:string})?.name;
            return (
              <div key={cl.id} className="cd-card" style={{ padding:22 }}>
                <div style={{ marginBottom:12 }}><LevelPill level={lvl ?? "—"} /></div>
                <h3 style={{ fontSize:16, fontWeight:700, color:C.ink, lineHeight:1.3, marginBottom:16 }}>{cl.name}</h3>

                {/* Materials section */}
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
                  <p style={{ fontSize:11.5, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Materials</p>
                  {(materialsByClass[cl.id] ?? []).length === 0 ? (
                    <p style={{ fontSize:12.5, color:C.muted, marginBottom:10 }}>No materials yet.</p>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                      {(materialsByClass[cl.id] ?? []).map(m => {
                        const s = TYPE_STYLE[m.material_type] ?? TYPE_STYLE.other;
                        return (
                          <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"space-between" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
                              <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:6, background:s.bg, color:s.fg, flexShrink:0 }}>{s.label}</span>
                              <span style={{ fontSize:12.5, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</span>
                            </div>
                            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                              {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="cd-mini-btn" style={{ textDecoration:"none", fontSize:11.5 }}>Open</a>}
                              <form action={deleteMaterial.bind(null, m.id) as unknown as (fd: FormData) => Promise<void>} style={{ display:"inline" }}>
                                <button type="submit" style={{ background:"rgba(201,74,58,.1)", border:"none", borderRadius:6, padding:"4px 9px", fontSize:11.5, fontWeight:700, color:"#b3402f", cursor:"pointer" }}>Del</button>
                              </form>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Quick add */}
                  <form action={createMaterial as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <input type="hidden" name="class_id" value={cl.id} />
                    <input name="title" type="text" required placeholder="Material title…" className="cd-fld" style={{ background:C.greenWash, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"7px 11px", fontSize:12.5, color:C.ink, outline:"none", fontFamily:"inherit" }} />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <select name="material_type" defaultValue="link" style={{ background:C.greenWash, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"7px 11px", fontSize:12.5, color:C.ink, outline:"none", fontFamily:"inherit" }}>
                        <option value="pdf">PDF</option>
                        <option value="link">Link</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="other">Other</option>
                      </select>
                      <input name="url" type="url" placeholder="https://…" style={{ background:C.greenWash, border:`1.5px solid ${C.border}`, borderRadius:8, padding:"7px 11px", fontSize:12.5, color:C.ink, outline:"none", fontFamily:"inherit" }} />
                    </div>
                    <button type="submit" className="cd-mini-btn" style={{ width:"100%", justifyContent:"center" }}>+ Add</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forms */}
      <div className="cd-grid-2-1">
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div className="cd-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Create class</h3>
            <form action={createClass as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <label className="cd-fld"><span>Class name</span><input name="name" type="text" required placeholder="e.g. General English — B1 Morning" /></label>
              <label className="cd-fld"><span>Level</span>
                <select name="level_id" required defaultValue=""><option value="" disabled>Select…</option>{(levels ?? []).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
              </label>
              <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Create class</button>
            </form>
          </div>

          <div className="cd-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Assign staff to class</h3>
            <form action={assignStaffToClass as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <label className="cd-fld"><span>Staff</span>
                <select name="profile_id" required defaultValue=""><option value="" disabled>Select staff…</option>{staff.map((s:{id:string;full_name:string|null})=><option key={s.id} value={s.id}>{s.full_name || s.id.slice(0,8)}</option>)}</select>
              </label>
              <label className="cd-fld"><span>Class</span>
                <select name="class_id" required defaultValue=""><option value="" disabled>Select class…</option>{(classes ?? []).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </label>
              <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Assign</button>
            </form>
          </div>

          <div className="cd-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Add assignment</h3>
            <form action={createAssignment as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <label className="cd-fld"><span>Title</span><input name="title" type="text" required /></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <label className="cd-fld"><span>Due date</span><input name="due_date" type="date" /></label>
                <label className="cd-fld"><span>Level</span>
                  <select name="level_id" defaultValue=""><option value="">Any</option>{(levels ?? []).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
                </label>
              </div>
              <label className="cd-fld"><span>Description</span><textarea name="description" rows={2} /></label>
              <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Add assignment</button>
            </form>
          </div>
        </div>

        {/* Recent assignments */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Recent assignments</h3>
          {!assignments?.length ? <p style={{ color:C.muted, fontSize:13 }}>No assignments yet.</p> : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {assignments.map((a) => {
                const lvl = Array.isArray(a.levels)?a.levels[0]:a.levels;
                const cls = Array.isArray(a.classes)?a.classes[0]:a.classes;
                return (
                  <div key={a.id} style={{ paddingBottom:12, borderBottom:`1px solid ${C.border}`, display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:C.greenWash, color:C.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{a.title}</div>
                      <div style={{ fontSize:11.5, color:C.muted, marginTop:2 }}>
                        {a.due_date ? "Due " + fmtDate(a.due_date) : "No due date"}
                        {(lvl as {name?:string})?.name ? ` · ${(lvl as {name:string}).name}` : ""}
                        {(cls as {name?:string})?.name ? ` · ${(cls as {name:string}).name}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
