import { createClient } from "@/lib/supabase/server";
import { getStudentForCurrentUser, levelName } from "@/lib/student-auth";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenDark: "#166534",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const TYPE: Record<string, { bg: string; fg: string; label: string; icon: string }> = {
  pdf:      { bg: "#fff1f2", fg: "#be123c", label: "PDF",      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6" },
  link:     { bg: "#eff6ff", fg: "#1d4ed8", label: "Link",     icon: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
  video:    { bg: "#faf5ff", fg: "#7c3aed", label: "Video",    icon: "M23 7l-7 5 7 5V7z M1 5h15v14H1z" },
  audio:    { bg: "#fdf4ff", fg: "#7e22ce", label: "Audio",    icon: "M9 18V5l12-2v13 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  document: { bg: "#f8fafc", fg: "#475569", label: "Doc",      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" },
  other:    { bg: "#f8fafc", fg: "#475569", label: "Resource", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
};

function openLabel(type: string) {
  if (type === "video") return "Watch";
  if (type === "link") return "Open";
  if (type === "pdf") return "Read";
  return "Open";
}

type Material = {
  id: string; title: string; description: string | null; material_type: string;
  url: string | null; topic: string | null; week_number: number | null; is_public: boolean;
};

function TypeIcon({ type }: { type: string }) {
  const t = TYPE[type] ?? TYPE.other;
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, color: t.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {t.icon.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
      </svg>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const t = TYPE[type] ?? TYPE.other;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", background: t.bg, color: t.fg, fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.04em" }}>
      {t.label}
    </span>
  );
}

function MaterialCard({ m }: { m: Material }) {
  const isAudio = m.material_type === "audio";
  return (
    <div className="material-card" style={{
      background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14,
      padding: "16px 18px", boxShadow: S.card,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <TypeIcon type={m.material_type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <TypeBadge type={m.material_type} />
            {m.topic && <span style={{ fontSize: 12, color: S.muted }}>{m.topic}</span>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.ink }}>{m.title}</div>
          {m.description && <div style={{ fontSize: 12.5, color: S.sub, marginTop: 3, lineHeight: 1.5 }}>{m.description}</div>}
        </div>
        {m.url && !isAudio && (
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="material-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
              background: S.green, color: "#fff", borderRadius: 10, padding: "10px 18px",
              fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", minHeight: 42,
            }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {openLabel(m.material_type)}
          </a>
        )}
      </div>
      {isAudio && m.url && (
        <div style={{ marginTop: 12 }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls style={{ width: "100%", borderRadius: 8 }} preload="none">
            <source src={m.url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default async function StudentMaterialsPage() {
  const result = await getStudentForCurrentUser();
  if (!result) return null;

  if (!result.student) {
    return (
      <div style={{ padding: "40px 30px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: S.ink }}>Learning Library</h1>
        <p style={{ marginTop: 10, fontSize: 15, color: S.sub }}>No student record linked to your account yet.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { student } = result;
  const level = levelName(student.levels);

  let materials: Material[] = [];
  if (student.level_id) {
    const { data } = await supabase
      .from("materials")
      .select("id, title, description, material_type, url, topic, week_number, is_public")
      .or(`level_id.eq.${student.level_id},is_public.eq.true`)
      .order("week_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    materials = (data ?? []) as Material[];
  } else {
    const { data } = await supabase
      .from("materials")
      .select("id, title, description, material_type, url, topic, week_number, is_public")
      .eq("is_public", true)
      .order("created_at", { ascending: true });
    materials = (data ?? []) as Material[];
  }

  const weekGroups = new Map<number, Material[]>();
  const general: Material[] = [];
  for (const m of materials) {
    if (m.week_number != null) {
      if (!weekGroups.has(m.week_number)) weekGroups.set(m.week_number, []);
      weekGroups.get(m.week_number)!.push(m);
    } else {
      general.push(m);
    }
  }
  const sortedWeeks = [...weekGroups.keys()].sort((a, b) => a - b);
  const totalLessons = materials.length;

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* ── Header card ────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0f2717 0%, #1a4326 50%, #166534 100%)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#86efac", marginBottom: 10 }}>
          Learning Library
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {level !== "—" ? `Level ${level}` : "Your Lessons"}
            </h1>
            <p style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              {totalLessons > 0 ? `${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"} available` : "No lessons added yet"}
            </p>
          </div>
          {totalLessons > 0 && (
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{sortedWeeks.length}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>weeks of content</div>
            </div>
          )}
        </div>
      </div>

      {!totalLessons ? (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 18, padding: "60px 32px", textAlign: "center", boxShadow: S.card }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: S.ink, marginBottom: 8 }}>No lessons yet</h2>
          <p style={{ fontSize: 14, color: S.sub, maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
            Your course materials will appear here. Your teacher will add lessons before each class.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {sortedWeeks.map(wk => {
            const items = weekGroups.get(wk)!;
            const topic = items.find(m => m.topic)?.topic;
            return (
              <section key={wk}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: S.green, color: "#fff", borderRadius: 9, padding: "5px 12px", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", flexShrink: 0 }}>
                    Week {wk}
                  </div>
                  {topic && <span style={{ fontSize: 14, fontWeight: 600, color: S.sub }}>{topic}</span>}
                  <div style={{ flex: 1, height: 1, background: S.border }} />
                  <span style={{ fontSize: 12, color: S.muted }}>{items.length} {items.length === 1 ? "lesson" : "lessons"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map(m => <MaterialCard key={m.id} m={m} />)}
                </div>
              </section>
            );
          })}

          {general.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: S.muted, color: "#fff", borderRadius: 9, padding: "5px 12px", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>
                  General
                </div>
                <div style={{ flex: 1, height: 1, background: S.border }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {general.map(m => <MaterialCard key={m.id} m={m} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
