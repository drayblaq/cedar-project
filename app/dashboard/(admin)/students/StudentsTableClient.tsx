"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ResendInviteButton } from "./ResendInviteButton";
import { AdmissionActions } from "./AdmissionActions";

type Student = {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  user_id: string | null;
  status: string | null;
  application_status: string | null;
  last_invite_sent_at: string | null;
  levels: { name?: string } | { name?: string }[] | null;
};

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  pending:  "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-500",
};

const APP_BADGE: Record<string, string> = {
  approved:         "bg-green-100 text-green-700",
  rejected:         "bg-red-100 text-red-700",
  awaiting_payment: "bg-orange-100 text-orange-700",
  under_review:     "bg-blue-100 text-blue-700",
  submitted:        "bg-slate-100 text-slate-600",
};

const STATUS_FILTERS = ["All", "Pending", "Active", "Inactive"] as const;

export function StudentsTableClient({
  students,
  bestTestPct,
  paidStudentIds,
}: {
  students: Student[];
  bestTestPct: Record<string, number>;
  paidStudentIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const paid = useMemo(() => new Set(paidStudentIds), [paidStudentIds]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return students.filter((s) => {
      const matchesQuery = !q || s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || (s.status ?? "pending").toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  function levelName(l: Student["levels"]) {
    if (!l) return "—";
    return Array.isArray(l) ? (l[0] as { name?: string })?.name ?? "—" : (l as { name?: string })?.name ?? "—";
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                statusFilter === f ? "bg-green-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} of {students.length}</span>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 font-semibold text-slate-600">No students match</p>
          <button type="button" onClick={() => { setQuery(""); setStatusFilter("All"); }}
            className="mt-3 text-sm font-medium text-green-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Level</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Admission</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Test</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Login</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const hasPayment = paid.has(s.id);
                const hasLogin = !!s.user_id;
                const canInvite = hasPayment && !hasLogin && s.status === "active";
                const displayName = s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.full_name;
                const app = s.application_status ?? "submitted";
                const enrollStatus = s.status ?? "pending";
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{displayName}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 hidden md:table-cell">{levelName(s.levels)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize whitespace-nowrap ${APP_BADGE[app] ?? "bg-slate-100 text-slate-600"}`}>
                        {app.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">
                      {bestTestPct[s.id] != null ? `${bestTestPct[s.id]}%` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[enrollStatus] ?? "bg-slate-100 text-slate-600"}`}>
                        {enrollStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {hasLogin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          ✓ Active
                        </span>
                      ) : canInvite ? (
                        <ResendInviteButton studentId={s.id} lastInviteSentAt={s.last_invite_sent_at ?? null} />
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/${s.id}/application`}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition">
                          View
                        </Link>
                        <Link href={`/admin/students/${s.id}/edit`}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition">
                          Edit
                        </Link>
                        {enrollStatus === "pending" && app !== "rejected" && (
                          <AdmissionActions studentId={s.id} applicationStatus={app} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
