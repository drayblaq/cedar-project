import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const C = { ink:"#16241a", muted:"#687a6c", green:"#2ea82a", greenWash:"#eef6ec" };
function fmtDate(iso:string){return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}

export default async function StudentAnnouncementsPage() {
  const t = await getTranslations("dashboard.student");
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements").select("id, title, body, published_at").order("published_at",{ascending:false}).limit(30);

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>{t("announcements")}</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>{t("latestUpdates")}</p>
      </div>

      {!announcements?.length ? (
        <div className="cd-card" style={{ padding:48, textAlign:"center" }}><p style={{ color:C.muted }}>{t("noAnnouncements")}</p></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {announcements.map(a => (
            <div key={a.id} className="cd-card" style={{ padding:22, display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:42, height:42, borderRadius:11, background:C.greenWash, color:C.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l15-6v14L3 13v-2z"/><path d="M3 11v2a3 3 0 0 0 3 3h1"/><path d="M11 19l-1.5 2"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>{a.title}</h3>
                {a.body && <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginTop:5 }}>{a.body}</p>}
                <div style={{ fontSize:11.5, color:C.muted, marginTop:8, opacity:.8 }}>{fmtDate(a.published_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
