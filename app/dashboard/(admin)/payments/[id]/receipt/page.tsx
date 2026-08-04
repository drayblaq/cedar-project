import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";
import PrintStyles from "./PrintStyles";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select(
      "id, amount, currency, paid_at, notes, receipt_number, students(full_name, email, phone, levels(name))"
    )
    .eq("id", id)
    .single();

  if (!payment) notFound();

  const student = Array.isArray(payment.students)
    ? payment.students[0]
    : payment.students;
  const level = student
    ? Array.isArray((student as { levels?: unknown }).levels)
      ? ((student as { levels?: Array<{ name?: string }> }).levels?.[0]?.name ?? null)
      : ((student as { levels?: { name?: string } | null }).levels?.name ?? null)
    : null;

  const receiptNo =
    (payment as { receipt_number?: string | null }).receipt_number ??
    "PAY-" + payment.id.slice(0, 8).toUpperCase();

  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@cedartrainingcenter.com";

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <tr>
      <td className="py-1.5 pr-6 text-sm font-medium text-slate-500 align-top whitespace-nowrap">
        {label}
      </td>
      <td className="py-1.5 text-sm text-slate-900 font-semibold">{value}</td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white print:p-0">
      <PrintStyles />
      {/* Print button, hidden when printing */}
      <div className="mb-6 flex justify-center print:hidden">
        <PrintButton />
      </div>

      {/* Receipt card */}
      <div
        id="receipt"
        className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 shadow-xl print:shadow-none print:rounded-none print:border-0 print:max-w-full print:p-8"
      >
        {/* Header with logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Cedar Training Center"
            className="h-16 w-16 mx-auto mb-3 rounded-xl"
          />
          <h1 className="text-xl font-bold text-gray-900">Cedar Training Center</h1>
          <p className="text-sm text-gray-500">Gbédjromédé, Cotonou, Bénin</p>
          <p className="text-xs text-gray-400">+229 01 96 19 64 40 · trainingcentercedar@gmail.com</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Official Payment Receipt
          </p>
        </div>

        <div className="my-7 border-t-2 border-dashed border-slate-200" />

        {/* Receipt meta */}
        <table className="w-full">
          <tbody>
            <Row label="Receipt No:" value={<span className="font-mono">{receiptNo}</span>} />
            <Row label="Date:" value={formatDate(payment.paid_at)} />
          </tbody>
        </table>

        <div className="my-6 border-t border-slate-200" />

        {/* Student info */}
        <table className="w-full">
          <tbody>
            <Row
              label="Student:"
              value={
                (student as { full_name?: string } | null)?.full_name ?? "-"
              }
            />
            <Row
              label="Email:"
              value={(student as { email?: string } | null)?.email ?? "-"}
            />
            <Row
              label="Phone:"
              value={
                (student as { phone?: string | null } | null)?.phone ?? "-"
              }
            />
            <Row label="Level:" value={level ?? "-"} />
          </tbody>
        </table>

        <div className="my-6 border-t border-slate-200" />

        {/* Amount */}
        <table className="w-full">
          <tbody>
            <Row
              label="Amount Paid:"
              value={
                <span className="text-emerald-700 text-base">
                  {formatAmount(payment.amount, payment.currency)}
                </span>
              }
            />
            <Row
              label="Status:"
              value={
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  CONFIRMED
                  <span className="text-base">✓</span>
                </span>
              }
            />
            {(payment as { notes?: string | null }).notes && (
              <Row label="Notes:" value={(payment as { notes?: string }).notes} />
            )}
          </tbody>
        </table>

        <div className="my-7 border-t-2 border-dashed border-slate-200" />

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 leading-relaxed">
          This receipt confirms payment received by Cedar Training Center.
          <br />
          For questions contact:{" "}
          <span className="text-slate-600 font-medium">{contactEmail}</span>
        </p>
      </div>
    </div>
  );
}
