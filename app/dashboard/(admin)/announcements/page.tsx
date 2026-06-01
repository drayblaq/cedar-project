import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, deleteAnnouncement } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, published_at")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Announcements</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Broadcast to students, parents and staff.</p>
      </div>

      <div className="cd-grid-2-1">
        {/* List */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {!announcements?.length ? (
            <div className="cd-card" style={{ padding:40, textAlign:"center" }}>
              <p style={{ color:C.muted, fontSize:13.5 }}>No announcements yet.</p>
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="cd-card" style={{ padding:22, display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:42, height:42, borderRadius:11, background:C.greenWash, color:C.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l15-6v14L3 13v-2z"/><path d="M3 11v2a3 3 0 0 0 3 3h1"/><path d="M11 19l-1.5 2"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginBottom:5, alignItems:"flex-start" }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{a.title}</h3>
                  <form action={deleteAnnouncement.bind(null, a.id) as unknown as (fd: FormData) => Promise<void>} style={{ flexShrink:0 }}>
                    <button type="submit" style={{ background:"rgba(201,74,58,.1)", border:"none", borderRadius:8, padding:"5px 11px", fontSize:12, fontWeight:700, color:"#b3402f", cursor:"pointer" }}>Delete</button>
                  </form>
                </div>
                {a.body && <p style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>{a.body}</p>}
                <div style={{ fontSize:11.5, color:C.muted, marginTop:8, opacity:.8 }}>{fmtDate(a.published_at)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* New */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>New announcement</h3>
          <form action={createAnnouncement as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Title</span><input name="title" type="text" required placeholder="e.g. Term 3 placement tests" /></label>
            <label className="cd-fld"><span>Message</span><textarea name="body" rows={5} placeholder="Write your announcement…" /></label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l15-6v14L3 13v-2z"/></svg>
              Publish
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
