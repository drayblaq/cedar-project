"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Student = { id: string; full_name: string; levels: { name: string } | null };
type SaveAction = (formData: FormData) => Promise<{ error: string | null }>;

export default function AttendanceForm({
  date,
  students,
  initialStatus,
  saveAction,
  basePath = "/dashboard/attendance",
}: {
  date: string;
  students: Student[];
  initialStatus: Record<string, string>;
  saveAction: SaveAction;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleDateChange(newDate: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("date", newDate);
    router.push(`${basePath}?${p.toString()}`);
  }

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const result = await saveAction(fd);
          if (result?.error) {
            alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
      className="mt-8 space-y-6"
    >
      <div className="flex flex-wrap items-center gap-4">
        <label className="block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
        />
      </div>

      {!students.length ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No students yet. Add students first.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700">Student</th>
                  <th className="px-5 py-4 font-semibold text-slate-700">Level</th>
                  <th className="px-5 py-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {s.full_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {(s.levels as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        name={`status_${s.id}`}
                        defaultValue={initialStatus[s.id] ?? "present"}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70"
          >
            {isPending ? "Saving…" : "Save attendance"}
          </button>
        </>
      )}
    </form>
  );
}
