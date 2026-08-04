"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCallerRole } from "./_auth";

export async function createGrade(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const student_id = formData.get("student_id") as string;
  const academic_term_id = (formData.get("academic_term_id") as string) || null;
  const subject_or_type = (formData.get("subject_or_type") as string) || "general";
  const score = formData.get("score") ? Number(formData.get("score")) : null;
  const remarks = (formData.get("remarks") as string) || null;
  const { error } = await supabase.from("grades").insert({
    student_id,
    academic_term_id: academic_term_id || null,
    subject_or_type,
    score: score ?? null,
    remarks,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/grades");
  redirect("/dashboard/grades");
}

export async function saveSkillLevel(studentId: string, skillArea: string, skillLevel: string) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("grades")
    .upsert(
      {
        student_id: studentId,
        skill_area: skillArea,
        skill_level: skillLevel,
        subject_or_type: skillArea, // backwards compat (NOT NULL column)
        academic_term_id: null,
      },
      { onConflict: "student_id,skill_area" }
    );

  if (error) return { error: error.message };
  revalidatePath("/admin/grades");
  revalidatePath("/student/grades");
  return { success: true };
}

export async function saveTermSkillLevel(
  studentId: string,
  termId: string,
  skillArea: string,
  skillLevel: string
) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("skill_assessments")
    .upsert(
      {
        student_id: studentId,
        academic_term_id: termId,
        skill_area: skillArea,
        skill_level: skillLevel,
        assessed_by: user.id,
        assessed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,academic_term_id,skill_area" }
    );

  if (error) return { error: error.message };
  revalidatePath("/admin/grades");
  revalidatePath("/staff/levels");
  revalidatePath("/student/grades");
  return { success: true };
}

export async function getStudentAssessmentHistory(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skill_assessments")
    .select("skill_area, skill_level, assessed_at, academic_terms(name, start_date)")
    .eq("student_id", studentId)
    .order("assessed_at", { ascending: true });
  return (data ?? []) as unknown as {
    skill_area: string;
    skill_level: string;
    assessed_at: string;
    academic_terms: { name: string; start_date: string } | null;
  }[];
}

export async function deleteGrade(id: string) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/grades");
  return { error: null };
}
