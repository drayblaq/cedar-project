import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OverviewCharts } from "./OverviewCharts";

function StatCard({
  label, value, sub, href, icon, borderClass, iconBg,
}: {
  label: string; value: string | number; sub: string;
  href: string; icon: React.ReactNode; borderClass: string; iconBg: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-slate-400">{sub}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity group-hover:opacity-20" />
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [
    totalStudentsRes,
    activeStudentsRes,
    pendingStudentsRes,
    paymentsThisMonth,
    allPayments,
    recentPaymentsRes,
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("amount").gte("paid_at", startOfMonth).lte("paid_at", endOfMonth + "T23:59:59"),
    supabase.from("payments").select("amount, paid_at").order("paid_at", { ascending: true }),
    supabase.from("payments").select("id, amount, currency, paid_at, students(full_name)").order("paid_at", { ascending: false }).limit(5),
  ]);

  const totalStudents = totalStudentsRes.count ?? 0;
  const activeStudents = activeStudentsRes.count ?? 0;
  const pendingStudents = pendingStudentsRes.count ?? 0;
  const revenueThisMonth = (paymentsThisMonth.data ?? []).reduce((s, p) => s + Number(p.amount), 0);

  const byMonth: Record<string, { total: number; count: number }> = {};
  for (const p of allPayments.data ?? []) {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
    byMonth[key].total += Number(p.amount);
    byMonth[key].count += 1;
  }
  const chartData = Object.entries(byMonth).slice(-6).map(([month, v]) => ({ month, total: v.total, count: v.count }));

  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="px-4 sm:px-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Admin Dashboard</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-700"
        >
          + Add student
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          value={totalStudents}
          sub="all enrolled students"
          href="/admin/students"
          icon={<span>👥</span>}
          borderClass="border-l-4 border-l-blue-500"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Active students"
          value={activeStudents}
          sub="with portal access"
          href="/admin/students"
          icon={<span>✅</span>}
          borderClass="border-l-4 border-l-emerald-500"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Pending applications"
          value={pendingStudents}
          sub="awaiting review or payment"
          href="/admin/students"
          icon={<span>⏳</span>}
          borderClass="border-l-4 border-l-amber-500"
          iconBg="bg-amber-50"
        />
        <StatCard
          label={`Revenue — ${monthName}`}
          value={revenueThisMonth.toLocaleString()}
          sub="FCFA received this month"
          href="/admin/payments"
          icon={<span>💰</span>}
          borderClass="border-l-4 border-l-violet-500"
          iconBg="bg-violet-50"
        />
      </div>

      {/* Chart */}
      <OverviewCharts data={chartData} />

      {/* Recent payments */}
      {(recentPaymentsRes.data ?? []).length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent payments</h2>
            <Link href="/admin/payments" className="text-sm font-medium text-emerald-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {(recentPaymentsRes.data ?? []).map((p, i) => {
              const student = Array.isArray(p.students) ? p.students[0] : p.students;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < (recentPaymentsRes.data ?? []).length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {((student as { full_name?: string } | null)?.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {(student as { full_name?: string } | null)?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    {Number(p.amount).toLocaleString()} {p.currency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/attendance", label: "Mark attendance", desc: "Record today's class attendance", icon: "📋" },
          { href: "/admin/grades",     label: "Add grades",      desc: "Record scores for students",    icon: "📊" },
          { href: "/admin/announcements", label: "Post announcement", desc: "Notify all students",      icon: "📢" },
        ].map(({ href, label, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
