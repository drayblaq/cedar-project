import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminQuizQuestions } from "@/app/dashboard/actions/quiz";
import { QuizAdminClient } from "./QuizAdminClient";

const S = {
  ink: "#0f172a", muted: "#64748b", border: "#e2e8f0", sub: "#475569",
  green: "#16a34a", greenLight: "#f0fdf4",
};

export default async function QuizQuestionsPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;

  const supabase = await createClient();

  // Verify the material exists and get its title
  const { data: material } = await supabase
    .from("materials")
    .select("id, title, material_type")
    .eq("id", materialId)
    .maybeSingle();

  if (!material) notFound();

  const questions = await getAdminQuizQuestions(materialId);
  const activeCount = questions.filter((q) => q.approved).length;

  return (
    <div style={{ padding: "28px 32px 60px", background: "#f8fafc", minHeight: "100%" }}>
      {/* Back link */}
      <Link
        href="/admin/library"
        style={{ fontSize: 13, color: S.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 20 }}
      >
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Library
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: S.ink, margin: 0 }}>
            Quiz Questions
          </h1>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: S.greenLight, color: S.green }}>
            {activeCount} active · {questions.length} total
          </span>
        </div>
        <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>
          Lesson: <span style={{ fontWeight: 600, color: S.sub }}>{material.title}</span>
        </p>
      </div>

      {/* Client component handles all interactive parts */}
      <QuizAdminClient materialId={materialId} initialQuestions={questions} />
    </div>
  );
}
