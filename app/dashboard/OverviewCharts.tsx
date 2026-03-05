"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type PaymentMonth = { month: string; total: number; count: number };

export function OverviewCharts({ data }: { data: PaymentMonth[] }) {
  if (!data?.length) return null;
  return (
    <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 className="text-lg font-bold text-slate-900">Revenue by month</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number | undefined) => [value ?? 0, "XOF"]} />
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} name="Total (XOF)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
