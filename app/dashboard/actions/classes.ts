"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCallerRole } from "./_auth";

export async function createClass(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Class name is required" };
  const level_id = formData.get("level_id") as string;
  const { error } = await supabase.from("classes").insert({ name, level_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

export async function assignStaffToClass(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

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
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("staff_classes").delete().eq("profile_id", profileId).eq("class_id", classId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  return { error: null };
}

export async function createMaterial(formData: FormData) {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).maybeSingle();
  if (!profile?.role_id) return { error: "Unauthorized" };
  const { data: roleRow } = await supabase.from("roles").select("name").eq("id", profile.role_id).maybeSingle();
  const callerRole = (roleRow as { name?: string } | null)?.name;
  if (callerRole !== "admin" && callerRole !== "staff") return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };
  if (title.length > 500) return { error: "Title too long" };
  const description = (formData.get("description") as string) || null;
  const material_type = formData.get("material_type") as string;
  const class_id = (formData.get("class_id") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const folder_id = (formData.get("folder_id") as string) || null;
  const topic = (formData.get("topic") as string) || null;
  const week_number = formData.get("week_number") ? parseInt(formData.get("week_number") as string) : null;
  const is_public = formData.get("is_public") === "true";
  const teacher_only = formData.get("teacher_only") === "true";
  const student_level_id = (formData.get("student_level_id") as string) || null;
  const file = formData.get("file") as File | null;
  const url = (formData.get("url") as string) || null;

  if (!title || !material_type) return { error: "Title and type are required" };

  let fileUrl: string | null = url;
  let storedPath: string | null = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const bucket = folder_id ? `folders/${folder_id}` : level_id ? level_id : "general";
    const filePath = `${bucket}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

    const { data: urlData } = supabase.storage.from("course-materials").getPublicUrl(filePath);
    fileUrl = urlData.publicUrl;
    storedPath = filePath;
  }

  if (!fileUrl && material_type !== "other") {
    return { error: "Please provide a file or URL" };
  }

  const { error } = await supabase.from("materials").insert({
    title,
    description,
    material_type,
    url: fileUrl,
    file_path: storedPath,
    class_id,
    level_id,
    folder_id,
    topic,
    week_number,
    is_public,
    teacher_only,
    student_level_id: student_level_id || null,
    uploaded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/staff/materials");
  revalidatePath("/student");
  revalidatePath("/student/materials");
  return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An unexpected error occurred" };
  }
}

export async function createFolder(name: string, parentId: string | null) {
  try {
    if (!name?.trim()) return { error: "Folder name is required" };
    if (name.length > 200) return { error: "Folder name too long" };
    const role = await getCallerRole();
    if (!role) return { error: "Not authenticated" };
    if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("library_folders")
      .insert({ name: name.trim(), parent_id: parentId || null, created_by: user.id })
      .select()
      .single();
    if (error) return { error: error.message };
    revalidatePath("/admin/library");
    return { success: true, folder: data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create folder" };
  }
}

export async function deleteFolder(id: string) {
  try {
    const role = await getCallerRole();
    if (!role) return { error: "Not authenticated" };
    if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };
    const supabase = await createClient();
    const { error } = await supabase.from("library_folders").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/library");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete folder" };
  }
}

export async function renameFolder(id: string, name: string) {
  try {
    if (!name?.trim()) return { error: "Folder name is required" };
    const role = await getCallerRole();
    if (!role) return { error: "Not authenticated" };
    if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };
    const supabase = await createClient();
    const { error } = await supabase.from("library_folders").update({ name: name.trim() }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/library");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to rename folder" };
  }
}

export async function deleteMaterial(id: string) {
  try {
    const role = await getCallerRole();
    if (!role) return { error: "Not authenticated" };
    if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };
    const supabase = await createClient();
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/classes");
    revalidatePath("/admin/library");
    revalidatePath("/staff");
    revalidatePath("/staff/materials");
    revalidatePath("/staff/resources");
    revalidatePath("/student");
    revalidatePath("/student/materials");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete material" };
  }
}

export async function createTimetableSlot(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

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
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("timetable").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/staff");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { success: true };
}

export async function assignStudentToClass(studentId: string, classId: string | null) {
  const role = await getCallerRole();
  if (!role || role !== "admin") return { error: "Unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ class_id: classId }).eq("id", studentId);
  if (error) return { error: error.message };
  revalidatePath("/admin/classes");
  revalidatePath("/admin/students");
  return { success: true };
}

export async function uploadSingleMaterial(formData: FormData): Promise<{ success?: boolean; error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data: upProfile } = await supabase.from("profiles").select("role_id").eq("id", user.id).maybeSingle();
    if (!upProfile?.role_id) return { error: "Unauthorized" };
    const { data: upRoleRow } = await supabase.from("roles").select("name").eq("id", upProfile.role_id).maybeSingle();
    const upRole = (upRoleRow as { name?: string } | null)?.name;
    if (upRole !== "admin" && upRole !== "staff") return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    if (!title?.trim()) return { error: "Title is required" };
    if (title.length > 500) return { error: "Title too long" };
    const level_id = (formData.get("level_id") as string) || null;
    const folder_id = (formData.get("folder_id") as string) || null;
    const week_number = formData.get("week_number") ? parseInt(formData.get("week_number") as string) : null;
    const is_public = formData.get("is_public") === "true";
    const teacher_only = formData.get("teacher_only") === "true";
    const student_level_id = (formData.get("student_level_id") as string) || null;
    const file = formData.get("file") as File | null;

    if (!title || !file || file.size === 0) return { error: "Title and file are required" };

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const material_type =
      fileExt === "pdf" ? "pdf" :
      ["doc", "docx"].includes(fileExt ?? "") ? "document" :
      ["mp3", "wav", "m4a"].includes(fileExt ?? "") ? "audio" :
      ["mp4", "mov"].includes(fileExt ?? "") ? "video" : "other";

    const bucket = folder_id ? `folders/${folder_id}` : level_id ? level_id : "general";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

    const { data: urlData } = supabase.storage.from("course-materials").getPublicUrl(filePath);

    const { data: row, error } = await supabase.from("materials").insert({
      title,
      material_type,
      url: urlData.publicUrl,
      file_path: filePath,
      level_id,
      folder_id,
      week_number,
      is_public,
      teacher_only,
      student_level_id: student_level_id || null,
      uploaded_by: user.id,
    }).select("id").single();

    if (error) return { error: error.message };

    revalidatePath("/admin/library");
    revalidatePath("/staff/materials");
    revalidatePath("/student/materials");
    return { success: true, id: row?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An unexpected error occurred" };
  }
}

export async function createAssignment(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };
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
