"use client";

import { useState, useTransition } from "react";
import { createMomoPayment } from "./actions";

interface Props {
  studentId: string;
  momoNumber: string;
  momoName: string;
  tuitionAmount: string;
  currency: string;
}

export default function MomoPaymentForm({
  studentId,
  momoNumber,
  momoName,
  tuitionAmount,
  currency,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("student_id", studentId);
    startTransition(async () => {
      const res = await createMomoPayment(fd);
      if (res?.error) {
        setResult({ ok: false, message: res.error });
      } else {
        setResult({ ok: true, message: "Payment recorded. Student account activated and login invite sent." });
      }
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        ✓ {result.message}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-base font-bold text-orange-900">Record MoMo Payment</h3>
        <p className="mt-1 text-sm text-orange-700">
          Ask the student to send via Mobile Money to:
        </p>
        <p className="mt-2 font-mono text-lg font-bold text-orange-900">{momoNumber}</p>
        <p className="text-sm text-orange-700">{momoName}</p>
        <p className="mt-1 text-sm text-orange-700">
          Expected amount: <strong>{Number(tuitionAmount).toLocaleString()} {currency}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-orange-800 mb-1">
            MoMo transaction reference (optional)
          </label>
          <input
            name="momo_reference"
            type="text"
            placeholder="e.g. TXN-12345678"
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orange-800 mb-1">
              Amount received
            </label>
            <input
              name="amount"
              type="number"
              min="0"
              step="1"
              defaultValue={tuitionAmount}
              required
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orange-800 mb-1">
              Currency
            </label>
            <input
              name="currency"
              type="text"
              defaultValue={currency}
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-orange-800 mb-1">
            Notes
          </label>
          <input
            name="notes"
            type="text"
            placeholder="e.g. partial payment, paid in 2 instalments"
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {result && !result.ok && (
          <p className="text-sm text-red-600">{result.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow hover:bg-orange-600 disabled:opacity-60 transition"
        >
          {isPending ? "Recording…" : "✓ Confirm payment received"}
        </button>
      </form>
    </div>
  );
}
