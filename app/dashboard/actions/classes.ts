"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createClass(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const level_id = formData.get("level_id") as string;
  const { error } = await supabase.from("classes").insert({ name, level_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

export async function assignStaffToClass(formData: FormData) {
  const supabase = await createClient();
  const profile_id = formData.get("profile_id") as string;
  const class_id = formData.get("class_id") as string;
  const { error } = await supabase.from("staff_classes").insert({ profile_id, class_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

export async function removeStaffFromClass(profileId: string, classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff_classes").delete().eq("profile_id", profileId).eq("class_id", classId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  return { error: null };
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const class_id = (formData.get("class_id") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const { error } = await supabase.from("assignments").insert({
    title,
    description,
    level_id: level_id || null,
    class_id: class_id || null,
    due_date: due_date || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}
