"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleQuestionApproval,
  deleteQuestion,
  createQuestion,
} from "@/app/dashboard/actions/quiz";
import type { QuizQuestion } from "@/app/dashboard/actions/quiz";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#64748b",
  border: "#e2e8f0", surface: "#ffffff", bg: "#f8fafc",
  green: "#16a34a", greenDark: "#15803d", greenLight: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberLight: "#fffbeb", amberBorder: "#fde68a",
  red: "#dc2626", redLight: "#fef2f2", redBorder: "#fecaca",
  purple: "#7c3aed", purpleLight: "#faf5ff", purpleBorder: "#ddd6fe",
  shadow: "0 1px 3px rgba(0,0,0,.06)",
};

const TYPE_LABEL: Record<string, string> = {
  mcq: "MCQ", fill_blank: "Fill in Blank", true_false: "True / False",
};
const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  mcq:        { bg: "#eff6ff", color: "#1d4ed8" },
  fill_blank: { bg: S.amberLight, color: S.amber },
  true_false: { bg: S.greenLight, color: S.greenDark },
};

export function QuizAdminClient({ materialId, initialQuestions }: {
  materialId: string;
  initialQuestions: QuizQuestion[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"mcq" | "fill_blank" | "true_false">("mcq");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleQuestionApproval(id, !current);
    refresh();
  }

  async function handleDelete(id: string, text: string) {
    if (!confirm(`Delete question: "${text.slice(0, 60)}…"?`)) return;
    await deleteQuestion(id);
    refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("material_id", materialId);
    const res = await createQuestion(fd);
    setSubmitting(false);
    if (res.error) { setFormError(res.error); return; }
    (e.target as HTMLFormElement).reset();
    setShowForm(false);
    refresh();
  }

  return (
    <div>
      {/* Question list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {initialQuestions.length === 0 && (
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: S.muted }}>No questions yet. Add the first one below.</p>
          </div>
        )}
        {initialQuestions.map((q, i) => {
          const tc = TYPE_COLOR[q.question_type] ?? { bg: S.bg, color: S.muted };
          return (
            <div key={q.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: S.shadow }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: S.muted, marginTop: 2, flexShrink: 0 }}>Q{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: S.ink, lineHeight: 1.5, margin: 0 }}>{q.question_text}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tc.bg, color: tc.color }}>
                      {TYPE_LABEL[q.question_type]}
                    </span>
                    <span style={{ fontSize: 12, color: S.muted }}>
                      Answer: <span style={{ fontWeight: 700, color: S.greenDark }}>{q.correct_answer}</span>
                    </span>
                    {q.options && (
                      <span style={{ fontSize: 11.5, color: S.muted }}>
                        Options: {(q.options as string[]).join(" · ")}
                      </span>
                    )}
                  </div>
                  {q.explanation && (
                    <p style={{ fontSize: 12, color: S.sub, marginTop: 6, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600 }}>Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(q.id, q.approved)}
                    style={{
                      fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 8, cursor: "pointer",
                      background: q.approved ? S.greenLight : S.amberLight,
                      color: q.approved ? S.greenDark : S.amber,
                      border: `1px solid ${q.approved ? S.greenBorder : S.amberBorder}`,
                    }}
                  >
                    {q.approved ? "✓ Active" : "Draft"}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.question_text)}
                    style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, cursor: "pointer", background: "transparent", color: S.red, border: `1px solid transparent` }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = S.redLight; (e.currentTarget as HTMLButtonElement).style.borderColor = S.redBorder; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add question toggle */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 7, background: S.green, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
        >
          + Add Question
        </button>
      )}

      {/* Add question form */}
      {showForm && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: "22px 24px", boxShadow: S.shadow }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: S.ink, marginBottom: 18 }}>New Question</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Type selector */}
            <div>
              <label style={labelStyle}>Question Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["mcq", "fill_blank", "true_false"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormType(t)}
                    style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: formType === t ? S.ink : S.bg,
                      color: formType === t ? "#fff" : S.sub,
                      border: `1px solid ${formType === t ? S.ink : S.border}`,
                    }}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              <input type="hidden" name="question_type" value={formType} />
            </div>

            {/* Question text */}
            <div>
              <label style={labelStyle}>Question Text</label>
              <textarea
                name="question_text"
                required
                rows={2}
                placeholder="e.g. What do you say when you meet someone for the first time?"
                style={inputStyle}
              />
            </div>

            {/* MCQ options */}
            {formType === "mcq" && (
              <div>
                <label style={labelStyle}>Answer Options (minimum 2)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <input
                      key={n}
                      type="text"
                      name={`option_${n}`}
                      placeholder={`Option ${n}${n <= 2 ? " (required)" : " (optional)"}`}
                      required={n <= 2}
                      style={inputStyle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Correct answer */}
            <div>
              <label style={labelStyle}>
                {formType === "true_false" ? "Correct Answer (True or False)" : "Correct Answer"}
              </label>
              {formType === "true_false" ? (
                <select name="correct_answer" required style={inputStyle}>
                  <option value="">Select…</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="correct_answer"
                  required
                  placeholder={formType === "fill_blank" ? "e.g. is" : "Must exactly match one of the options above"}
                  style={inputStyle}
                />
              )}
            </div>

            {/* Explanation */}
            <div>
              <label style={labelStyle}>Explanation (shown after submission)</label>
              <textarea
                name="explanation"
                rows={2}
                placeholder="Why is this the correct answer?"
                style={inputStyle}
              />
            </div>

            {formError && (
              <p style={{ fontSize: 13, color: S.red, background: S.redLight, border: `1px solid ${S.redBorder}`, borderRadius: 8, padding: "8px 12px" }}>
                {formError}
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ background: S.green, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
              >
                {submitting ? "Saving…" : "Save Question"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null); }}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.sub, borderRadius: 9, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 13px",
  fontSize: 13.5, border: "1px solid #e2e8f0", borderRadius: 9,
  background: "#fff", color: "#0f172a", outline: "none",
  fontFamily: "inherit", resize: "vertical" as const,
};
