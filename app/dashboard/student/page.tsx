import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  amber: "#d97706", amberLight: "#fffbeb",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CEFR_LABEL: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper-Intermediate", C1: "Advanced", C2: "Proficient",
};

function levelColor(l: string): { bg: string; fg: string; dot: string } {
  if (l === "A1" || l === "A2") return { bg: "#fef3c7", fg: "#92400e", dot: "#f59e0b" };
  if (l === "B1" || l === "B2") return { bg: "#dbeafe", fg: "#1e3a8a", dot: "#3b82f6" };
  if (l === "C1" || l === "C2") return { bg: S.greenMid, fg: S.greenDark, dot: S.green };
  return { bg: "#f1f5f9", fg: S.sub, dot: S.muted };
}

function LevelBadge({ level, large }: { level: string; large?: boolean }) {
  const c = levelColor(level);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: c.bg, color: c.fg,
      fontSize: large ? 15 : 12, fontWeight: 800,
      padding: large ? "5px 14px" : "3px 9px",
      borderRadius: large ? 10 : 7,
      letterSpacing: "0.03em",
    }}>{level}</span>
  );
}

function StatCard({ value, label, sub, color = S.green }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16,
      padding: "22px 24px", boxShadow: S.card, display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontSize: 40, fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: S.ink, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: S.muted }}>{sub}</div>}
    </div>
  );
}

