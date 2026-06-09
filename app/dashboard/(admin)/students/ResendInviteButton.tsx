"use client";

import { useState } from "react";
import { inviteStudentLogin } from "@/app/dashboard/actions/index";

interface Props {
  studentId: string;
  lastInviteSentAt: string | null;
  studentStatus?: string | null;
}

export function ResendInviteButton({ studentId, lastInviteSentAt }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    setErrorText(null);
    const result = await inviteStudentLogin(studentId);
    if (result.success) {
      setState("success");
      setTimeout(() => setState("idle"), 4000);
    } else {
      setErrorText(result.error ?? "Failed to send invite");
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  const lastSentLabel = lastInviteSentAt
    ? new Date(lastInviteSentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading" || state === "success"}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "Sending…" :
         state === "success"  ? "✓ Sent"   :
         state === "error"    ? "✗ Try again" :
         lastInviteSentAt ? "Resend invite" : "Send login invite"}
      </button>
      {state === "error" && errorText && (
        <span className="text-xs text-red-600">{errorText}</span>
      )}
      {state === "idle" && lastSentLabel && (
        <span className="text-xs text-gray-400">Last sent: {lastSentLabel}</span>
      )}
    </div>
  );
}
