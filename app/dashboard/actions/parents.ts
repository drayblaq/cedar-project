"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function linkParentToStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can link parents to students" };

  const parent_id = formData.get("parent_id") as string;
  const student_id = formData.get("student_id") as string;
  if (!parent_id || !student_id) return { error: "Parent and student required" };

  const { error } = await supabase.from("parent_students").insert({ parent_id, student_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/parent-links");
  revalidatePath("/dashboard/parent");
  return { error: null };
}

export async function unlinkParentFromStudent(linkId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can unlink" };

  const { error } = await supabase.from("parent_students").delete().eq("id", linkId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/parent-links");
  revalidatePath("/dashboard/parent");
  return { error: null };
}
