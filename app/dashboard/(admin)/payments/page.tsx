import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/app/dashboard/actions/index";

const C = { ink:"#16241a", muted:"#687a6c", border:"#e6ece4", green:"#2ea82a", greenWash:"#eef6ec", greenDark:"#1a6b18", bg:"#f4f7f2" };

function fmtXOF(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " CFA"; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

const AVATAR = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function aColor(n:string){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return AVATAR[h%AVATAR.length];}
function ini(n:string){return n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();}

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, paid_at, notes, receipt_number, payment_method, students(full_name)")
    .order("paid_at", { ascending: false })
    .limit(50);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const collected = (payments ?? []).filter(p => p.paid_at >= monthStart).reduce((s,p)=>s+Number(p.amount),0);
  const receipts = (payments ?? []).length;

  const methodTone: Record<string,{bg:string;fg:string}> = {
    momo: { bg:"rgba(124,58,237,.12)", fg:"#6d28d9" },
    "Mobile Money": { bg:"rgba(124,58,237,.12)", fg:"#6d28d9" },
    cash: { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" },
    Cash: { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" },
    bank_transfer: { bg:"rgba(63,125,140,.14)", fg:"#2f5f6b" },
    "Bank transfer": { bg:"rgba(63,125,140,.14)", fg:"#2f5f6b" },
  };

  return (
    <div style={{ padding:"30px 30px 60px" }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>Payments</h1>
        <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>Record fees, track balances and issue receipts.</p>
      </div>

      {/* Stats */}
      <div className="cd-grid-stats-3" style={{ marginBottom:18 }}>
        <StatCard icon="wallet" label="Collected · this month" value={fmtXOF(collected)} tone="gold" />
        <StatCard icon="check"  label="Receipts issued" value={receipts} sub="total recorded" tone="green" />
        <StatCard icon="clock"  label="Transactions" value={(payments ?? []).length} tone="dark" />
      </div>

      <div className="cd-grid-2-1">
        {/* History */}
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Transaction history</h3>
          </div>
          {!payments?.length ? (
            <p style={{ padding:"40px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No payments recorded yet.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead>
                  <tr>
                    {["Student","Method","Date","Amount",""].map((h,i)=>(
                      <th key={h} style={{ textAlign:i===3?"right":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const st = Array.isArray(p.students)?p.students[0]:p.students;
                    const name = (st as {full_name?:string}|null)?.full_name ?? "—";
                    const method = (p as {payment_method?:string}).payment_method ?? "momo";
                    const mt = methodTone[method] ?? { bg:"#eef2ec", fg:"#4a5a4d" };
                    const receiptNo = (p as {receipt_number?:string|null}).receipt_number ?? "PAY-"+p.id.slice(0,8).toUpperCase();
                    return (
                      <tr key={p.id} className="cd-trow">
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background:aColor(name), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11 }}>{ini(name)}</div>
                            <div>
                              <div style={{ fontWeight:600, color:C.ink }}>{name}</div>
                              <div style={{ fontSize:11, color:C.muted, fontFamily:"monospace" }}>{receiptNo}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}` }}>
                          <span style={{ display:"inline-flex", background:mt.bg, color:mt.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7, textTransform:"capitalize" }}>
                            {method.replace("_"," ")}
                          </span>
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{fmtDate(p.paid_at)}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right", fontWeight:700, color:C.ink }}>{fmtXOF(Number(p.amount))}</td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                          <a href={`/admin/payments/${p.id}/receipt`} target="_blank" rel="noopener noreferrer" className="cd-mini-btn" style={{ textDecoration:"none" }}>
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

        {/* Record form */}
        <div className="cd-card" style={{ padding:22, height:"fit-content" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:16 }}>Record a payment</h3>
          <form action={createPayment as unknown as (fd: FormData) => Promise<void>} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <label className="cd-fld"><span>Student</span>
              <select name="student_id" required defaultValue="">
                <option value="" disabled>Select student…</option>
                {(students ?? []).map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <label className="cd-fld"><span>Amount (CFA)</span><input name="amount" type="number" step="0.01" min="0" required placeholder="90000" /></label>
              <label className="cd-fld"><span>Currency</span>
                <select name="currency" defaultValue="XOF"><option value="XOF">XOF</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
              </label>
            </div>
            <label className="cd-fld"><span>Method</span>
              <select name="payment_method" defaultValue="momo"><option value="momo">Mobile Money</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select>
            </label>
            <label className="cd-fld"><span>Date</span><input name="paid_at" type="datetime-local" defaultValue={new Date().toISOString().slice(0,16)} /></label>
            <label className="cd-fld"><span>Notes</span><input name="notes" type="text" placeholder="Optional…" /></label>
            <button type="submit" className="cd-btn-primary" style={{ width:"100%", justifyContent:"center" }}>Record payment</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone="green" }: { icon:string; label:string; value:React.ReactNode; sub?:string; tone?:"green"|"gold"|"blue"|"dark" }) {
  const toneColors = { green:C.green, gold:"#bf9636", blue:"#3f7d8c", dark:"#0e3b0c" };
  const PATHS: Record<string,string> = {
    wallet:"M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
    check:"M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    clock:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  };
  const d=PATHS[icon]; const paths=d?d.split(" M").map((s,i)=>i===0?s:"M"+s):[];
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
