"use client";

import { useState, useTransition } from "react";
import { markMessageRead, markNotificationsRead } from "@/app/dashboard/actions/index";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#94a3b8",
  border: "#e2e8f0", surface: "#fff", bg: "#f8fafc",
  green: "#16a34a", greenLight: "#f0fdf4", greenMid: "#dcfce7", greenDark: "#166534",
  card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " at " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function waPhone(phone: string) { return phone.replace(/\D/g, ""); }

type ContactMessage = {
  id: string; name: string; email: string; phone: string | null;
  message: string; read: boolean; created_at: string;
};
type SysNotification = {
  id: string; type: string | null; title: string; body: string | null;
  link: string | null; is_read: boolean; created_at: string;
};

const NOTIF_TYPE_STYLE: Record<string, { bg: string; fg: string; icon: string }> = {
  registration: { bg: "#dcfce7", fg: "#166534", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
  payment:      { bg: "#fef9c3", fg: "#854d0e", icon: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01" },
  message:      { bg: "#dbeafe", fg: "#1e3a8a", icon: "M4 4h16v16H4z M22 6l-10 7L2 6" },
  default:      { bg: "#f1f5f9", fg: S.sub, icon: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7" },
};

function NotifIcon({ type, size = 18 }: { type: string | null; size?: number }) {
  const s = NOTIF_TYPE_STYLE[type ?? "default"] ?? NOTIF_TYPE_STYLE.default;
  const paths = s.icon.split(" M").map((seg, i) => i === 0 ? seg : "M" + seg);
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => <path key={i} d={p} />)}
      </svg>
    </div>
  );
}

