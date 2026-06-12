"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCallerRole } from "./_auth";

export type QuizQuestion = {
  id: string;
  material_id: string;
  question_text: string;
  question_type: "mcq" | "fill_blank" | "true_false";
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
  approved: boolean;
};

export type QuizAttempt = {
  id: string;
  student_id: string;
  material_id: string;
  answers: Record<string, string>;
  score: number;
  total_questions: number;
  completed_at: string;
};

// ── Student-facing actions ───────────────────────────────────────────────────

export async function getQuizQuestions(materialId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("material_id", materialId)
    .eq("approved", true)
    .order("sort_order");
  return (data ?? []) as QuizQuestion[];
}

export async function getStudentQuizAttempt(materialId: string): Promise<QuizAttempt | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return null;

  const { data } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("student_id", student.id)
    .eq("material_id", materialId)
    .maybeSingle();
  return data as QuizAttempt | null;
}

export async function submitQuizAttempt(
  materialId: string,
  answers: Record<string, string>
): Promise<{ success?: boolean; score?: number; correct?: number; total?: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return { error: "Student not found" };

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer")
    .eq("material_id", materialId)
    .eq("approved", true);
  if (!questions?.length) return { error: "Questions not found" };

  let correct = 0;
  for (const q of questions) {
    const studentAnswer = (answers[q.id] ?? "").toLowerCase().trim();
    const correctAnswer = q.correct_answer.toLowerCase().trim();
    if (studentAnswer === correctAnswer) correct++;
  }
  const score = Math.round((correct / questions.length) * 100);

  const { error } = await supabase
    .from("quiz_attempts")
    .upsert({
      student_id: student.id,
      material_id: materialId,
      answers,
      score,
      total_questions: questions.length,
      completed_at: new Date().toISOString(),
    }, { onConflict: "student_id,material_id" });
  if (error) return { error: error.message };

  // Track lesson completion (best-effort)
  try {
    await supabase
      .from("lesson_progress")
      .upsert({
        student_id: student.id,
        material_id: materialId,
        completed_at: new Date().toISOString(),
      }, { onConflict: "student_id,material_id" });
  } catch {
    // non-critical
  }

  revalidatePath("/student/materials");
  return { success: true, score, correct, total: questions.length };
}

// ── Admin/staff actions ──────────────────────────────────────────────────────

export async function getAdminQuizQuestions(materialId: string): Promise<QuizQuestion[]> {
  const role = await getCallerRole();
  if (!role || (role !== "admin" && role !== "staff")) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("material_id", materialId)
    .order("sort_order");
  return (data ?? []) as QuizQuestion[];
}

export async function toggleQuestionApproval(questionId: string, approved: boolean) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({ approved })
    .eq("id", questionId);
  if (error) return { error: error.message };

  revalidatePath("/admin/library");
  return { success: true };
}

export async function deleteQuestion(questionId: string) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);
  if (error) return { error: error.message };

  revalidatePath("/admin/library");
  return { success: true };
}

export async function createQuestion(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const material_id = formData.get("material_id") as string;
  const question_text = (formData.get("question_text") as string)?.trim();
  const question_type = formData.get("question_type") as "mcq" | "fill_blank" | "true_false";
  const correct_answer = (formData.get("correct_answer") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim() || null;

  if (!question_text) return { error: "Question text is required" };
  if (!correct_answer) return { error: "Correct answer is required" };
  if (!["mcq", "fill_blank", "true_false"].includes(question_type)) return { error: "Invalid question type" };

  let options: string[] | null = null;
  if (question_type === "mcq") {
    const o = [
      formData.get("option_1"), formData.get("option_2"),
      formData.get("option_3"), formData.get("option_4"),
    ].map(s => (s as string)?.trim()).filter(Boolean);
    if (o.length < 2) return { error: "MCQ needs at least 2 options" };
    options = o;
  } else if (question_type === "true_false") {
    options = ["True", "False"];
  }

  // Get highest sort_order to append
  const { data: last } = await supabase
    .from("quiz_questions")
    .select("sort_order")
    .eq("material_id", material_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((last as { sort_order?: number } | null)?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("quiz_questions").insert({
    material_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    sort_order,
    approved: true,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/library");
  return { success: true };
}
