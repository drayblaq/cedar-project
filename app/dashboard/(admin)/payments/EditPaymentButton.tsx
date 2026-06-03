"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePayment } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a" };

export function EditPaymentButton({ id, amount, notes }: { id: string; amount: number; notes: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [amt, setAmt] = useState(String(amount));
  const [note, setNote] = useState(notes ?? "");
  const [err, setErr] = useState<string | null>(null);

  function save() {
    const value = Number(amt);
    if (!Number.isFinite(value) || value < 0) { setErr("Enter a valid amount."); return; }
    setErr(null);
    startTransition(async () => {
      const res = await updatePayment(id, value, note);
      if (res?.error) { setErr(res.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => { setAmt(String(amount)); setNote(notes ?? ""); setErr(null); setOpen(true); }}
        title="Edit payment"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.muted, cursor: "pointer" }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      </button>

      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(14,59,12,.32)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(14,59,12,.3)", overflow: "hidden", textAlign: "left" }}>
            <div style={{ padding: "20px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Edit payment</h3>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <label className="cd-fld">
                <span>Amount</span>
                <input type="number" min="0" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} autoFocus />
              </label>
              <label className="cd-fld">
                <span>Notes</span>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional…" />
              </label>
              {err && <p style={{ fontSize: 12.5, color: "#b3402f", fontWeight: 600 }}>{err}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "0 24px 20px" }}>
              <button onClick={() => setOpen(false)} disabled={pending} className="cd-btn-ghost">Cancel</button>
              <button onClick={save} disabled={pending} className="cd-btn-primary">{pending ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
