/* Cedar — shared dashboard UI components. Exports many to window. */
const { useState } = React;
const Icon = window.Icon;

/* ── Brand mark ── */
function Logo({ light = false, size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <img src="logo.png" alt="Cedar" style={{ width: size, height: size, objectFit: "contain",
        filter: light ? "drop-shadow(0 1px 2px rgba(0,0,0,.25))" : "none" }} />
      <span style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.05, letterSpacing: "-0.01em",
        color: light ? "#fff" : "var(--ink)" }}>
        Cedar <span style={{ color: light ? "var(--green-bright)" : "var(--green)" }}>Training</span><br />Center
      </span>
    </div>);

}

/* ── Avatar ── */
function Avatar({ name, size = 38 }) {
  const C = window.CEDAR;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: C.avatarColor(name), color: "#fff", display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, letterSpacing: "0.02em" }}>
      {C.initials(name)}
    </div>);

}

/* ── Badge ── */
function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#eef2ec", fg: "#4a5a4d" },
    green: { bg: "rgba(46,168,42,.12)", fg: "#1a6b18" },
    gold: { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
    red: { bg: "rgba(201,74,58,.12)", fg: "#b3402f" },
    blue: { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" }
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: t.bg, color: t.fg,
      fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7, letterSpacing: "0.01em",
      whiteSpace: "nowrap" }}>{children}</span>);

}

/* ── Level pill (A1..C2) ── */
function LevelPill({ level }) {
  const order = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
  const hue = 95 + (order[level] || 0) * 6;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30,
      height: 22, padding: "0 7px", borderRadius: 6, fontSize: 11.5, fontWeight: 800,
      background: `oklch(0.93 0.06 ${hue})`, color: `oklch(0.40 0.10 ${hue})` }}>{level}</span>);

}

/* ── Card ── */
function Card({ children, style = {}, pad = 22, className = "" }) {
  return (
    <div className={"card " + className} style={{ background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: pad, ...style }}>{children}</div>);

}

/* ── Stat card ── */
function StatCard({ icon, label, value, sub, tone = "green", delta }) {
  const tones = {
    green: "var(--green)", gold: "#bf9636", blue: "#3f7d8c", dark: "var(--green-deep)"
  };
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--green-wash)",
          color: tones[tone], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={21} />
        </div>
        {delta != null &&
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700,
          color: delta >= 0 ? "#1a8a2a" : "#b3402f" }}>
            <Icon name="trend" size={14} stroke={2.4} />{delta >= 0 ? "+" : ""}{delta}%
          </span>
        }
      </div>
      <div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 6 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3, opacity: .8 }}>{sub}</div>}
      </div>
    </Card>);

}

/* ── Section header ── */
function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</h1>
        {sub && <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>{sub}</p>}
      </div>
      {action}
    </div>);

}

/* ── Bar chart (vertical) ── */
function BarChart({ data, valueKey, labelKey, height = 180, format = (v) => v, accent = "var(--green)" }) {
  const max = Math.max(...data.map((d) => d[valueKey])) * 1.12;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = d[valueKey] / max * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div title={format(d[valueKey])} style={{ width: "72%", maxWidth: 46, height: h + "%", minHeight: 4,
                background: i === data.length - 1 ? accent : "var(--green-soft)",
                borderRadius: "7px 7px 3px 3px", transition: "height .5s cubic-bezier(.16,1,.3,1)",
                position: "relative" }}>
                <span style={{ position: "absolute", top: -19, left: 0, right: 0, textAlign: "center",
                  fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>{format(d[valueKey])}</span>
              </div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{d[labelKey]}</span>
          </div>);

      })}
    </div>);

}

/* ── Line / area chart ── */
function LineChart({ data, valueKey, labelKey, height = 190, format = (v) => v }) {
  const w = 520,h = height,padX = 14,padY = 24;
  const vals = data.map((d) => d[valueKey]);
  const min = Math.min(...vals) * 0.9,max = Math.max(...vals) * 1.05;
  const x = (i) => padX + i / (data.length - 1) * (w - padX * 2);
  const y = (v) => padY + (1 - (v - min) / (max - min)) * (h - padY * 2);
  const pts = data.map((d, i) => [x(i), y(d[valueKey])]);
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  const area = line + ` L${x(data.length - 1)} ${h - padY} L${x(0)} ${h - padY} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, overflow: "visible" }}>
      <defs>
        <linearGradient id="cedarArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g, i) =>
      <line key={i} x1={padX} x2={w - padX} y1={padY + g * (h - padY * 2)} y2={padY + g * (h - padY * 2)}
      stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />
      )}
      <path d={area} fill="url(#cedarArea)" />
      <path d={line} fill="none" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) =>
      <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="#fff" stroke="var(--green)" strokeWidth="2.6" />
          <text x={p[0]} y={p[1] - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">{format(data[i][valueKey])}</text>
          <text x={p[0]} y={h - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--muted)">{data[i][labelKey]}</text>
        </g>
      )}
    </svg>);

}

/* ── Ring / progress dial ── */
function Ring({ value, size = 116, stroke = 11, label, color = "var(--green)" }) {
  const r = (size - stroke) / 2,c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--green-wash)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .7s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{value}%</span>
        {label && <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--muted)", marginTop: 1 }}>{label}</span>}
      </div>
    </div>);

}

/* ── Simple data table ── */
function Table({ columns, rows, renderCell }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>
            {columns.map((c) =>
            <th key={c.key} style={{ textAlign: c.align || "left", padding: "11px 14px", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)",
              borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c.label}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) =>
          <tr key={ri} className="trow">
              {columns.map((c) =>
            <td key={c.key} style={{ padding: "12px 14px", textAlign: c.align || "left",
              borderBottom: "1px solid var(--border)", color: "var(--ink)", verticalAlign: "middle" }}>
                  {renderCell ? renderCell(row, c.key) : row[c.key]}
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

/* ── Modal ── */
function Modal({ open, onClose, title, sub, children, footer, width = 480 }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h3>
            {sub && <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} title="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>);

}

/* ── Empty / info note ── */
function Note({ children }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "14px 16px", marginTop: 16,
      background: "var(--green-wash)", border: "1px solid var(--green-soft)", borderRadius: 12 }}>
      <span style={{ color: "var(--green)", marginTop: 1 }}><Icon name="sparkles" size={17} /></span>
      <span style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.6 }}>{children}</span>
    </div>);

}

Object.assign(window, {
  Logo, Avatar, Badge, LevelPill, Card, StatCard, SectionHead,
  BarChart, LineChart, Ring, Table, Note, Modal
});