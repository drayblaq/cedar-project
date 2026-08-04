import Link from "next/link";
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

function StatCard({ value, label, sub, color = S.green }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16,
      padding: "20px 22px", boxShadow: S.card, display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: S.muted }}>{sub}</div>}
    </div>
  );
}

function LevelTrack({ current }: { current: string }) {
  const idx = CEFR_ORDER.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", overflowX: "auto" }}>
      {CEFR_ORDER.map((l, i) => {
        const isActive = i === idx;
        const isDone = i < idx;
        const c = levelColor(l);
        return (
          <div key={l} style={{ display: "flex", alignItems: "center", flex: i < CEFR_ORDER.length - 1 ? 1 : "0 0 auto", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0,
                background: isActive ? c.dot : isDone ? c.dot : S.border,
                color: isActive || isDone ? "#fff" : S.muted,
                boxShadow: isActive ? `0 0 0 4px ${c.bg}, 0 0 0 6px ${c.dot}40` : "none",
              }}>{l}</div>
              {isActive && (
                <span style={{ fontSize: 9, fontWeight: 700, color: c.dot, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  You are here
                </span>
              )}
            </div>
            {i < CEFR_ORDER.length - 1 && (
              <div style={{ flex: 1, height: 3, background: isDone ? c.dot : S.border, borderRadius: 3, margin: "0 3px", marginBottom: isActive ? 22 : 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default async function StudentDashboardPage() {
  const result = await getStudentForCurrentUser();

  if (!result?.student) {
    return (
      <div style={{ padding: "40px 30px 60px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: S.ink }}>My Dashboard</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: S.sub, maxWidth: 520, lineHeight: 1.7 }}>
          No student record is linked to your account yet. Contact the center if you have already received your login email.
        </p>
      </div>
    );
  }

  const { student } = result;
  const supabase = await createClient();

  const { data: overallGrade } = await supabase
    .from("grades")
    .select("skill_level")
    .eq("student_id", student.id)
    .eq("skill_area", "overall")
    .maybeSingle();
  const overallLevel = (overallGrade as { skill_level?: string | null } | null)?.skill_level ?? null;

  // Library progress
  const { count: totalMaterials } = await supabase
    .from("materials")
    .select("id", { count: "exact", head: true })
    .eq("teacher_only", false);

  const { count: completedMaterials } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", student.id);

  // Days since enrolled
  const enrolledAt = student.enrollment_date ?? (student as { created_at?: string }).created_at;
  const daysSinceEnrolled = enrolledAt
    ? Math.floor((Date.now() - new Date(enrolledAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const { data: announcements } = await supabase
    .from("announcements").select("id, title, body, published_at")
    .order("published_at", { ascending: false }).limit(2);

  const level = levelName(student.levels);
  const firstName = (student.full_name ?? "").split(" ")[0] || student.email?.split("@")[0] || "Student";
  const knownLevel = CEFR_ORDER.includes(level) ? level : null;
  const lc = knownLevel ? levelColor(knownLevel) : levelColor("A1");
  const timeOfDay = getTimeOfDay();

  return (
    <div className="cedar-dash-page" style={{ padding: "0 0 70px", background: S.bg, minHeight: "100%", overflowX: "hidden" }}>
      {/* Green gradient header */}
      <div style={{
        background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
        padding: "28px 28px 32px",
        marginBottom: 24,
      }}>
        <p style={{ color: "#bbf7d0", fontSize: 13, marginBottom: 4 }}>Good {timeOfDay},</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>
          {firstName}
        </h1>
        <p style={{ fontSize: 13, color: "#86efac" }}>
          {level || "Level not assigned yet"} · Cedar Training Center
        </p>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Stat cards */}
        <div className="cedar-stat-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard
            value={knownLevel ?? "-"}
            label="Current Level"
            sub={knownLevel ? CEFR_LABEL[knownLevel] : "Pending"}
            color={lc.dot}
          />
          <StatCard
            value={`${completedMaterials ?? 0}/${totalMaterials ?? 0}`}
            label="Library"
            sub="lessons completed"
            color={S.green}
          />
          <StatCard
            value={daysSinceEnrolled !== null ? daysSinceEnrolled : "-"}
            label="Days Enrolled"
            sub="at Cedar Training Center"
            color="#6366f1"
          />
        </div>

        {/* CEFR Progress Track */}
        {knownLevel && (
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 24, boxShadow: S.card }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Your Learning Journey</p>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: S.ink, marginBottom: 20 }}>CEFR Level Progression, A1 to C2</h2>
            <LevelTrack current={knownLevel} />
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <Link href="/student/materials" style={{
            background: S.green, color: "#fff", borderRadius: 16, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: S.card,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: S.greenDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Go to Library</p>
              <p style={{ fontSize: 12, color: "#bbf7d0", margin: "2px 0 0" }}>Your lessons</p>
            </div>
          </Link>

          <Link href="/student/grades" style={{
            background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: S.card,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: S.ink, margin: 0 }}>View My Level</p>
              <p style={{ fontSize: 12, color: S.muted, margin: "2px 0 0" }}>CEFR progress</p>
            </div>
          </Link>
        </div>

        {/* Announcements */}
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
      </div>
    </div>
  );
}
