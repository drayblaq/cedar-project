import { createClient } from "@/lib/supabase/server";
import { createAcademicTerm, createCalendarEvent, deleteCalendarEvent } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec" };

const TYPE_COLOR: Record<string,string> = { exam:"#3f7d8c", holiday:"#b3402f", deadline:"#d4a843", other:"#2ea82a" };
const TYPE_TONE: Record<string,{bg:string;fg:string}> = {
  exam:{bg:"rgba(63,125,140,.14)",fg:"#2f5f6b"}, holiday:{bg:"rgba(201,74,58,.12)",fg:"#b3402f"},
  deadline:{bg:"rgba(212,168,67,.16)",fg:"#9a7822"}, other:{bg:"rgba(46,168,42,.12)",fg:"#1a6b18"},
};

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: terms } = await supabase.from("academic_terms").select("id, name, start_date, end_date").order("start_date", { ascending: false });
  const { data: events } = await supabase.from("calendar_events").select("id, title, description, event_date, event_type").order("event_date", { ascending: false }).limit(30);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Academic calendar</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Manage academic terms and calendar events.</p>
      </div>

      <div className="cd-grid-2-1">
        {/* LEFT — Events (main, 2/3 width) */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div className="cd-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Upcoming events</h3>
            {!events?.length ? <p style={{ color:C.muted, fontSize:13 }}>No events yet.</p> : (
              <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
                {events.map((e: {id:string; title:string; event_date:string; event_type:string}) => {
                  const tn = TYPE_TONE[e.event_type] ?? TYPE_TONE.other;
                  const dd = e.event_date.split("-")[2];
                  const mon = new Date(e.event_date).toLocaleDateString("en-GB",{month:"short"});
                  return (
                    <div key={e.id} style={{ display:"flex", gap:13, alignItems:"center" }}>
                      <div style={{ width:46, textAlign:"center", flexShrink:0 }}>
                        <div style={{ fontSize:18, fontWeight:800, color:C.ink, lineHeight:1 }}>{dd}</div>
                        <div style={{ fontSize:10.5, fontWeight:700, color:C.muted, textTransform:"uppercase" }}>{mon}</div>
                      </div>
                      <div style={{ width:3, alignSelf:"stretch", borderRadius:3, background:TYPE_COLOR[e.event_type] ?? TYPE_COLOR.other }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{e.title}</div>
                        <span style={{ display:"inline-flex", marginTop:4, background:tn.bg, color:tn.fg, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:7, textTransform:"capitalize" }}>{e.event_type}</span>
                      </div>
                      <form action={deleteCalendarEvent.bind(null, e.id) as unknown as (fd: FormData) => Promise<void>}>
                        <button type="submit" style={{ background:"none", border:"none", color:"#b3402f", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="cd-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Academic terms</h3>
            {!terms?.length ? <p style={{ color:C.muted, fontSize:13 }}>No terms yet.</p> : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {terms.map((t: {id:string; name:string; start_date:string; end_date:string}) => (
                  <div key={t.id} style={{ paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:C.ink }}>{t.name}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{fmtDate(t.start_date)} – {fmtDate(t.end_date)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Forms (secondary, 1/3 width) */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="cd-card" style={{ padding:18 }}>
            <h3 style={{ fontSize:13.5, fontWeight:700, color:C.ink, marginBottom:14 }}>+ New event</h3>
            <form action={createCalendarEvent as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <label className="cd-fld"><span>Title</span><input name="title" type="text" required placeholder="e.g. IELTS mock exam" /></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <label className="cd-fld"><span>Date</span><input name="event_date" type="date" required /></label>
                <label className="cd-fld"><span>Type</span>
                  <select name="event_type" defaultValue="other"><option value="other">Other</option><option value="holiday">Holiday</option><option value="exam">Exam</option><option value="deadline">Deadline</option></select>
                </label>
              </div>
              <label className="cd-fld"><span>Description</span><textarea name="description" rows={2} /></label>
              <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Add event</button>
            </form>
          </div>
          <div className="cd-card" style={{ padding:18 }}>
            <h3 style={{ fontSize:13.5, fontWeight:700, color:C.ink, marginBottom:14 }}>+ New academic term</h3>
            <form action={createAcademicTerm as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <label className="cd-fld"><span>Name</span><input name="name" type="text" required placeholder="e.g. Term 1 2026" /></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <label className="cd-fld"><span>Start date</span><input name="start_date" type="date" required /></label>
                <label className="cd-fld"><span>End date</span><input name="end_date" type="date" required /></label>
              </div>
              <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Add term</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
