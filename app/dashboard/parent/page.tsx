import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  amber: "#d97706", amberLight: "#fffbeb",
  red: "#dc2626",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const AVATAR_PALETTE = ["#16a34a", "#166534", "#d97706", "#2563eb", "#7c3aed", "#0891b2"];
function avatarColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
function initials(name: string) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }
function resolveNested<T>(v: T | T[] | null): T | null { if (v == null) return null; return Array.isArray(v) ? (v[0] ?? null) : v; }

function LevelBadge({ level }: { level: string }) {
  const c = level.startsWith("A") ? { bg: "#fef3c7", fg: "#92400e" }
    : level.startsWith("B") ? { bg: "#dbeafe", fg: "#1e3a8a" }
    : level === "—" ? { bg: "#f1f5f9", fg: S.muted }
    : { bg: S.greenMid, fg: S.greenDark };
  return (
    <span style={{ display: "inline-flex", background: c.bg, color: c.fg, fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 7, letterSpacing: "0.04em" }}>
      {level}
    </span>
  );
}

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? S.green : pct >= 60 ? S.amber : S.red;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Attendance this month</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 5 }} />
      </div>
    </div>
  );
}

export default async function ParentDashboardPage() {
  const t = await getTranslations("dashboard.parent");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const parentName = (profile as { full_name?: string | null } | null)?.full_name?.split(" ")[0] ?? "";

  const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
  const studentIds = (links ?? []).map(l => l.student_id);

  if (!studentIds.length) {
    return (
      <div style={{ padding: "40px 30px 70px", background: S.bg, minHeight: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>
            Hello{parentName ? `, ${parentName}` : ""}
          </h1>
          <p style={{ fontSize: 14, color: S.sub, marginTop: 6 }}>{t("progressDesc")}</p>
        </div>
        <div style={{ background: S.surface, border: `1.5px solid #fde68a`, borderRadius: 18, padding: "40px 32px", textAlign: "center", maxWidth: 480, boxShadow: S.card }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fffbeb", color: S.amber, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: S.ink, marginBottom: 8 }}>No children linked yet</h2>
          <p style={{ fontSize: 14, color: S.sub, lineHeight: 1.7 }}>
            {t("noChildren")}
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: S.green, marginTop: 12 }}>
            Contact us to link your child&apos;s account.
          </p>
        </div>
      </div>
    );
  }

  const { data: students } = await supabase.from("students").select("id, full_name, status, levels(name)").in("id", studentIds);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const summaries = [];
  for (const s of students ?? []) {
    const lvl = resolveNested(s.levels as { name?: string } | { name?: string }[] | null)?.name ?? "—";
    const { data: att } = await supabase.from("attendance").select("status").eq("student_id", s.id).gte("date", monthStart);
    const totalM = att?.length ?? 0;
    const presM = att?.filter(r => r.status === "present" || r.status === "late").length ?? 0;
    const attPct = totalM > 0 ? Math.round((presM / totalM) * 100) : 0;
    const { data: gr } = await supabase.from("grades").select("score").eq("student_id", s.id).not("score", "is", null);
    const scores = (gr ?? []).map(g => Number(g.score)).filter(n => !isNaN(n));
    const gradeAvg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    summaries.push({ id: s.id, full_name: s.full_name, status: s.status ?? "pending", level: lvl, attPct, gradeAvg, totalMonthSessions: totalM });
  }

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Greeting ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Parent Portal</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>
          Hello{parentName ? `, ${parentName}` : ""}
        </h1>
        <p style={{ fontSize: 14, color: S.sub, marginTop: 6 }}>
          {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>
        {summaries.length === 1 ? "Your child" : `Your children (${summaries.length})`}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {summaries.map(s => (
          <div key={s.id} style={{
            background: S.surface, border: `1px solid ${S.border}`, borderRadius: 18,
            padding: "24px", boxShadow: S.card,
          }}>
            {/* Child header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                background: avatarColor(s.full_name), color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em",
              }}>{initials(s.full_name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: S.ink }}>{s.full_name}</h2>
                  <LevelBadge level={s.level} />
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 7, textTransform: "capitalize",
                    background: s.status === "active" ? S.greenLight : "#f1f5f9",
                    color: s.status === "active" ? S.greenDark : S.muted,
                  }}>{s.status}</span>
                </div>
                <p style={{ fontSize: 13, color: S.muted, marginTop: 3 }}>English · Level {s.level}</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Avg. Grade</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.gradeAvg >= 80 ? S.greenDark : s.gradeAvg >= 60 ? S.amber : s.gradeAvg > 0 ? S.red : S.muted, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.gradeAvg > 0 ? s.gradeAvg : "—"}
                </p>
                <p style={{ fontSize: 11.5, color: S.muted, marginTop: 4 }}>across all assessments</p>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Sessions this month</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: S.ink, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.totalMonthSessions}
                </p>
                <p style={{ fontSize: 11.5, color: S.muted, marginTop: 4 }}>attendance records</p>
              </div>
            </div>

            {/* Attendance bar */}
            <div style={{ marginBottom: 20 }}>
              <AttendanceBar pct={s.attPct} />
            </div>

            {/* CTA */}
            <Link href={`/parent/student/${s.id}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: S.greenLight, color: S.greenDark,
                border: `1.5px solid ${S.greenMid}`, borderRadius: 12,
                padding: "12px", fontSize: 14, fontWeight: 700, textDecoration: "none",
                transition: "background .15s",
              }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View full details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
