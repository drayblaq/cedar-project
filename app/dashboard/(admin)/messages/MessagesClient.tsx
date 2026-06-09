"use client";

import { useState, useTransition } from "react";
import { markMessageRead } from "@/app/dashboard/actions/index";

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function waPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

type Message = { id: string; name: string; email: string; phone: string | null; message: string; read: boolean; created_at: string };

function MessageRow({ msg, onMarkRead }: { msg: Message; onMarkRead: (id: string, read: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();

  function handleExpand() {
    setExpanded((v) => !v);
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
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        borderLeft: msg.read ? "3px solid transparent" : "3px solid #3b82f6",
        background: msg.read ? "#fff" : "#f3f8ff",
        transition: "background 0.2s",
      }}
    >
      {/* Summary row — click to expand */}
      <div
        onClick={handleExpand}
        style={{ display: "grid", gridTemplateColumns: "2fr 3fr 1fr auto", gap: 12, padding: "13px 16px", cursor: "pointer", alignItems: "center" }}
      >
        <div>
          <div style={{ fontWeight: msg.read ? 600 : 800, color: C.ink, fontSize: 13.5 }}>{msg.name}</div>
          <a href={`mailto:${msg.email}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, color: C.green, textDecoration: "none" }}>{msg.email}</a>
          {msg.phone && (
            <div>
              <a
                href={`https://wa.me/${wa}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 12, color: "#25d366", textDecoration: "none" }}
              >
                {msg.phone}
              </a>
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
          {msg.message}
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(msg.created_at)}</div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 7, whiteSpace: "nowrap",
          background: msg.read ? "#eef2ec" : "rgba(46,168,42,.12)", color: msg.read ? "#4a5a4d" : "#1a6b18" }}>
          {msg.read ? "Read" : "Unread"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 16px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{msg.message}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`mailto:${msg.email}`} style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", textDecoration: "none" }}>
              Reply by email
            </a>
            {waReply && (
              <a href={waReply} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 8, background: "#dcfce7", color: "#166534", textDecoration: "none" }}>
                Reply on WhatsApp
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); startTransition(async () => { await markMessageRead(msg.id, !msg.read); onMarkRead(msg.id, !msg.read); }); }}
              style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", color: C.muted }}
            >
              {msg.read ? "Mark unread" : "Mark read"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MessagesClient({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initial);
  const unread = messages.filter((m) => !m.read).length;

  function handleMarkRead(id: string, read: boolean) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read } : m));
  }

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18, display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Messages</h1>
        {unread > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 7, background: "rgba(59,130,246,.12)", color: "#1d4ed8" }}>
            {unread} unread
          </span>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: C.muted, marginTop: -10, marginBottom: 18 }}>
        Contact-form submissions from the public site. Click a row to expand.
      </p>

      {!messages.length ? (
        <div className="cd-card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>No messages yet.</p>
        </div>
      ) : (
        <div className="cd-card" style={{ padding: 0, overflow: "hidden" }}>
          {messages.map((m) => (
            <MessageRow key={m.id} msg={m} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
}
