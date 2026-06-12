"use client";

import { useState } from "react";
import { submitQuizAttempt } from "@/app/dashboard/actions";
import type { QuizQuestion, QuizAttempt } from "@/app/dashboard/actions/quiz";

const S = {
  ink: "#0f172a", sub: "#475569", muted: "#64748b",
  border: "#e2e8f0", surface: "#ffffff", bg: "#f8fafc",
  green: "#16a34a", greenDark: "#15803d", greenLight: "#f0fdf4", greenBorder: "#bbf7d0",
  amber: "#d97706", amberLight: "#fffbeb", amberBorder: "#fde68a",
  red: "#dc2626", redLight: "#fef2f2", redBorder: "#fecaca",
  blue: "#1d4ed8", blueLight: "#eff6ff",
  shadow: "0 2px 8px rgba(0,0,0,.08)",
};

interface Props {
  questions: QuizQuestion[];
  materialId: string;
  materialTitle: string;
  previousAttempt: QuizAttempt | null;
}

function scoreStyle(score: number): { bg: string; border: string; text: string; label: string } {
  if (score >= 80) return { bg: S.greenLight, border: S.greenBorder, text: S.greenDark, label: "Excellent work!" };
  if (score >= 60) return { bg: S.amberLight, border: S.amberBorder, text: S.amber, label: "Good effort!" };
  return { bg: S.redLight, border: S.redBorder, text: S.red, label: "Keep practising!" };
}

