import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OverviewCharts } from "./OverviewCharts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const firstName = ((profile as { full_name?: string | null } | null)?.full_name ?? "").split(" ")[0] || "Admin";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [totalRes, activeRes, pendingRes, paymentsThisMonth, allPayments, recentPaymentsRes, recentStudentsRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("amount").gte("paid_at", startOfMonth).lte("paid_at", endOfMonth + "T23:59:59"),
    supabase.from("payments").select("amount, paid_at").order("paid_at", { ascending: true }),
    supabase.from("payments").select("id, amount, currency, paid_at, students(full_name)").order("paid_at", { ascending: false }).limit(5),
    supabase.from("students").select("id, full_name, email, application_status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

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

  const dayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const APP_BADGE: Record<string, string> = {
    approved:         "bg-green-100 text-green-700",
    rejected:         "bg-red-100 text-red-700",
    awaiting_payment: "bg-orange-100 text-orange-700",
    under_review:     "bg-blue-100 text-blue-700",
    submitted:        "bg-slate-100 text-slate-600",
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">{dayName}, {dateStr}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening at Cedar today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: "Total Students", value: totalRes.count ?? 0, sub: "enrolled",              icon: "👥", color: "blue",   href: "/admin/students" },
          { label: "Active Students", value: activeRes.count ?? 0, sub: "with portal access",   icon: "✅", color: "green",  href: "/admin/students" },
          { label: "Pending Apps",    value: pendingRes.count ?? 0, sub: "awaiting review",      icon: "⏳", color: "amber",  href: "/admin/students" },
          { label: "Revenue — " + now.toLocaleString("default", { month: "short" }), value: revenueThisMonth.toLocaleString(), sub: "FCFA this month", icon: "💰", color: "violet", href: "/admin/payments" },
        ].map(({ label, value, sub, icon, color, href }) => (
          <Link key={href + label} href={href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                color === "blue" ? "bg-blue-50" : color === "green" ? "bg-green-50" : color === "amber" ? "bg-amber-50" : "bg-violet-50"
              }`}>
                {icon}
              </div>
            </div>
            <div className={`mt-4 h-0.5 w-full rounded-full ${
              color === "blue" ? "bg-blue-200" : color === "green" ? "bg-green-200" : color === "amber" ? "bg-amber-200" : "bg-violet-200"
            }`} />
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[
          { href: "/admin/attendance", label: "Mark attendance", icon: "📋" },
          { href: "/admin/grades",     label: "Add grade",       icon: "📊" },
          { href: "/admin/announcements", label: "Announce",     icon: "📢" },
          { href: "/admin/students/new",  label: "Add student",  icon: "➕" },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition">
            <span>{icon}</span> {label}
          </Link>
        ))}
      </div>

      {/* Chart */}
      <OverviewCharts data={chartData} />

      {/* Two-column: recent applications + payments */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent applications */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Applications</h2>
            <Link href="/admin/students" className="text-xs font-medium text-green-600 hover:underline">View all →</Link>
          </div>
          {!(recentStudentsRes.data ?? []).length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No students yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(recentStudentsRes.data ?? []).map((s) => {
                const app = (s as { application_status?: string | null }).application_status ?? "submitted";
                return (
                  <li key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {s.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${APP_BADGE[app] ?? "bg-slate-100 text-slate-600"}`}>
                      {app.replace(/_/g, " ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
            <Link href="/admin/payments" className="text-xs font-medium text-green-600 hover:underline">View all →</Link>
          </div>
          {!(recentPaymentsRes.data ?? []).length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(recentPaymentsRes.data ?? []).map((p) => {
                const student = Array.isArray(p.students) ? p.students[0] : p.students;
                return (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {((student as { full_name?: string } | null)?.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{(student as { full_name?: string } | null)?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                      {Number(p.amount).toLocaleString()} {p.currency}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
