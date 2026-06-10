import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenDark: "#166534",
  red: "#dc2626", redLight: "#fff1f2",
  amber: "#d97706", amberLight: "#fffbeb",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  present: { bg: "#dcfce7", fg: S.greenDark, label: "Present" },
  late:    { bg: S.amberLight, fg: "#92400e", label: "Late" },
  absent:  { bg: "#fee2e2", fg: "#991b1b", label: "Absent" },
};

function BigStat({ value, label, color, sub }: { value: string | number; label: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "24px", textAlign: "center", boxShadow: S.card }}>
      <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", color: color ?? S.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginTop: 8 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: S.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default async function StudentAttendancePage() {
  const t = await getTranslations("dashboard.student");
  const tc = await getTranslations("dashboard.common");
  const result = await getStudentForCurrentUser();
  if (!result) return null;
  if (!result.student) {
    return (
      <div style={{ padding: "40px 30px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: S.ink }}>{t("myAttendance")}</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: S.sub }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("attendance").select("id, date, status")
    .eq("student_id", result.student.id)
    .order("date", { ascending: false }).limit(120);

  const total = rows?.length ?? 0;
  const presentCount = rows?.filter(r => r.status === "present").length ?? 0;
  const lateCount = rows?.filter(r => r.status === "late").length ?? 0;
  const absentCount = rows?.filter(r => r.status === "absent").length ?? 0;
  const presentOrLate = presentCount + lateCount;
  const pct = total > 0 ? Math.round((presentOrLate / total) * 100) : 0;

  // Group by month
  const monthGroups: Record<string, typeof rows> = {};
  for (const r of rows ?? []) {
    const key = r.date.slice(0, 7); // "2025-06"
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key]!.push(r);
  }
  const monthKeys = Object.keys(monthGroups).sort().reverse();

  const rateColor = pct >= 80 ? S.green : pct >= 60 ? S.amber : S.red;

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Attendance Record</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>{result.student.full_name}</h1>
        <p style={{ fontSize: 13.5, color: S.sub, marginTop: 4 }}>{tc("level")}: {levelName(result.student.levels)}</p>
      </div>

      {/* ── Big stats ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }} className="cd-grid-stats-4">
        <BigStat value={`${pct}%`} label="Attendance Rate" color={rateColor} sub={`Overall rate`} />
        <BigStat value={presentCount} label="Present" color={S.greenDark} sub={`${total > 0 ? Math.round((presentCount / total) * 100) : 0}% of sessions`} />
        <BigStat value={lateCount} label="Late" color={S.amber} sub={`Counted as present`} />
        <BigStat value={absentCount} label="Absent" color={S.red} sub={`${total > 0 ? Math.round((absentCount / total) * 100) : 0}% of sessions`} />
      </div>

      {/* ── Attendance rate bar ────────────────────────────── */}
      {total > 0 && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 28, boxShadow: S.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: S.ink }}>Overall Attendance</span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: rateColor }}>{pct}%</span>
          </div>
          <div style={{ height: 12, borderRadius: 8, background: "#fee2e2", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: rateColor, borderRadius: 8, transition: "width .5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11.5, color: S.muted }}>0%</span>
            <span style={{ fontSize: 11.5, color: pct >= 80 ? S.greenDark : pct >= 60 ? "#92400e" : "#991b1b", fontWeight: 700 }}>
              {pct >= 80 ? "Excellent" : pct >= 60 ? "Needs improvement" : "Attendance too low"}
            </span>
            <span style={{ fontSize: 11.5, color: S.muted }}>100%</span>
          </div>
        </div>
      )}

      {/* ── Monthly tables ─────────────────────────────────── */}
      {!rows?.length ? (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "60px 32px", textAlign: "center", boxShadow: S.card }}>
          <p style={{ fontSize: 15, color: S.sub }}>{t("noAttendance")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {monthKeys.map(monthKey => {
            const monthRows = monthGroups[monthKey]!;
            const mPresent = monthRows.filter(r => r.status === "present" || r.status === "late").length;
            const mTotal = monthRows.length;
            const mPct = mTotal > 0 ? Math.round((mPresent / mTotal) * 100) : 0;
            const [yr, mo] = monthKey.split("-");
            const monthLabel = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

            return (
              <div key={monthKey}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: S.ink }}>{monthLabel}</h2>
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7,
                    background: mPct >= 80 ? "#dcfce7" : mPct >= 60 ? S.amberLight : "#fee2e2",
                    color: mPct >= 80 ? S.greenDark : mPct >= 60 ? "#92400e" : "#991b1b",
                  }}>{mPresent}/{mTotal} · {mPct}%</span>
                </div>
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, overflow: "hidden", boxShadow: S.card }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, borderBottom: `1px solid ${S.border}` }}>{tc("date")}</th>
                        <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, borderBottom: `1px solid ${S.border}` }}>Day</th>
                        <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, borderBottom: `1px solid ${S.border}` }}>{tc("status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthRows.map((r, idx) => {
                        const d = new Date(r.date + "T12:00:00");
                        const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.absent;
                        return (
                          <tr key={r.id} style={{ borderBottom: idx < monthRows.length - 1 ? `1px solid ${S.border}` : "none", background: r.status === "absent" ? "#fffafa" : "transparent" }}>
                            <td style={{ padding: "13px 16px", fontWeight: 600, color: S.ink }}>
                              {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td style={{ padding: "13px 16px", color: S.sub, fontSize: 13 }}>
                              {d.toLocaleDateString("en-GB", { weekday: "long" })}
                            </td>
                            <td style={{ padding: "13px 16px", textAlign: "right" }}>
                              <span style={{ display: "inline-flex", background: st.bg, color: st.fg, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 8 }}>
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