export function QuizSection({ questions, materialId, materialTitle, previousAttempt }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(previousAttempt?.answers ?? {});
  const [submitted, setSubmitted] = useState(!!previousAttempt);
  const [showAnswers, setShowAnswers] = useState(!!previousAttempt);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(
    previousAttempt
      ? {
          score: previousAttempt.score,
          correct: Math.round((previousAttempt.score / 100) * previousAttempt.total_questions),
          total: previousAttempt.total_questions,
        }
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  const mcq = questions.filter((q) => q.question_type === "mcq");
  const fillBlank = questions.filter((q) => q.question_type === "fill_blank");
  const trueFalse = questions.filter((q) => q.question_type === "true_false");

  async function handleSubmit() {
    setSubmitting(true);
    const res = await submitQuizAttempt(materialId, answers);
    if (res.success && res.score !== undefined && res.correct !== undefined && res.total !== undefined) {
      setResult({ score: res.score, correct: res.correct, total: res.total });
      setSubmitted(true);
      setShowAnswers(true);
    }
    setSubmitting(false);
  }

  function handleRetake() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setShowAnswers(false);
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const ss = result ? scoreStyle(result.score) : null;

  return (
    <div style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: S.ink, margin: 0 }}>Quiz</h2>
          <p style={{ fontSize: 12.5, color: S.muted, marginTop: 3 }}>{questions.length} questions · {materialTitle}</p>
        </div>
        {result && ss && (
          <div style={{ textAlign: "center", padding: "8px 16px", borderRadius: 12, background: ss.bg, border: `1px solid ${ss.border}` }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: ss.text, margin: 0, lineHeight: 1 }}>{result.score}%</p>
            <p style={{ fontSize: 11, color: S.muted, marginTop: 3 }}>{result.correct}/{result.total} correct</p>
          </div>
        )}
      </div>

      {/* Result banner */}
      {result && ss && (
        <div style={{ borderRadius: 14, padding: "16px 20px", marginBottom: 24, background: ss.bg, border: `1px solid ${ss.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: ss.text, margin: 0 }}>{ss.label}</p>
          <p style={{ fontSize: 13, color: S.sub, marginTop: 6, lineHeight: 1.6 }}>
            You scored {result.score}% — {result.correct} out of {result.total} correct.
            {result.score < 80 && " Review the explanations below and try again."}
          </p>
          <button
            onClick={handleRetake}
            style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: S.green, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Retake quiz →
          </button>
        </div>
      )}

      {/* MCQ */}
      {mcq.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted, marginBottom: 12 }}>
            Multiple Choice
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mcq.map((q, i) => (
              <MCQCard
                key={q.id}
                question={q}
                number={i + 1}
                selected={answers[q.id]}
                submitted={submitted}
                showAnswers={showAnswers}
                onSelect={(v) => !submitted && setAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Fill in blank */}
      {fillBlank.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted, marginBottom: 12 }}>
            Fill in the Blank
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fillBlank.map((q, i) => (
              <FillBlankCard
                key={q.id}
                question={q}
                number={mcq.length + i + 1}
                value={answers[q.id] ?? ""}
                submitted={submitted}
                showAnswers={showAnswers}
                onChange={(v) => !submitted && setAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </div>
        </section>
      )}

      {/* True/False */}
      {trueFalse.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: S.muted, marginBottom: 12 }}>
            True or False
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trueFalse.map((q, i) => (
              <TrueFalseCard
                key={q.id}
                question={q}
                number={mcq.length + fillBlank.length + i + 1}
                selected={answers[q.id]}
                submitted={submitted}
                showAnswers={showAnswers}
                onSelect={(v) => !submitted && setAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Submit bar */}
      {!submitted && (
        <div style={{ position: "sticky", bottom: 16, zIndex: 10 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "14px 18px", boxShadow: S.shadow, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 13, color: S.sub, margin: 0 }}>
                {answeredCount} of {questions.length} answered
              </p>
              {!allAnswered && (
                <p style={{ fontSize: 11.5, color: S.amber, marginTop: 3 }}>
                  Please answer all questions before submitting.
                </p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                background: allAnswered ? S.green : "#94a3b8",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 24px", fontSize: 13.5, fontWeight: 700,
                cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
                transition: "background .15s",
              }}
            >
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ExplanationBox({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: S.blueLight, border: `1px solid #bfdbfe` }}>
      <p style={{ fontSize: 12, color: S.blue, margin: 0, lineHeight: 1.6 }}>
        <span style={{ fontWeight: 700 }}>Explanation: </span>{text}
      </p>
    </div>
  );
}

function MCQCard({ question, number, selected, submitted, showAnswers, onSelect }: {
  question: QuizQuestion; number: number; selected?: string;
  submitted: boolean; showAnswers: boolean; onSelect: (v: string) => void;
}) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, marginBottom: 12 }}>
        {number}. {question.question_text}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options?.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correct_answer;
          let bg = S.surface, border = `1px solid ${S.border}`, color = S.sub;
          if (showAnswers && isCorrect) { bg = S.greenLight; border = `1px solid ${S.greenBorder}`; color = S.greenDark; }
          else if (showAnswers && isSelected && !isCorrect) { bg = S.redLight; border = `1px solid ${S.redBorder}`; color = S.red; }
          else if (!showAnswers && isSelected) { bg = S.greenLight; border = `1px solid ${S.greenBorder}`; color = S.greenDark; }

          const dotBg =
            (showAnswers && isCorrect) || (!showAnswers && isSelected) ? S.green :
            (showAnswers && isSelected && !isCorrect) ? S.red : "transparent";
          const dotBorder = dotBg !== "transparent" ? dotBg : "#cbd5e1";

          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={submitted}
              style={{
                textAlign: "left", padding: "10px 14px", borderRadius: 10,
                background: bg, border, color, fontSize: 13.5,
                cursor: submitted ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "background .1s",
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                background: dotBg, border: `2px solid ${dotBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#fff", fontWeight: 800,
              }}>
                {((showAnswers && isCorrect) || (!showAnswers && isSelected)) ? "✓" :
                  (showAnswers && isSelected && !isCorrect) ? "✗" : ""}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {showAnswers && question.explanation && <ExplanationBox text={question.explanation} />}
    </div>
  );
}

function FillBlankCard({ question, number, value, submitted, showAnswers, onChange }: {
  question: QuizQuestion; number: number; value: string;
  submitted: boolean; showAnswers: boolean; onChange: (v: string) => void;
}) {
  const isCorrect = value.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
  let inputBorder = `1px solid ${S.border}`, inputBg = S.surface, inputColor = S.ink;
  if (showAnswers && value) {
    if (isCorrect) { inputBorder = `1px solid ${S.greenBorder}`; inputBg = S.greenLight; inputColor = S.greenDark; }
    else { inputBorder = `1px solid ${S.redBorder}`; inputBg = S.redLight; inputColor = S.red; }
  }

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, marginBottom: 10 }}>
        {number}. {question.question_text}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer…"
        style={{
          width: "100%", boxSizing: "border-box", padding: "10px 14px",
          fontSize: 14, border: inputBorder, borderRadius: 9,
          background: inputBg, color: inputColor, outline: "none",
        }}
      />
      {showAnswers && value && !isCorrect && (
        <p style={{ fontSize: 12, color: S.greenDark, fontWeight: 700, marginTop: 6 }}>
          Correct answer: {question.correct_answer}
        </p>
      )}
      {showAnswers && question.explanation && <ExplanationBox text={question.explanation} />}
    </div>
  );
}

function TrueFalseCard({ question, number, selected, submitted, showAnswers, onSelect }: {
  question: QuizQuestion; number: number; selected?: string;
  submitted: boolean; showAnswers: boolean; onSelect: (v: string) => void;
}) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <p style={{ fontSize: 13.5, fontWeight: 600, color: S.ink, marginBottom: 12 }}>
        {number}. {question.question_text}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        {["True", "False"].map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correct_answer;
          let bg = S.surface, border = `1px solid ${S.border}`, color = S.sub;
          if (showAnswers && isCorrect) { bg = S.greenLight; border = `1px solid ${S.greenBorder}`; color = S.greenDark; }
          else if (showAnswers && isSelected && !isCorrect) { bg = S.redLight; border = `1px solid ${S.redBorder}`; color = S.red; }
          else if (!showAnswers && isSelected) { bg = S.greenLight; border = `1px solid ${S.greenBorder}`; color = S.greenDark; }

          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={submitted}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 10, border,
                background: bg, color, fontSize: 13.5, fontWeight: 700,
                cursor: submitted ? "default" : "pointer", transition: "background .1s",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {showAnswers && question.explanation && <ExplanationBox text={question.explanation} />}
    </div>
  );
}