function ContactMessageRow({ msg, onMarkRead }: { msg: ContactMessage; onMarkRead: (id: string, read: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();

  function handleExpand() {
    setExpanded(v => !v);
    if (!msg.read) {
      startTransition(async () => {
        await markMessageRead(msg.id, true);
        onMarkRead(msg.id, true);
      });
    }
  }

  const wa = msg.phone ? waPhone(msg.phone) : null;
  const waReply = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${msg.name}, thank you for contacting Cedar Training Center.`)}`
    : null;

  return (
    <div style={{
      borderBottom: `1px solid ${S.border}`,
      background: msg.read ? S.surface : "#eff6ff",
      borderLeft: `3px solid ${msg.read ? "transparent" : "#3b82f6"}`,
      transition: "background .2s",
    }}>
      <div onClick={handleExpand} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", cursor: "pointer" }}>
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13.5, flexShrink: 0 }}>
          {msg.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: msg.read ? 600 : 800, color: S.ink }}>{msg.name}</span>
              <span style={{ fontSize: 12, color: S.muted, marginLeft: 10 }}>{msg.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 11.5, color: S.muted, whiteSpace: "nowrap" }}>{fmtDate(msg.created_at)}</span>
              {!msg.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "block", flexShrink: 0 }} />}
            </div>
          </div>
          <p style={{ fontSize: 13, color: expanded ? S.sub : S.muted, lineHeight: 1.5, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
            {msg.message}
          </p>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "4px 20px 16px 74px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: S.bg, borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 13.5, color: S.ink, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{msg.message}</p>
          </div>
          <div style={{ fontSize: 12, color: S.muted }}>{fmtFullDate(msg.created_at)}{msg.phone ? ` · ${msg.phone}` : ""}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`mailto:${msg.email}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 9, background: "#eff6ff", color: "#1d4ed8", textDecoration: "none" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>
              Reply by email
            </a>
            {waReply && (
              <a href={waReply} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 9, background: "#dcfce7", color: "#166534", textDecoration: "none" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Reply on WhatsApp
              </a>
            )}
            <button
              onClick={e => { e.stopPropagation(); startTransition(async () => { await markMessageRead(msg.id, !msg.read); onMarkRead(msg.id, !msg.read); }); }}
              style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 9, border: `1px solid ${S.border}`, background: S.surface, cursor: "pointer", color: S.sub, fontFamily: "inherit" }}>
              {msg.read ? "Mark unread" : "Mark as read"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SysNotifRow({ notif }: { notif: SysNotification }) {
  const s = NOTIF_TYPE_STYLE[notif.type ?? "default"] ?? NOTIF_TYPE_STYLE.default;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
      borderBottom: `1px solid ${S.border}`,
      background: notif.is_read ? S.surface : "#f0fdf4",
      borderLeft: `3px solid ${notif.is_read ? "transparent" : S.green}`,
    }}>
      <NotifIcon type={notif.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: notif.is_read ? 600 : 700, color: S.ink }}>{notif.title}</span>
          <span style={{ fontSize: 11.5, color: S.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{fmtDate(notif.created_at)}</span>
        </div>
        {notif.body && <p style={{ fontSize: 13, color: S.sub, marginTop: 4, lineHeight: 1.5 }}>{notif.body}</p>}
        {notif.link && (
          <a href={notif.link} style={{ fontSize: 12.5, color: s.fg, fontWeight: 700, textDecoration: "none", marginTop: 6, display: "inline-block" }}>
            View details →
          </a>
        )}
      </div>
      {!notif.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: S.green, flexShrink: 0, marginTop: 6 }} />}
    </div>
  );
}

type Tab = "notifications" | "messages";

export function MessagesClient({
  messages: initialMessages,
  notifications: initialNotifications,
}: {
  messages: ContactMessage[];
  notifications: SysNotification[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [tab, setTab] = useState<Tab>(initialNotifications.length > 0 ? "notifications" : "messages");
  const [, startTransition] = useTransition();

  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  function handleMarkRead(id: string, read: boolean) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
  }

  function markAllNotifsRead() {
    startTransition(async () => {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px",
    borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
    border: "none", fontFamily: "inherit", transition: "all .15s",
    background: active ? S.green : "transparent",
    color: active ? "#fff" : S.sub,
  });

  return (
    <div style={{ padding: "36px 30px 70px", background: S.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: S.ink }}>Inbox</h1>
        <p style={{ fontSize: 14, color: S.sub, marginTop: 6 }}>
          System notifications and public contact-form messages.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px", background: "#f1f5f9", borderRadius: 14, marginBottom: 20, width: "fit-content" }}>
        <button style={tabStyle(tab === "notifications")} onClick={() => setTab("notifications")}>
          Notifications
          {unreadNotifs > 0 && (
            <span style={{ background: tab === "notifications" ? "rgba(255,255,255,.3)" : S.green, color: "#fff", fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 20 }}>
              {unreadNotifs}
            </span>
          )}
        </button>
        <button style={tabStyle(tab === "messages")} onClick={() => setTab("messages")}>
          Contact Messages
          {unreadMessages > 0 && (
            <span style={{ background: tab === "messages" ? "rgba(255,255,255,.3)" : "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 20 }}>
              {unreadMessages}
            </span>
          )}
        </button>
      </div>

      {/* ── Notifications tab ─────────────────────────────── */}
      {tab === "notifications" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: S.muted }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}{unreadNotifs > 0 ? ` · ${unreadNotifs} unread` : ""}
            </span>
            {unreadNotifs > 0 && (
              <button onClick={markAllNotifsRead}
                style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 9, border: `1px solid ${S.border}`, background: S.surface, cursor: "pointer", color: S.sub, fontFamily: "inherit" }}>
                Mark all read
              </button>
            )}
          </div>

          {!notifications.length ? (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "60px 32px", textAlign: "center", boxShadow: S.card }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: S.greenLight, color: S.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: S.ink, marginBottom: 8 }}>No notifications</h3>
              <p style={{ fontSize: 14, color: S.sub }}>
                Notifications will appear here when students register, payments are made, or other events occur.
              </p>
            </div>
          ) : (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden", boxShadow: S.card }}>
              {notifications.map(n => <SysNotifRow key={n.id} notif={n} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Contact messages tab ──────────────────────────── */}
      {tab === "messages" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: S.muted }}>
              {messages.length} {messages.length === 1 ? "message" : "messages"}
              {unreadMessages > 0 ? ` · ${unreadMessages} unread` : " · all read"}
            </span>
          </div>

          {!messages.length ? (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "60px 32px", textAlign: "center", boxShadow: S.card }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#dbeafe", color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: S.ink, marginBottom: 8 }}>No messages yet</h3>
              <p style={{ fontSize: 14, color: S.sub, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
                When visitors fill in the contact form on your website, their messages will appear here.
              </p>
            </div>
          ) : (
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden", boxShadow: S.card }}>
              {messages.map(m => (
                <ContactMessageRow key={m.id} msg={m} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
