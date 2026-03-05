import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/app/dashboard/actions";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .order("full_name");

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, currency, paid_at, notes, students(full_name)")
    .order("paid_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Finance
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Payments
      </h1>
      <p className="mt-2 text-slate-600">
        Record payments and view history.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">
            Record payment
          </h2>
          <form action={createPayment as unknown as (formData: FormData) => Promise<void>} className="mt-6 space-y-5">
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-slate-700">
                Student *
              </label>
              <select
                id="student_id"
                name="student_id"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">— Select student —</option>
                {students?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                  Amount *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="XOF">XOF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="paid_at" className="block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="paid_at"
                name="paid_at"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Notes
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600"
            >
              Record payment
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Recent payments
          </h2>
          {!payments?.length ? (
            <p className="mt-4 text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {payments.map((p) => {
                const student = Array.isArray(p.students) ? p.students[0] : p.students;
                return (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {(student as { full_name?: string } | null)?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(p.paid_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                    {p.amount} {p.currency}
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