function LevelTrack({ current }: { current: string }) {
  const idx = CEFR_ORDER.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
      {CEFR_ORDER.map((l, i) => {
        const isActive = i === idx;
        const isDone = i < idx;
        const c = levelColor(l);
        return (
          <div key={l} style={{ display: "flex", alignItems: "center", flex: i < CEFR_ORDER.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
                background: isActive ? c.dot : isDone ? c.dot : S.border,
                color: isActive || isDone ? "#fff" : S.muted,
                boxShadow: isActive ? `0 0 0 4px ${c.bg}, 0 0 0 6px ${c.dot}40` : "none",
                transition: "all .2s",
              }}>{l}</div>
              {isActive && (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: c.dot, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  You are here
                </span>
              )}
            </div>
            {i < CEFR_ORDER.length - 1 && (
              <div style={{ flex: 1, height: 3, background: isDone ? c.dot : S.border, borderRadius: 3, margin: "0 4px", marginBottom: isActive ? 22 : 0, transition: "background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}


export default async function StudentDashboardPage() {
  const t = await getTranslations("dashboard.student");
  const result = await getStudentForCurrentUser();

  if (!result?.student) {
    return (
      <div style={{ padding: "40px 30px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: S.ink, letterSpacing: "-0.03em" }}>{t("progress")}</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: S.sub, maxWidth: 520, lineHeight: 1.7 }}>{t("noStudentRecord")}</p>
      </div>
    );
  }

  const { student } = result;
  const supabase = await createClient();

  const { data: attendanceRows } = await supabase.from("attendance").select("status").eq("student_id", student.id);
  const total = attendanceRows?.length ?? 0;
  const presentCount = attendanceRows?.filter(r => r.status === "present" || r.status === "late").length ?? 0;
  const absentCount = attendanceRows?.filter(r => r.status === "absent").length ?? 0;
  const attendancePct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const { data: grades } = await supabase
    .from("grades").select("id, subject_or_type, score, academic_terms(name)")
    .eq("student_id", student.id).order("created_at", { ascending: false }).limit(8);

  const { data: overallGrade } = await supabase
    .from("grades")
    .select("skill_level")
    .eq("student_id", student.id)
    .eq("skill_area", "overall")
    .maybeSingle();
  const overallLevel = (overallGrade as { skill_level?: string | null } | null)?.skill_level ?? null;

  const { data: announcements } = await supabase
    .from("announcements").select("id, title, body, published_at")
    .order("published_at", { ascending: false }).limit(2);

  const level = levelName(student.levels);
  const firstName = (student.full_name ?? "").split(" ")[0] || student.email?.split("@")[0] || "Student";
  const knownLevel = CEFR_ORDER.includes(level) ? level : "A1";
  const lc = levelColor(knownLevel);

  const enrolledStr = student.enrollment_date
    ? `Enrolled ${new Date(student.enrollment_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
    : "Enrolled";

  return (
    <div className="cedar-dash-page" style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Welcome header ───────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink, lineHeight: 1 }}>
            Welcome back, {firstName}
          </h1>
          <LevelBadge level={knownLevel} large />
        </div>
        <p style={{ fontSize: 14, color: S.sub }}>{enrolledStr} · {CEFR_LABEL[knownLevel] ?? knownLevel}</p>
      </div>

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="cd-grid-stats-3" style={{ marginBottom: 24 }}>
        <StatCard
          value={`${attendancePct}%`}
          label="Attendance Rate"
          sub={`${presentCount} present · ${absentCount} absent`}
          color={attendancePct >= 80 ? S.green : attendancePct >= 60 ? S.amber : "#dc2626"}
        />
        <StatCard
          value={overallLevel ?? "—"}
          label="Overall Level"
          sub={overallLevel ? "CEFR assessment" : "Pending assessment"}
          color={overallLevel ? lc.dot : S.muted}
        />
        <StatCard
          value={knownLevel}
          label="Current Level"
          sub={CEFR_LABEL[knownLevel] ?? ""}
          color={lc.dot}
        />
      </div>

      {/* ── Level progress ────────────────────────────────── */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "24px 28px", marginBottom: 24, boxShadow: S.card }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Your Learning Journey</p>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: S.ink }}>CEFR Level Progression — A1 to C2</h2>
        </div>
        <LevelTrack current={knownLevel} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 8 }}>
          {CEFR_ORDER.map(l => {
            const c = levelColor(l);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: S.sub }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
                {CEFR_LABEL[l]}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick access ──────────────────────────────────── */}
      <div className="cd-quick-access" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Link href="/student/materials" style={{
          background: S.green, color: "#fff", borderRadius: 16, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14, textDecoration: "none", boxShadow: S.card,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: S.greenDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Library</p>
            <p style={{ fontSize: 12, color: "#bbf7d0", margin: 0, marginTop: 2 }}>Your lessons</p>
          </div>
        </Link>

        <Link href="/student/grades" style={{
          background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14, textDecoration: "none", boxShadow: S.card,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: S.ink, margin: 0 }}>My Level</p>
            <p style={{ fontSize: 12, color: S.muted, margin: 0, marginTop: 2 }}>CEFR progress</p>
          </div>
        </Link>
      </div>

      {/* ── Announcements ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cd-grid-2-1">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink }}>Recent Announcements</h2>
            <Link href="/student/announcements" style={{ fontSize: 13, fontWeight: 700, color: S.green, textDecoration: "none" }}>View all</Link>
          </div>
          {!announcements?.length ? (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "32px 24px", textAlign: "center", boxShadow: S.card }}>
              <p style={{ fontSize: 14, color: S.muted }}>No announcements yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map(a => (
                <div key={a.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: S.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, color: S.ink, lineHeight: 1.3 }}>{a.title}</h3>
                    <span style={{ fontSize: 11, color: S.muted, whiteSpace: "nowrap", marginTop: 2 }}>
                      {new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  {a.body && <p style={{ fontSize: 13, color: S.sub, lineHeight: 1.6 }}>{a.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Grades summary ─── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: S.ink }}>Recent Grades</h2>
            <Link href="/student/grades" style={{ fontSize: 13, fontWeight: 700, color: S.green, textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, overflow: "hidden", boxShadow: S.card }}>
            {!grades?.length ? (
              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: S.muted }}>{t("noGrades")}</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, borderBottom: `1px solid ${S.border}` }}>Skill</th>
                    <th style={{ textAlign: "center", padding: "11px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: S.muted, borderBottom: `1px solid ${S.border}` }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.slice(0, 6).map((g: { id: string; subject_or_type: string; score: number | null }) => {
                    const sc = Number(g.score);
                    const scoreColor = !isNaN(sc) && sc >= 80 ? S.greenDark : !isNaN(sc) && sc >= 60 ? S.amber : S.sub;
                    return (
                      <tr key={g.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                        <td style={{ padding: "11px 16px", fontWeight: 600, color: S.ink, textTransform: "capitalize" }}>{g.subject_or_type}</td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor }}>{g.score ?? "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
