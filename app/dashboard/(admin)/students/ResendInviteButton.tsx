"use client";

import { useState } from "react";
import { inviteStudentLogin } from "@/app/dashboard/actions/index";

interface Props {
  studentId: string;
  lastInviteSentAt: string | null;
}

export function ResendInviteButton({ studentId, lastInviteSentAt }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const isResend = lastInviteSentAt !== null;
  const label = isResend ? "Resend invite" : "Send login invite";

  async function handleClick() {
    setState("loading");
    setErrorText(null);
    const result = await inviteStudentLogin(studentId);
    if (result.success) {
      setState("success");
      setTimeout(() => setState("idle"), 3000);
    } else {
      setErrorText(result.error ?? "Failed to send invite");
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  const lastSentLabel = lastInviteSentAt
    ? new Date(lastInviteSentAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="text-sm font-medium text-emerald-600 hover:underline disabled:opacity-50 text-left"
      >
        {state === "idle" && label}
        {state === "loading" && "Sending…"}
        {state === "success" && "✓ Sent"}
        {state === "error" && "✗ Failed"}
      </button>
      {state === "error" && errorText && (
        <span className="text-xs text-red-600">{errorText}</span>
      )}
      {state === "idle" && lastSentLabel && (
        <span className="text-xs text-slate-400">Last sent: {lastSentLabel}</span>
      )}
      {state === "idle" && !lastSentLabel && (
        <span className="text-xs text-slate-400">Never invited</span>
      )}
    </div>
  );
}
