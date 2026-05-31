import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/app/dashboard/actions/index";
import { input, label, card, btnPrimary } from "../../ui";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, paid_at, notes, receipt_number, students(full_name)")
    .order("paid_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">Record and track student payments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Record payment form */}
        <div className={`${card} p-6 h-fit`}>
          <h2 className="mb-5 text-sm font-semibold text-slate-900">Record payment</h2>
          <form action={createPayment as unknown as (formData: FormData) => Promise<void>} className="space-y-4">
            <div>
              <label htmlFor="student_id" className={label}>Student *</label>
              <select id="student_id" name="student_id" required className={input}>
                <option value="">— Select student —</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amount" className={label}>Amount *</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" required className={input} />
              </div>
              <div>
                <label htmlFor="currency" className={label}>Currency</label>
                <select id="currency" name="currency" className={input}>
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="paid_at" className={label}>Date</label>
              <input id="paid_at" name="paid_at" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} className={input} />
            </div>
            <div>
              <label htmlFor="notes" className={label}>Notes</label>
              <input id="notes" name="notes" type="text" className={input} placeholder="Optional notes…" />
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center py-3`}>
              Record payment
            </button>
          </form>
        </div>

        {/* Payments list */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Payment history</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {payments?.length ?? 0} records
            </span>
          </div>

          {!payments?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
              <span className="text-4xl">💳</span>
              <p className="mt-3 font-semibold text-slate-600">No payments recorded yet</p>
            </div>
          ) : (
            <div className={`${card} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Receipt</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => {
                    const student = Array.isArray(p.students) ? p.students[0] : p.students;
                    const receiptNo = (p as { receipt_number?: string | null }).receipt_number ?? "PAY-" + p.id.slice(0, 8).toUpperCase();
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                              {((student as { full_name?: string } | null)?.full_name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900">
                              {(student as { full_name?: string } | null)?.full_name ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="font-mono text-xs text-slate-400">{receiptNo}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-green-700">{Number(p.amount).toLocaleString()}</span>
                          <span className="ml-1 text-xs text-slate-400">{p.currency}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 hidden sm:table-cell">
                          {new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <a href={`/admin/payments/${p.id}/receipt`} target="_blank" rel="noopener noreferrer"
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition">
                            Receipt
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
