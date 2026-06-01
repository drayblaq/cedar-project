"use client";

/**
 * Cedar dashboard shared UI primitives — ported from cedar-dashboards prototype.
 * All components are client-side so they can be used anywhere.
 */

import { useState, useEffect, useRef } from "react";

// ── Color helpers ──────────────────────────────────────────────────────────────
export const CEDAR_COLORS = {
  green:       "#2ea82a",
  greenBright: "#6fdc6a",
  greenDeep:   "#0e3b0c",
  greenDark:   "#1a6b18",
  greenWash:   "#eef6ec",
  greenSoft:   "#d3ead0",
  ink:         "#16241a",
  muted:       "#687a6c",
  border:      "#e6ece4",
  surface:     "#ffffff",
  bg:          "#f4f7f2",
};

const AVATAR_PALETTE = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// ── SVG Icon ──────────────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  grid:     "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users:    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet:   "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  check:    "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  chart:    "M3 3v18h18 M7 14l3-4 4 3 5-7",
  award:    "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
  megaphone:"M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
  calendar: "M3 4h18v18H3zM3 9h18 M8 2v4 M16 2v4",
  layers:   "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  clock:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  trend:    "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  search:   "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  chevronD: "M6 9l6 6 6-6",
  chevronR: "M9 6l6 6-6 6",
  arrowR:   "M5 12h14 M12 5l7 7-7 7",
  plus:     "M12 5v14 M5 12h14",
  pin:      "M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail:     "M4 4h16v16H4z M22 6l-10 7L2 6",
  phone:    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z",
  doc:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  sparkles: "M12 3l1.9 4.8L19 9.6l-4.8 1.9L12 16l-1.9-4.5L5 9.6l4.8-1.8z M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  x:        "M18 6L6 18 M6 6l12 12",
  home:     "M3 10.5L12 3l9 7.5 M5 9.5V21h14V9.5",
  book:     "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z",
};

export function Icon({ name, size = 20, stroke = 2, color = "currentColor", style: extraStyle = {} }: {
  name: string; size?: number; stroke?: number; color?: string; style?: React.CSSProperties;
}) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  const paths = d.split(" M").map((seg, i) => (i === 0 ? seg : "M" + seg));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...extraStyle }} aria-hidden>
      {paths.map((pd, i) => <path key={i} d={pd} />)}
    </svg>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: avatarColor(name), color: "#fff", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: "0.02em",
    }}>
      {initials(name)}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
type BadgeTone = "neutral" | "green" | "gold" | "red" | "blue";
const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: "#eef2ec", fg: "#4a5a4d" },
  green:   { bg: "rgba(46,168,42,.12)", fg: "#1a6b18" },
  gold:    { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
  red:     { bg: "rgba(201,74,58,.12)", fg: "#b3402f" },
  blue:    { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" },
};
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone] ?? BADGE_TONES.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg,
      fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7,
      letterSpacing: "0.01em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ── Level pill ─────────────────────────────────────────────────────────────────
export function LevelPill({ level }: { level: string }) {
  const order: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
  const hue = 95 + (order[level] ?? 0) * 6;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 30, height: 22, padding: "0 7px", borderRadius: 6,
      fontSize: 11.5, fontWeight: 800,
      background: `oklch(0.93 0.06 ${hue})`, color: `oklch(0.40 0.10 ${hue})`,
    }}>{level}</span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, pad = 22 }: {
  children: React.ReactNode; style?: React.CSSProperties; pad?: number;
}) {
  return (
    <div className="cd-card" style={{ padding: pad, ...style }}>
      {children}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
type StatTone = "green" | "gold" | "blue" | "dark";
export function StatCard({ icon, label, value, sub, tone = "green", delta }: {
  icon: string; label: string; value: React.ReactNode; sub?: string;
  tone?: StatTone; delta?: number;
}) {
  const toneColors: Record<StatTone, string> = {
    green: CEDAR_COLORS.green, gold: "#bf9636", blue: "#3f7d8c", dark: CEDAR_COLORS.greenDeep,
  };
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: CEDAR_COLORS.greenWash, color: toneColors[tone],
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={21} />
        </div>
        {delta != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700,
            color: delta >= 0 ? "#1a8a2a" : "#b3402f" }}>
            <Icon name="trend" size={14} stroke={2.4} />
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: CEDAR_COLORS.ink, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: CEDAR_COLORS.muted, marginTop: 6 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: CEDAR_COLORS.muted, marginTop: 3, opacity: 0.8 }}>{sub}</div>}
      </div>
    </Card>
  );
}

