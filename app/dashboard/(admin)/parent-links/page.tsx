import { createClient } from "@/lib/supabase/server";
import { linkParentToStudent, unlinkParentFromStudent } from "@/app/dashboard/actions/index";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const AVATAR_PALETTE = ["#16a34a","#166534","#d97706","#2563eb","#7c3aed","#0891b2"];
function avatarColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
function initials(name: string) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb",
  borderRadius: 9, padding: "10px 12px", fontSize: 13.5, color: S.ink,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: S.sub,
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
};

export default async function ParentLinksPage() {
  const supabase = await createClient();

  const { data: parentRole } = await supabase.from("roles").select("id").eq("name", "parent").single();
  const { data: parents } = await supabase.from("profiles").select("id, full_name").eq("role_id", parentRole?.id ?? "").order("full_name");
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: links } = await supabase.from("parent_students").select("id, parent_id, student_id").order("id");

  const parentIds = [...new Set((links ?? []).map(l => l.parent_id))];
  const studentIds = [...new Set((links ?? []).map(l => l.student_id))];
  const { data: parentProfiles } = await supabase.from("profiles").select("id, full_name").in("id", parentIds.length ? parentIds : ["_"]);
  const { data: studentRows } = await supabase.from("students").select("id, full_name").in("id", studentIds.length ? studentIds : ["_"]);

  const pNames: Record<string, string> = {};
  (parentProfiles ?? []).forEach(p => { pNames[p.id] = p.full_name ?? p.id.slice(0, 8); });
  const sNames: Record<string, string> = {};
  (studentRows ?? []).forEach(s => { sNames[s.id] = s.full_name; });

  // Group links by parent for a cleaner display
  const byParent: Record<string, { parentName: string; students: { linkId: string; studentId: string; name: string }[] }> = {};
  for (const l of links ?? []) {
    if (!byParent[l.parent_id]) {
      byParent[l.parent_id] = { parentName: pNames[l.parent_id] ?? "Unknown", students: [] };
    }
    byParent[l.parent_id].students.push({ linkId: l.id, studentId: l.student_id, name: sNames[l.student_id] ?? "—" });
  }
  const parentGroups = Object.entries(byParent);

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>
          Admin
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>Parent Links</h1>
        <p style={{ fontSize: 14, color: S.sub, marginTop: 6 }}>
          Connect parent accounts to their children so parents can access the parent portal.
        </p>
      </div>

      <div className="cd-staff-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* ── Left: current links ──────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: S.ink }}>Current links</h2>
            <span style={{ fontSize: 13, fontWeight: 600, color: S.muted }}>
              {(links ?? []).length} {(links ?? []).length === 1 ? "link" : "links"}
            </span>
          </div>

          {!parentGroups.length ? (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "52px 32px", textAlign: "center", boxShadow: S.card }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: S.ink, marginBottom: 8 }}>No links yet</h3>
              <p style={{ fontSize: 14, color: S.sub, lineHeight: 1.6 }}>
                Use the form to connect a parent account to their child.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {parentGroups.map(([parentId, group]) => (
                <div key={parentId} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden", boxShadow: S.card }}>
                  {/* Parent header */}
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 12, background: "#f8fafc" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarColor(group.parentName), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {initials(group.parentName)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: S.ink }}>{group.parentName}</div>
                      <div style={{ fontSize: 12, color: S.muted, marginTop: 1 }}>Parent · {group.students.length} {group.students.length === 1 ? "child" : "children"}</div>
                    </div>
                  </div>

                  {/* Children list */}
                  {group.students.map((child, i) => (
                    <div key={child.linkId} style={{ padding: "13px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < group.students.length - 1 ? `1px solid ${S.border}` : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColor(child.name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
                        {initials(child.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: S.ink }}>{child.name}</span>
                        <span style={{ fontSize: 11.5, color: S.muted, marginLeft: 8 }}>Student</span>
                      </div>
                      <form action={unlinkParentFromStudent.bind(null, child.linkId) as unknown as (fd: FormData) => Promise<void>}>
                        <button type="submit" style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: add link form ─────────────────────────── */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 18, padding: "24px", boxShadow: S.card }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: S.ink, marginBottom: 4 }}>Link a parent to a student</h2>
          <p style={{ fontSize: 13, color: S.muted, marginBottom: 22, lineHeight: 1.5 }}>
            The parent must already have an account. Once linked, they can view their child&apos;s progress in the parent portal.
          </p>

          <form action={linkParentToStudent as unknown as (fd: FormData) => Promise<void>} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Parent account</label>
              {!(parents ?? []).length ? (
                <div style={{ padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, fontSize: 13, color: "#92400e" }}>
                  No parent accounts exist yet. Invite parents via Staff Management.
                </div>
              ) : (
                <select name="parent_id" required defaultValue="" style={inputStyle}>
                  <option value="" disabled>Select a parent…</option>
                  {(parents ?? []).map(p => (
                    <option key={p.id} value={p.id}>{p.full_name ?? p.id.slice(0, 8)}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={labelStyle}>Student</label>
              {!(students ?? []).length ? (
                <div style={{ padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, fontSize: 13, color: "#92400e" }}>
                  No students found.
                </div>
              ) : (
                <select name="student_id" required defaultValue="" style={inputStyle}>
                  <option value="" disabled>Select a student…</option>
                  {(students ?? []).map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              )}
            </div>

            <button type="submit"
              style={{ background: S.green, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
              Add link
            </button>
          </form>

          <div style={{ marginTop: 20, padding: "14px 16px", background: S.greenLight, borderRadius: 10, border: `1px solid ${S.greenMid}` }}>
            <p style={{ fontSize: 12.5, color: S.greenDark, lineHeight: 1.6 }}>
              <strong>How it works:</strong> After linking, the parent logs in and sees their child&apos;s attendance, grades, and announcements in the parent portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
