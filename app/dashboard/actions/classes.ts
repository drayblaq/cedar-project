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

export async function createMaterial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const material_type = formData.get("material_type") as string;
  const url = (formData.get("url") as string) || null;
  const class_id = formData.get("class_id") as string;

  if (!title || !material_type || !class_id) {
    return { error: "Title, type and class are required" };
  }

  const { error } = await supabase
    .from("materials")
    .insert({ title, description, material_type, url, class_id, uploaded_by: user.id });

  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/staff/materials");
  revalidatePath("/student");
  revalidatePath("/student/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/staff/materials");
  revalidatePath("/student");
  revalidatePath("/student/materials");
  return { success: true };
}

export async function createTimetableSlot(formData: FormData) {
  const supabase = await createClient();
  const class_id = formData.get("class_id") as string;
  const day_of_week = parseInt(formData.get("day_of_week") as string);
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const room = (formData.get("room") as string) || null;

  if (!class_id || !day_of_week || !start_time || !end_time) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase
    .from("timetable")
    .insert({ class_id, day_of_week, start_time, end_time, room });

  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { success: true };
}

export async function deleteTimetableSlot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("timetable").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { success: true };
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
