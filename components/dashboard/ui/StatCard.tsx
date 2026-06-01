import React from "react";

const C = {
  ink: "#16241a", muted: "#687a6c",
  greenWash: "#eef6ec", greenDeep: "#0e3b0c",
};

const TONE_COLORS = {
  green: "#2ea82a",
  gold:  "#bf9636",
  blue:  "#3f7d8c",
  dark:  "#0e3b0c",
} as const;

const ICON_PATHS: Record<string, string> = {
  users:   "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet:  "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
  check:   "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  clock:   "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  layers:  "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  trend:   "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  award:   "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
  megaphone: "M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
  calendar:  "M3 4h18v18H3zM3 9h18 M8 2v4 M16 2v4",
  heart:   "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
};

function SvgIcon({ name, size }: { name: string; size: number }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  const paths = d.split(" M").map((s, i) => (i === 0 ? s : "M" + s));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "green",
  delta,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: keyof typeof TONE_COLORS;
  delta?: number;
}) {
  const color = TONE_COLORS[tone];
  return (
    <div className="cd-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: C.greenWash, color,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgIcon name={icon} size={21} />
        </div>
        {delta != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12,
            fontWeight: 700, color: delta >= 0 ? "#1a8a2a" : "#b3402f" }}>
            <SvgIcon name="trend" size={14} />
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.muted, marginTop: 6 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, opacity: 0.8 }}>{sub}</div>}
      </div>
    </div>
  );
}
