import { createClient } from "@/lib/supabase/server";
import { markMessageRead } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

type Message = { id: string; name: string; email: string; phone: string | null; message: string; read: boolean; created_at: string };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, read, created_at")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as Message[];
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Messages</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
          Contact-form submissions from the public site{unread > 0 ? ` · ${unread} unread` : ""}.
        </p>
      </div>

      {!messages.length ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>No messages yet. Submissions from the contact page will appear here.</p>
        </div>
      ) : (
        <div className="cd-card" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 720 }}>
              <thead>
                <tr>
                  {["From", "Message", "Date", "Status", ""].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 3 ? "center" : "left", padding: "11px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="cd-trow" style={{ background: m.read ? "#fff" : "#f3fbf2" }}>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, verticalAlign: "top" }}>
                      <div style={{ fontWeight: 700, color: C.ink }}>{m.name}</div>
                      <a href={`mailto:${m.email}`} style={{ fontSize: 12, color: C.green, textDecoration: "none" }}>{m.email}</a>
                      {m.phone && <div style={{ fontSize: 12, color: C.muted }}>{m.phone}</div>}
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.ink, maxWidth: 380 }}>
                      <p style={{ lineHeight: 1.55 }}>{m.message}</p>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted, whiteSpace: "nowrap", verticalAlign: "top" }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center", verticalAlign: "top" }}>
                      <span style={{ display: "inline-flex", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 7,
                        background: m.read ? "#eef2ec" : "rgba(46,168,42,.12)", color: m.read ? "#4a5a4d" : "#1a6b18" }}>
                        {m.read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center", verticalAlign: "top" }}>
                      <form action={markMessageRead.bind(null, m.id, !m.read) as unknown as (fd: FormData) => Promise<void>}>
                        <button type="submit" className="cd-mini-btn">{m.read ? "Mark unread" : "Mark read"}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
