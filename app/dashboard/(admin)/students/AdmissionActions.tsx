"use client";

import { useState } from "react";
import { setStudentApplicationStatus } from "@/app/dashboard/actions/index";

export function AdmissionActions({
  studentId,
  applicationStatus,
}: {
  studentId: string;
  applicationStatus: string | null;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const status = applicationStatus ?? "submitted";

  async function run(
    key: string,
    next: "approved" | "rejected" | "awaiting_payment" | "under_review"
  ) {
    setLoading(key);
    setMsg(null);
    const r = await setStudentApplicationStatus(studentId, next);
    setLoading(null);
    if (r.error) setMsg({ type: "err", text: r.error });
    else setMsg({ type: "ok", text: "Updated" });
  }

  if (status === "rejected") {
    return <span className="text-xs text-slate-400">Rejected</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => run("ap", "approved")}
          className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading === "ap" ? "…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => run("aw", "awaiting_payment")}
          className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
        >
          {loading === "aw" ? "…" : "Awaiting payment"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => run("rj", "rejected")}
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
        >
          {loading === "rj" ? "…" : "Reject"}
        </button>
      </div>
      {msg && (
        <span className={msg.type === "err" ? "text-xs text-red-600" : "text-xs text-emerald-600"}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
