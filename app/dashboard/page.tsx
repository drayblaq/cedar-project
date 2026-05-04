import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OverviewCharts } from "./OverviewCharts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [studentsRes, paymentsRes, attendanceRes, paymentsThisMonth, allPayments] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("id", { count: "exact", head: true }),
    supabase.from("attendance").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount").gte("paid_at", startOfMonth).lte("paid_at", endOfMonth + "T23:59:59"),
    supabase.from("payments").select("amount, paid_at").order("paid_at", { ascending: true }),
  ]);

  const totalStudents = studentsRes.count ?? 0;
  const totalPayments = paymentsRes.count ?? 0;
  const totalAttendance = attendanceRes.count ?? 0;
  const revenueThisMonth = (paymentsThisMonth.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const byMonth: Record<string, { total: number; count: number }> = {};
  for (const p of allPayments.data ?? []) {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
    byMonth[key].total += Number(p.amount);
    byMonth[key].count += 1;
  }
  const chartData = Object.entries(byMonth)
    .slice(-6)
    .map(([month, v]) => ({ month, total: v.total, count: v.count }));

  const { data: recentPayments } = await supabase
    .from("payments")
    .select("id, amount, currency, paid_at, students(full_name)")
    .order("paid_at", { ascending: false })
    .limit(5);

  const statCards = [
    { label: "Total students", value: totalStudents, href: "/admin/students", accent: "stat-accent-emerald" },
    { label: "Payments recorded", value: totalPayments, href: "/admin/payments", accent: "stat-accent-amber" },
    { label: "Attendance records", value: totalAttendance, href: "/admin/attendance", accent: "stat-accent-sky" },
    { label: "Revenue this month (XOF)", value: revenueThisMonth.toLocaleString(), href: "/admin/payments", accent: "border-l-4 border-l-violet-500" },
  ];

  return (
    <div className="px-4 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Overview
      </h1>
      <p className="mt-2 text-slate-600">
        Manage students, payments, attendance, grades, and calendar.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, href, accent }) => (
          <Link
            key={href + label}
            href={href}
            className={`card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800/50 ${accent}`}
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </Link>
        ))}
      </div>

      <OverviewCharts data={chartData} />

      {recentPayments && recentPayments.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent payments
          </h2>
          <ul className="mt-4 space-y-3">
            {recentPayments.map((p) => {
                const student = Array.isArray(p.students) ? p.students[0] : p.students;
                return (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {(student as { full_name?: string } | null)?.full_name ?? "—"}
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {p.amount} {p.currency}
                  </span>
                </li>
              );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
