"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const body = (formData.get("body") as string) || null;
  const { error } = await supabase.from("announcements").insert({ title, body });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/announcements");
  redirect("/dashboard/announcements");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/announcements");
  return { error: null };
}
