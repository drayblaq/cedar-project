import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RevenueTrendChart, LevelBarChart } from "./OverviewCharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtXOF(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA"; }
function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18",
  greenSoft: "#d3ead0", greenDeep: "#0e3b0c",
};

const APP_TONES: Record<string, "green"|"gold"|"red"|"blue"|"neutral"> = {
  approved: "green", rejected: "red", awaiting_payment: "gold",
  under_review: "blue", submitted: "neutral",
};

// ── Inline primitives (server-safe, no "use client") ─────────────────────────
const BTONES: Record<string, {bg:string;fg:string}> = {
  neutral:{ bg:"#eef2ec",             fg:"#4a5a4d" },
  green:  { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" },
  gold:   { bg:"rgba(212,168,67,.16)",fg:"#9a7822" },
  red:    { bg:"rgba(201,74,58,.12)", fg:"#b3402f" },
  blue:   { bg:"rgba(63,125,140,.14)",fg:"#2f5f6b" },
};

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  const t = BTONES[tone] ?? BTONES.neutral;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", background:t.bg, color:t.fg,
      fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7, whiteSpace:"nowrap",
      textTransform:"capitalize" }}>
      {children}
    </span>
  );
}

function AvatarInline({ name }: { name: string }) {
  const palette = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const bg = palette[h % palette.length];
  const ini = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background:bg, color:"#fff",
      display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11 }}>
      {ini}
    </div>
  );
}

const ICON_PATHS: Record<string,string> = {
  users:  "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  check:  "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  clock:  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  trend:  "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  chevR:  "M9 6l6 6-6 6",
  plus:   "M12 5v14 M5 12h14",
};
function SvgIcon({ name, size=21 }: {name:string;size?:number}) {
  const d = ICON_PATHS[name]; if (!d) return null;
  const paths = d.split(" M").map((s,i)=>(i===0?s:"M"+s));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p,i)=><path key={i} d={p}/>)}
    </svg>
  );
}

