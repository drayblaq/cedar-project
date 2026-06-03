"use client";

import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ── Revenue trend (area/line chart matching prototype) ────────────────────────
export function RevenueTrendChart({ data }: { data: { month: string; total: number }[] }) {
  if (!data?.length) return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#687a6c", fontSize: 13 }}>
      No data yet
    </div>
  );

  function fmtK(v: number) { return Math.round(v / 1000) + "k"; }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cedarAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ea82a" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#2ea82a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="#e6ece4" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "#687a6c" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fontWeight: 600, fill: "#687a6c" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          formatter={(v: unknown) => [fmtK(v as number) + " FCFA", "Revenue"]}
          contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 10, border: "1px solid #e6ece4", color: "#16241a" }}
          cursor={{ stroke: "#2ea82a", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area type="monotone" dataKey="total" stroke="#2ea82a" strokeWidth={2.6}
          fill="url(#cedarAreaGrad)" dot={{ r: 4.5, fill: "#fff", stroke: "#2ea82a", strokeWidth: 2.6 }}
          activeDot={{ r: 6, fill: "#2ea82a" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Students by level (vertical bar chart matching prototype) ─────────────────
export function LevelBarChart({ data }: { data: { level: string; count: number }[] }) {
  if (!data?.length) return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#687a6c", fontSize: 13 }}>
      No data yet
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="level" tick={{ fontSize: 11, fontWeight: 700, fill: "#687a6c" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#687a6c" }} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          formatter={(v: unknown) => [v as number, "Students"]}
          contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 10, border: "1px solid #e6ece4", color: "#16241a" }}
          cursor={{ fill: "#eef6ec" }}
        />
        <Bar dataKey="count" radius={[7, 7, 3, 3]}
          fill="#d3ead0"
          label={{ position: "top", fontSize: 10.5, fontWeight: 700, fill: "#687a6c" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Legacy export (keeps existing imports working) ────────────────────────────
export function OverviewCharts({ data }: { data: { month: string; total: number; count: number }[] }) {
  return <RevenueTrendChart data={data} />;
}
