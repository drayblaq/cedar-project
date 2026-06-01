import React from "react";

const TONES = {
  neutral: { bg: "#eef2ec",              fg: "#4a5a4d" },
  green:   { bg: "rgba(46,168,42,.12)",  fg: "#1a6b18" },
  gold:    { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
  red:     { bg: "rgba(201,74,58,.12)",  fg: "#b3402f" },
  blue:    { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" },
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: t.bg, color: t.fg,
        fontSize: 11.5, fontWeight: 700,
        padding: "3px 10px", borderRadius: 7,
        letterSpacing: "0.01em", whiteSpace: "nowrap", textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}

export function LevelPill({ level }: { level: string }) {
  const order: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
  const hue = 95 + (order[level] ?? 0) * 6;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 30, height: 22, padding: "0 7px", borderRadius: 6,
        fontSize: 11.5, fontWeight: 800,
        background: `oklch(0.93 0.06 ${hue})`,
        color: `oklch(0.40 0.10 ${hue})`,
      }}
    >
      {level}
    </span>
  );
}