// ── Section head ───────────────────────────────────────────────────────────────
export function SectionHead({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: CEDAR_COLORS.ink }}>{title}</h1>
        {sub && <p style={{ fontSize: 13.5, color: CEDAR_COLORS.muted, marginTop: 4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Simple data table ──────────────────────────────────────────────────────────
export interface TableColumn { key: string; label: string; align?: "left" | "center" | "right" }
export function DataTable({ columns, rows, renderCell }: {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  renderCell?: (row: Record<string, unknown>, key: string) => React.ReactNode;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                textAlign: c.align ?? "left", padding: "11px 14px",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: CEDAR_COLORS.muted, borderBottom: `1px solid ${CEDAR_COLORS.border}`, whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="cd-trow">
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: "12px 14px", textAlign: c.align ?? "left",
                  borderBottom: `1px solid ${CEDAR_COLORS.border}`,
                  color: CEDAR_COLORS.ink, verticalAlign: "middle",
                }}>
                  {renderCell ? renderCell(row, c.key) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, sub, children, footer, width = 480 }: {
  open: boolean; onClose: () => void; title: string; sub?: string;
  children: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="cd-modal-backdrop" onClick={onClose}>
      <div className="cd-modal-card" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="cd-modal-head">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: CEDAR_COLORS.ink, letterSpacing: "-0.01em" }}>{title}</h3>
            {sub && <p style={{ fontSize: 12.5, color: CEDAR_COLORS.muted, marginTop: 3 }}>{sub}</p>}
          </div>
          <button className="cd-icon-btn" onClick={onClose} title="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="cd-modal-body">{children}</div>
        {footer && <div className="cd-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="cd-toast">
      <span style={{ color: CEDAR_COLORS.greenBright, display: "flex" }}>
        <Icon name="check" size={17} />
      </span>
      {message}
    </div>
  );
}

// ── Note ───────────────────────────────────────────────────────────────────────
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "14px 16px", marginTop: 16,
      background: CEDAR_COLORS.greenWash, border: `1px solid ${CEDAR_COLORS.greenSoft}`, borderRadius: 12 }}>
      <span style={{ color: CEDAR_COLORS.green, marginTop: 1 }}>
        <Icon name="sparkles" size={17} />
      </span>
      <span style={{ fontSize: 12.5, color: CEDAR_COLORS.ink, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}

// ── Ring (progress dial) ───────────────────────────────────────────────────────
export function Ring({ value, size = 116, stroke = 11, label, color = CEDAR_COLORS.green }: {
  value: number; size?: number; stroke?: number; label?: string; color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={CEDAR_COLORS.greenWash} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: CEDAR_COLORS.ink, letterSpacing: "-0.02em" }}>
          {value}%
        </span>
        {label && <span style={{ fontSize: 10.5, fontWeight: 600, color: CEDAR_COLORS.muted, marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
export function BarChart({ data, valueKey, labelKey, height = 180, accent = CEDAR_COLORS.green }: {
  data: Record<string, unknown>[]; valueKey: string; labelKey: string;
  height?: number; accent?: string;
}) {
  const vals = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...vals) * 1.12;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = (vals[i] / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "72%", maxWidth: 46, height: h + "%", minHeight: 4,
                background: i === data.length - 1 ? accent : CEDAR_COLORS.greenSoft,
                borderRadius: "7px 7px 3px 3px", position: "relative" }}>
                <span style={{ position: "absolute", top: -19, left: 0, right: 0, textAlign: "center",
                  fontSize: 10.5, fontWeight: 700, color: CEDAR_COLORS.muted }}>{vals[i]}</span>
              </div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: CEDAR_COLORS.muted }}>
              {String(d[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Line chart ─────────────────────────────────────────────────────────────────
export function LineChart({ data, valueKey, labelKey, height = 190 }: {
  data: Record<string, unknown>[]; valueKey: string; labelKey: string; height?: number;
}) {
  const w = 520, padX = 14, padY = 24;
  const vals = data.map((d) => Number(d[valueKey]) || 0);
  const min = Math.min(...vals) * 0.9, max = Math.max(...vals) * 1.05;
  const x = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2);
  const y = (v: number) => padY + (1 - (v - min) / (max - min)) * (height - padY * 2);
  const pts = vals.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  const area = line + ` L${x(data.length - 1)} ${height - padY} L${x(0)} ${height - padY} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height, overflow: "visible" }}>
      <defs>
        <linearGradient id="cedarArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CEDAR_COLORS.green} stopOpacity="0.22" />
          <stop offset="100%" stopColor={CEDAR_COLORS.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g, i) => (
        <line key={i} x1={padX} x2={w - padX}
          y1={padY + g * (height - padY * 2)} y2={padY + g * (height - padY * 2)}
          stroke={CEDAR_COLORS.border} strokeWidth="1" strokeDasharray="3 4" />
      ))}
      <path d={area} fill="url(#cedarArea)" />
      <path d={line} fill="none" stroke={CEDAR_COLORS.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="#fff" stroke={CEDAR_COLORS.green} strokeWidth="2.6" />
          <text x={p[0]} y={p[1] - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill={CEDAR_COLORS.ink}>
            {vals[i]}
          </text>
          <text x={p[0]} y={height - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={CEDAR_COLORS.muted}>
            {String(data[i][labelKey])}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Topbar (used inside main content area) ────────────────────────────────────
export function Topbar({ userName, onSignOut }: { userName: string; onSignOut?: () => void }) {
  return (
    <div className="cd-topbar">
      <div className="cd-search" style={{ maxWidth: 300, flex: 1 }}>
        <Icon name="search" size={17} />
        <input placeholder="Search…" />
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <button className="cd-icon-btn" title="Notifications" style={{ position: "relative" }}>
          <Icon name="megaphone" size={17} />
          <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: "50%",
            background: "#e0533f", border: "1.5px solid #fff" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={userName} size={34} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: CEDAR_COLORS.ink, whiteSpace: "nowrap" }}>{userName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Form field helper component ────────────────────────────────────────────────
export function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="cd-fld">
      <span>{label}</span>
      {children}
    </label>
  );
}
