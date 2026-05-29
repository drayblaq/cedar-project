"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlacementTestDto } from "@/lib/placement/get-placement-test-dto";
import { scoreToBand } from "@/lib/placement/get-placement-test-dto";
import { submitPlacementAttempt } from "./actions";

export default function PlacementTestClient({
  token,
  dto,
}: {
  token: string;
  dto: PlacementTestDto;
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const [remaining, setRemaining] = useState(dto.timeLimitSeconds);
  const [done, setDone] = useState<{ percent: number; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef<string>(new Date().toISOString());
  const finishedRef = useRef(false);

  const maxPoints = useMemo(
    () => dto.questions.reduce((s, q) => s + (q.points || 1), 0),
    [dto.questions]
  );

  async function submit() {
    if (finishedRef.current || done) return;
    finishedRef.current = true;
    setSubmitting(true);
    setError(null);
    const result = await submitPlacementAttempt({
      placementToken: token,
      testId: dto.testId,
      startedAtIso: startedAt.current,
      selections: selectionsRef.current,
    });
    setSubmitting(false);
    if (result.error) {
      finishedRef.current = false;
      setError(result.error);
      return;
    }
    if ("percent" in result && result.percent != null) {
      setDone({ percent: result.percent, time: result.timeTakenSeconds ?? 0 });
    }
  }

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 0) return 0;
        const next = r - 1;
        if (next <= 0) {
          clearInterval(id);
          void submit();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- submit is stable enough for timer expiry
  }, [done]);

  if (done) {
    const band = scoreToBand(Math.round((done.percent / 100) * maxPoints));
    const mins = Math.floor(done.time / 60);
    const secs = done.time % 60;
    const timeLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
        <h2 className="mt-6 text-2xl font-bold text-slate-900">Test complete</h2>
        <p className="mt-4 text-lg font-semibold text-emerald-700">Suggested level: {band}</p>
        <p className="mt-2 text-slate-500 text-sm">
          Score: {done.percent}% · Time: {timeLabel}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Our team will review your application and confirm your placement.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">English placement test</h1>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </span>
      </div>
      <p className="mb-8 text-sm text-slate-600">Choose the best answer for each question.</p>

      <div className="space-y-6">
        {dto.questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700">
              <span>Multiple choice</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">{q.points ?? 1} pt</span>
            </div>
            <p className="font-medium text-slate-900">
              {idx + 1}. {q.prompt}
            </p>
            <p className="mt-2 text-xs text-slate-500">Select one answer</p>
            <ul className="mt-4 space-y-2">
              {q.options.map((opt) => (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={selections[q.id] === opt.id}
                      onChange={() => setSelections((s) => ({ ...s, [q.id]: opt.id }))}
                    />
                    <span className="text-sm text-slate-800">{opt.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          disabled={submitting || Object.keys(selections).length < dto.questions.length}
          onClick={() => void submit()}
          className="rounded-xl bg-sky-600 px-8 py-3 font-semibold text-white shadow-lg hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Finish test"}
        </button>
      </div>
    </div>
  );
}
