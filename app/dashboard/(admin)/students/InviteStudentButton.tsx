"use client";

import { useState } from "react";
import { inviteStudentLogin } from "@/app/dashboard/actions/index";

export function InviteStudentButton({
  studentId,
  disabled,
}: {
  studentId: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleInvite() {
    if (disabled || loading) return;
    setLoading(true);
    setMessage(null);
    const result = await inviteStudentLogin(studentId);
    setLoading(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "ok", text: "Invite sent to student's email" });
    }
  }

  if (disabled) {
    return (
      <span
        className="text-xs text-slate-400"
        title="Requires active enrollment, at least one recorded payment, and no existing portal login"
      >
        —
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleInvite}
        disabled={loading}
        className="text-sm font-medium text-emerald-600 hover:underline disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send login invite"}
      </button>
      {message && (
        <span className={message.type === "error" ? "text-red-600 text-xs" : "text-emerald-600 text-xs"}>
          {message.text}
        </span>
      )}
    </span>
  );
}
