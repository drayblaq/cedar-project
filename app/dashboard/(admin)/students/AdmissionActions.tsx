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

  async function run(key: string, next: "approved" | "rejected" | "awaiting_payment" | "under_review") {
    setLoading(key);
    setMsg(null);
    const r = await setStudentApplicationStatus(studentId, next);
    setLoading(null);
    if (r.error) setMsg({ type: "err", text: r.error });
    else setMsg({ type: "ok", text: "Updated" });
  }

  if (status === "rejected") {
    return <span className="text-xs text-gray-400">Application rejected.</span>;
  }

  const busy = loading !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => run("ap", "approved")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
            bg-green-600 text-white hover:bg-green-700
            ${status === "approved" ? "ring-2 ring-green-600 ring-offset-1" : ""}`}
        >
          {loading === "ap" ? "…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run("aw", "awaiting_payment")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
            bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100
            ${status === "awaiting_payment" ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
        >
          {loading === "aw" ? "…" : "Awaiting Payment"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run("rj", "rejected")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
            bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`}
        >
          {loading === "rj" ? "…" : "Reject"}
        </button>
      </div>
      {msg && (
        <span className={msg.type === "err" ? "text-xs text-red-600" : "text-xs text-green-600"}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
