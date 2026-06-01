import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18" };

function fmtXOF(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " CFA"; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

const METHOD_TONE: Record<string,{bg:string;fg:string}> = {
  momo:          { bg:"rgba(124,58,237,.12)", fg:"#6d28d9" },
  "Mobile Money":{ bg:"rgba(124,58,237,.12)", fg:"#6d28d9" },
  cash:          { bg:"rgba(46,168,42,.12)",  fg:"#1a6b18" },
  Cash:          { bg:"rgba(46,168,42,.12)",  fg:"#1a6b18" },
  bank_transfer: { bg:"rgba(63,125,140,.14)", fg:"#2f5f6b" },
};

const ICON_PATHS: Record<string,string> = {
  wallet: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  clock:  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  doc:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6",
};

function StatCard({ icon, label, value, sub, tone="green" }: { icon:string; label:string; value:React.ReactNode; sub?:string; tone?:"green"|"gold"|"blue"|"dark" }) {
  const toneColors = { green:C.green, gold:"#bf9636", blue:"#3f7d8c", dark:"#0e3b0c" };
  const d = ICON_PATHS[icon]; const paths = d?d.split(" M").map((s,i)=>i===0?s:"M"+s):[];
  return (
    <div className="cd-card" style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:11, background:C.greenWash, color:toneColors[tone], display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{paths.map((p,i)=><path key={i} d={p}/>)}</svg>
      </div>
      <div>
        <div style={{ fontSize:27, fontWeight:800, letterSpacing:"-0.02em", color:C.ink, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12.5, fontWeight:600, color:C.muted, marginTop:6 }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, color:C.muted, marginTop:3, opacity:.8 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default async function ParentPaymentsPage() {
  const t = await getTranslations("dashboard.parent");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
  const studentIds = (links ?? []).map(l => l.student_id);

  if (!studentIds.length) {
    return (
      <div>
        <h1 style={{ fontSize:23, fontWeight:800, color:C.ink, letterSpacing:"-0.02em" }}>Payment history</h1>
        <div className="cd-card" style={{ marginTop:24, padding:40, textAlign:"center" }}>
          <p style={{ color:C.muted }}>{t("noChildren")}</p>
        </div>
      </div>
    );
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, paid_at, payment_method, receipt_number, students(full_name)")
    .in("student_id", studentIds)
    .order("paid_at", { ascending:false })
    .limit(50);

  const totalPaid = (payments ?? []).reduce((s,p)=>s+Number(p.amount), 0);

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Payment history</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>All fee payments for your children.</p>
      </div>

      <div className="cd-grid-stats-3" style={{ marginBottom:18 }}>
        <StatCard icon="wallet" label="Total paid" value={fmtXOF(totalPaid)} tone="green" />
        <StatCard icon="clock"  label="Outstanding" value={fmtXOF(0)} sub="No balance" tone="gold" />
        <StatCard icon="doc"    label="Receipts" value={(payments ?? []).length} sub="available" tone="blue" />
      </div>

      <div className="cd-card" style={{ padding:0 }}>
        <div style={{ padding:"18px 22px 6px" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Transactions</h3>
        </div>
        {!(payments ?? []).length ? (
          <p style={{ padding:"40px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No payments recorded yet.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
              <thead><tr>
                {["Student","Date","Method","Amount",""].map((h,i)=>(
                  <th key={h} style={{ textAlign:i===3?"right":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(payments ?? []).map(p => {
                  const st = Array.isArray(p.students)?p.students[0]:p.students;
                  const name = (st as {full_name?:string}|null)?.full_name ?? "—";
                  const method = (p as {payment_method?:string}).payment_method ?? "momo";
                  const mt = METHOD_TONE[method] ?? { bg:"#eef2ec", fg:"#4a5a4d" };
                  const receiptNo = (p as {receipt_number?:string|null}).receipt_number ?? "PAY-"+p.id.slice(0,8).toUpperCase();
                  return (
                    <tr key={p.id} className="cd-trow">
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.ink }}>{name}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{fmtDate(p.paid_at)}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ display:"inline-flex", background:mt.bg, color:mt.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7, textTransform:"capitalize" }}>
                          {method.replace("_"," ")}
                        </span>
                      </td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right", fontWeight:700, color:C.ink }}>{fmtXOF(Number(p.amount))}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}` }}>
                        <a href={`/admin/payments/${p.id}/receipt`} target="_blank" rel="noopener noreferrer"
                          className="cd-mini-btn" style={{ textDecoration:"none" }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3"/></svg>
                          Receipt
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
