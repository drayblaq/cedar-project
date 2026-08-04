"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILL_LABELS: Record<string, string> = {
  speaking: "Speaking",
  listening: "Listening",
  grammar_vocabulary: "Grammar",
  reading: "Reading",
  writing: "Writing",
  overall: "Overall",
};
const SKILL_COLORS: Record<string, string> = {
  speaking: "#2ea82a",
  listening: "#3f7d8c",
  grammar_vocabulary: "#d4a843",
  reading: "#8c6a3f",
  writing: "#6a3f8c",
  overall: "#b3402f",
};

type AssessmentItem = {
  skill_area: string;
  skill_level: string;
  assessed_at: string;
  academic_terms: { name: string; start_date: string } | null;
};

function levelToNum(level: string): number {
  const idx = CEFR.indexOf(level);
  return idx >= 0 ? idx + 1 : 0;
}
function numToLevel(n: number): string {
  return CEFR[n - 1] ?? "—";
}

export function ProgressGraph({ history }: { history: AssessmentItem[] }) {
  // Group by term name
  const termMap = new Map<string, { termName: string; startDate: string; data: Record<string, number> }>();
  for (const item of history) {
    const termName = item.academic_terms?.name ?? "Unknown";
    const startDate = item.academic_terms?.start_date ?? item.assessed_at;
    if (!termMap.has(termName)) {
      termMap.set(termName, { termName, startDate, data: {} });
    }
    const entry = termMap.get(termName)!;
    entry.data[item.skill_area] = levelToNum(item.skill_level);
  }

  const chartData = Array.from(termMap.values())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(({ termName, data }) => ({ term: termName, ...data }));

  const skillsPresent = Array.from(
    new Set(history.map((h) => h.skill_area))
  );

  if (chartData.length === 0) {
    return (
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16,
        padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: 14,
      }}>
        No assessment history yet. Assess skill levels per term to see progress here.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="term"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[0, 6]}
            ticks={[1, 2, 3, 4, 5, 6]}
            tickFormatter={numToLevel}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : 0;
              return [numToLevel(num), ""];
            }}
            labelStyle={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 11, color: "#475569" }}>{SKILL_LABELS[value] ?? value}</span>}
            iconType="circle"
            iconSize={8}
          />
          {skillsPresent.map((skill) => (
            <Line
              key={skill}
              type="monotone"
              dataKey={skill}
              name={skill}
              stroke={SKILL_COLORS[skill] ?? "#888"}
              strokeWidth={2}
              dot={{ r: 4, fill: SKILL_COLORS[skill] ?? "#888", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
