"use client";

import { useState, useTransition } from "react";
import { inviteStaffMember, updateStaffRole } from "@/app/dashboard/actions/index";

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18",
  surface: "#ffffff", bg: "#f4f7f2",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb",
  borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: C.ink,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5,
};

type StaffUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
  roleName: string | null;
};

function RoleBadge({ role }: { role: string | null }) {
  const isAdmin = role === "admin";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 700,
      padding: "3px 10px", borderRadius: 7, whiteSpace: "nowrap", textTransform: "capitalize",
      background: isAdmin ? "rgba(46,168,42,.12)" : "rgba(63,125,140,.14)",
      color: isAdmin ? C.greenDark : "#2f5f6b",
    }}>{role ?? "—"}</span>
  );
}

function EditRoleRow({ user, currentUserId }: { user: StaffUser; currentUserId: string }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(user.roleName ?? "staff");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const isSelf = user.id === currentUserId;

  function save() {
    startTransition(async () => {
      const r = await updateStaffRole(user.id, selected);
      if (r.error) { setMsg({ text: r.error, ok: false }); }
      else { setMsg({ text: "Role updated", ok: true }); setEditing(false); setTimeout(() => setMsg(null), 3000); }
    });
  }

  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
        <div style={{ fontWeight: 600, color: C.ink, fontSize: 13.5 }}>{user.full_name || "—"}</div>
        {isSelf && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>You</div>}
      </td>
      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
        {editing ? (
          <select value={selected} onChange={e => setSelected(e.target.value)}
            style={{ ...inputStyle, width: "auto", padding: "5px 10px", fontSize: 13 }}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <RoleBadge role={user.roleName} />
        )}
      </td>
      <td style={{ padding: "13px 16px", verticalAlign: "middle", color: C.muted, fontSize: 13 }}>
        {user.email ?? "—"}
      </td>
      <td style={{ padding: "13px 16px", verticalAlign: "middle", color: C.muted, fontSize: 13 }}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
      </td>
      <td style={{ padding: "13px 16px", verticalAlign: "middle", textAlign: "right" }}>
        {isSelf ? (
          <span style={{ fontSize: 12, color: C.muted }}>—</span>
        ) : editing ? (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button onClick={save} disabled={pending}
              style={{ background: C.green, color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setSelected(user.roleName ?? "staff"); }}
              style={{ background: C.bg, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            style={{ background: C.greenWash, color: C.greenDark, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Edit role
          </button>
        )}
        {msg && (
          <div style={{ fontSize: 11.5, marginTop: 4, color: msg.ok ? C.greenDark : "#b3402f" }}>{msg.text}</div>
        )}
      </td>
    </tr>
  );
}

function InviteForm() {
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState("staff");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const r = await inviteStaffMember(fd);
      if (r.error) { setResult({ text: r.error, ok: false }); }
      else { setResult({ text: r.message ?? "Invitation sent!", ok: true }); form.reset(); setRole("staff"); }
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Full name <span style={{ color: "#ef4444" }}>*</span></label>
        <input name="full_name" required placeholder="e.g. Mr. Flo" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Email address <span style={{ color: "#ef4444" }}>*</span></label>
        <input name="email" type="email" required placeholder="staff@example.com" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Role</label>
        <select name="role" value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
          <option value="staff">Teacher / Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {result && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: result.ok ? "rgba(46,168,42,.1)" : "rgba(201,74,58,.1)",
          color: result.ok ? C.greenDark : "#b3402f",
          border: `1px solid ${result.ok ? "rgba(46,168,42,.3)" : "rgba(201,74,58,.3)"}`,
        }}>{result.text}</div>
      )}

      <button type="submit" disabled={pending}
        style={{ background: C.green, color: "#fff", border: "none", borderRadius: 9, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1, fontFamily: "inherit", marginTop: 4 }}>
        {pending ? "Sending…" : "Send invitation"}
      </button>
      <p style={{ fontSize: 12, color: C.muted, marginTop: -4, lineHeight: 1.5 }}>
        They will receive an email with a link to set their password and access the portal.
      </p>
    </form>
  );
}

export function StaffPageClient({ staffUsers, currentUserId }: { staffUsers: StaffUser[]; currentUserId: string }) {
  const C_local = C;

  return (
    <div className="cd-staff-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
      {/* Left — current staff */}
      <div className="cd-card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${C_local.border}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C_local.ink }}>Current staff accounts</h2>
          <p style={{ fontSize: 13, color: C_local.muted, marginTop: 3 }}>{staffUsers.length} account{staffUsers.length !== 1 ? "s" : ""}</p>
        </div>
        {staffUsers.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: C_local.muted, fontSize: 13.5 }}>
            No staff accounts yet. Invite someone below.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  {["Name", "Role", "Email", "Joined", "Actions"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i === 4 ? "right" : "left", padding: "10px 16px",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      color: C_local.muted, borderBottom: `1px solid ${C_local.border}`, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffUsers.map(u => (
                  <EditRoleRow key={u.id} user={u} currentUserId={currentUserId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right — invite form */}
      <div className="cd-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C_local.ink, marginBottom: 4 }}>Invite new staff member</h2>
        <p style={{ fontSize: 13, color: C_local.muted, marginBottom: 20 }}>They'll get an email to set their password.</p>
        <InviteForm />
      </div>
    </div>
  );
}
