"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

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
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const s of students) init[s.id] = initialStatus[s.id] ?? "present";
    return init;
  });
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasExistingRecords = Object.keys(initialStatus).length > 0;

  function handleDateChange(newDate: string) {
    setSaveMsg(null);
    const p = new URLSearchParams(searchParams.toString());
    p.set("date", newDate);
    router.push(`${basePath}?${p.toString()}`);
  }

  function markAllPresent() {
    const next: Record<string, string> = {};
    for (const s of students) next[s.id] = "present";
    setStatuses(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    for (const [sid, val] of Object.entries(statuses)) {
      fd.set(`status_${sid}`, val);
    }
    startTransition(async () => {
      setSaveMsg(null);
      const result = await saveAction(fd);
      if (result?.error) {
        setSaveMsg({ type: "error", text: result.error });
        return;
      }
      const presentCount = Object.values(statuses).filter(v => v === "present").length;
      const absentCount = Object.values(statuses).filter(v => v === "absent").length;
      const lateCount = Object.values(statuses).filter(v => v === "late").length;
      const dateLabel = new Date(date + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "long", day: "numeric", month: "long",
      });
      setSaveMsg({
        type: "success",
        text: `✓ Attendance saved for ${dateLabel} — ${presentCount} present, ${absentCount} absent, ${lateCount} late`,
      });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Date picker */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="block text-sm font-semibold text-slate-700">Date</label>
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Already-recorded warning */}
      {hasExistingRecords && !saveMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-amber-500 text-lg shrink-0">⚠️</span>
          <p className="text-sm text-amber-800">
            <strong>Attendance already recorded for this date.</strong> Saving will overwrite existing records.
          </p>
        </div>
      )}

      {!students.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
          <span className="text-4xl">👥</span>
          <p className="mt-3 text-slate-500">No students yet. Add students first.</p>
        </div>
      ) : (
        <>
          {/* Counter + bulk action */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">
              <span className="font-bold text-slate-900">{students.length}</span> students
            </p>
            <button
              type="button"
              onClick={markAllPresent}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
            >
              ✓ Mark all present
            </button>
          </div>

          {/* Student rows */}
          <div className="space-y-2">
            {students.map((s) => {
              const current = statuses[s.id] ?? "present";
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{s.full_name}</p>
                      <p className="text-xs text-slate-400">{(s.levels as { name: string } | null)?.name ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "absent", "late"] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: val }))}
                        className={`flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition ${
                          current === val
                            ? val === "present" ? "bg-emerald-500 text-white shadow-md"
                              : val === "absent" ? "bg-red-500 text-white shadow-md"
                              : "bg-amber-500 text-white shadow-md"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    <input type="hidden" name={`status_${s.id}`} value={current} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save result messages */}
          {saveMsg && (
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
              saveMsg.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}>
              {saveMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70 transition"
          >
            {isPending ? "Saving…" : "Save attendance"}
          </button>
        </>
      )}
    </form>
  );
}
