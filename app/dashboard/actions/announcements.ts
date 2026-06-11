"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCallerRole } from "./_auth";

export async function createAnnouncement(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };
  if (title.length > 500) return { error: "Title too long" };
  const body = (formData.get("body") as string) || null;
  const { error } = await supabase.from("announcements").insert({ title, body });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}

export async function deleteAnnouncement(id: string) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/announcements");
  return { error: null };
}
