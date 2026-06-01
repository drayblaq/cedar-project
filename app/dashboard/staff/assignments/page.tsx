import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAssignment } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default async function StaffAssignmentsPage() {
  const t = await getTranslations("dashboard.staff");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row) => {
    const c = row.classes as unknown as { id:string; name:string; level_id:string; levels:{name?:string}|{name?:string}[]|null } | null;
    const levelName = c?.levels && (Array.isArray(c.levels) ? c.levels[0]?.name : (c.levels as {name?:string}).name);
    return c?.id ? { id:c.id, name:c.name, levelId:c.level_id, levelName: levelName ?? "" } : null;
  }).filter(Boolean) as { id:string; name:string; levelId:string; levelName:string }[];

  const taughtClasses = new Set(classList.map(c => c.id));
  const taughtLevels = new Set(classList.map(c => c.levelId));

  const { data: allAssignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, level_id, class_id, description, levels(name), classes(name)")
    .order("due_date", { ascending: false })
    .limit(30);

  const assignments = (allAssignments ?? []).filter(a => {
    const cid = (a as {class_id?:string|null}).class_id;
    const lid = (a as {level_id?:string|null}).level_id;
    return (cid && taughtClasses.has(cid)) || (lid && taughtLevels.has(lid));
  });

  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18, gap:16, flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Assignments</h1>
          <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Set tasks and track submissions for your classes.</p>
        </div>
      </div>

      <div className="cd-grid-2-1">
        {/* Assignment list */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {!assignments.length ? (
            <div className="cd-card" style={{ padding:48, textAlign:"center" }}>
              <p style={{ color:C.muted, fontSize:13.5 }}>No assignments yet for your classes.</p>
            </div>
          ) : assignments.map((a) => {
            const lvl = Array.isArray(a.levels)?a.levels[0]:a.levels;
            const cls = Array.isArray(a.classes)?a.classes[0]:a.classes;
            return (
              <div key={a.id} className="cd-card" style={{ padding:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:42, height:42, borderRadius:11, background:C.greenWash, color:C.green,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6 M9 13h6 M9 17h6"/>
                  </svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:700, color:C.ink }}>{a.title}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                    {(cls as {name?:string})?.name ?? (lvl as {name?:string})?.name ?? "All classes"}
                    {(a as {due_date?:string|null}).due_date ? ` · due ${fmtDate((a as {due_date:string}).due_date)}` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* New assignment form */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>New assignment</h3>
          <form action={createAssignment as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Title</span>
              <input name="title" type="text" required placeholder="e.g. Essay — My future career" />
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <label className="cd-fld"><span>Due date</span>
                <input name="due_date" type="date" />
              </label>
              <label className="cd-fld"><span>Class</span>
                <select name="class_id" defaultValue="">
                  <option value="">All my classes</option>
                  {classList.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label className="cd-fld"><span>Level</span>
              <select name="level_id" defaultValue="">
                <option value="">Any</option>
                {(levels ?? []).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </label>
            <label className="cd-fld"><span>Description</span>
              <textarea name="description" rows={3} placeholder="Instructions for students…" />
            </label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14 M5 12h14"/></svg>
              Create assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