function StatCard({ icon, label, value, sub, tone="green", delta }: {
  icon:string; label:string; value:React.ReactNode; sub?:string;
  tone?:"green"|"gold"|"blue"|"dark"; delta?:number;
}) {
  const toneColors = { green:C.green, gold:"#bf9636", blue:"#3f7d8c", dark:C.greenDeep };
  return (
    <div className="cd-card" style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ width:40, height:40, borderRadius:11, background:C.greenWash, color:toneColors[tone],
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <SvgIcon name={icon} size={21} />
        </div>
        {delta != null && (
          <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:12, fontWeight:700,
            color:delta>=0?"#1a8a2a":"#b3402f" }}>
            <SvgIcon name="trend" size={14} />{delta>=0?"+":""}{delta}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize:27, fontWeight:800, letterSpacing:"-0.02em", color:C.ink, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12.5, fontWeight:600, color:C.muted, marginTop:6 }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, color:C.muted, marginTop:3, opacity:.8 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const fullName = (profile as { full_name?: string | null } | null)?.full_name ?? "Admin";
  const firstName = fullName.split(" ")[0];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [totalRes, activeRes, revenueRes, allPayRes, recentPayRes, recentStudRes, attRes, levelsRes] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("payments").select("amount").gte("paid_at", monthStart).lte("paid_at", monthEnd + "T23:59:59"),
      supabase.from("payments").select("amount, paid_at").order("paid_at", { ascending: true }),
      supabase.from("payments").select("id, amount, paid_at, payment_method, students(full_name)").order("paid_at", { ascending: false }).limit(5),
      supabase.from("students").select("id, full_name, email, application_status, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("attendance").select("status"),
      supabase.from("students").select("levels(name)"),
    ]);

  const totalStudents  = totalRes.count ?? 0;
  const activeStudents = activeRes.count ?? 0;
  const revenueMonth   = (revenueRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const outstanding    = 0;

  // Attendance rate
  const attRows = attRes.data ?? [];
  const presentOrLate = attRows.filter(r => r.status === "present" || r.status === "late").length;
  const attendancePct = attRows.length > 0 ? Math.round((presentOrLate / attRows.length) * 100) : 0;

  // Revenue trend (last 6 months)
  const byMonth: Record<string, number> = {};
  for (const p of allPayRes.data ?? []) {
    const d = new Date(p.paid_at);
    const key = d.toLocaleDateString("en-GB", { month: "short" });
    byMonth[key] = (byMonth[key] ?? 0) + Number(p.amount);
  }
  const chartData = Object.entries(byMonth).slice(-6).map(([month, total]) => ({ month, total }));

  // Students by level
  const levelCounts: Record<string, number> = {};
  for (const s of levelsRes.data ?? []) {
    const lvl = Array.isArray(s.levels) ? (s.levels[0] as {name?:string})?.name : (s.levels as {name?:string}|null)?.name;
    if (lvl) levelCounts[lvl] = (levelCounts[lvl] ?? 0) + 1;
  }
  const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const levelData = LEVEL_ORDER.map(l => ({ level: l, count: levelCounts[l] ?? 0 }));

  return (
    <div>
      {/* ── Section head ── */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18, gap:16, flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.02em", color:C.ink }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize:13.5, color:C.muted, marginTop:4 }}>
            Here&apos;s what&apos;s happening at the centre today — {dateStr}.
          </p>
        </div>
        <Link href="/dashboard/students/new" className="cd-btn-primary" style={{ textDecoration:"none" }}>
          <SvgIcon name="plus" size={17} />
          Add student
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="cd-grid-stats">
        <StatCard icon="users"  label="Total students"  value={totalStudents}        sub={`${activeStudents} active`} tone="green" delta={6} />
        <StatCard icon="wallet" label="Revenue · month"  value={fmtXOF(revenueMonth)} tone="gold"  delta={12} />
        <StatCard icon="check"  label="Attendance rate"  value={attendancePct + "%"}  tone="blue"  delta={2} />
        <StatCard icon="clock"  label="Outstanding fees" value={fmtXOF(outstanding)}  sub="across enrolled" tone="dark" />
      </div>

      {/* ── Charts row: revenue trend + students by level ── */}
      <div className="cd-grid-2-1" style={{ marginTop:18 }}>
        <div className="cd-card" style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, letterSpacing:"-0.01em" }}>Revenue trend</h3>
              <p style={{ fontSize:12.5, color:C.muted, marginTop:2 }}>Last 6 months · in thousands CFA</p>
            </div>
            <Badge tone="green">+12% vs last month</Badge>
          </div>
          <RevenueTrendChart data={chartData} />
        </div>

        <div className="cd-card" style={{ padding:22 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:2 }}>Students by level</h3>
          <p style={{ fontSize:12.5, color:C.muted, marginBottom:4 }}>CEFR distribution</p>
          <LevelBarChart data={levelData} />
        </div>
      </div>

      {/* ── Recent payments + Announcements ── */}
      <div className="cd-grid-2-1" style={{ marginTop:18 }}>
        {/* Recent payments */}
        <div className="cd-card" style={{ padding:0 }}>
          <div style={{ padding:"18px 22px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.ink }}>Recent payments</h3>
            <Link href="/dashboard/payments"
              style={{ display:"inline-flex", alignItems:"center", gap:3, color:C.green, fontSize:12.5, fontWeight:700, textDecoration:"none" }}>
              View all <SvgIcon name="chevR" size={15} />
            </Link>
          </div>
          {!(recentPayRes.data ?? []).length ? (
            <p style={{ padding:"32px 22px", textAlign:"center", color:C.muted, fontSize:13.5 }}>No payments yet.</p>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr>
                  {["Student","Program","Amount","Status"].map((h,i)=>(
                    <th key={h} style={{ textAlign:i>=2?"right":"left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(recentPayRes.data ?? []).map(p => {
                    const st = Array.isArray(p.students)?p.students[0]:p.students;
                    const name = (st as {full_name?:string}|null)?.full_name ?? "—";
                    const method = (p as {payment_method?:string}).payment_method ?? "momo";
                    return (
                      <tr key={p.id} className="cd-trow">
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <AvatarInline name={name} />
                            <span style={{ fontWeight:600, color:C.ink }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, color:C.muted, textTransform:"capitalize" }}>
                          {method.replace("_"," ")}
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right", fontWeight:700, color:C.ink }}>
                          {fmtXOF(Number(p.amount))}
                        </td>
                        <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, textAlign:"right" }}>
                          <Badge tone="green">Paid</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="cd-card" style={{ padding:22 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>Announcements</h3>
          <AnnouncementsWidget />
        </div>
      </div>
    </div>
  );
}

// ── Server-rendered announcements widget ──────────────────────────────────────
async function AnnouncementsWidget() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: anns } = await supabase
    .from("announcements")
    .select("id, title, published_at")
    .order("published_at", { ascending: false })
    .limit(4);

  if (!anns?.length) {
    return <p style={{ fontSize:13, color:C.muted }}>No announcements yet.</p>;
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {anns.map(a => (
        <div key={a.id} style={{ paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:3 }}>
            <Badge tone="green">Academic</Badge>
            <span style={{ fontSize:11, color:C.muted }}>{fmtDate(a.published_at.slice(0,10))}</span>
          </div>
          <div style={{ fontSize:13.5, fontWeight:700, color:C.ink, lineHeight:1.35 }}>{a.title}</div>
        </div>
      ))}
    </div>
  );
}
