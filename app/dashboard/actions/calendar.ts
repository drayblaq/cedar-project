"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAcademicTerm(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const { error } = await supabase.from("academic_terms").insert({ name, start_date, end_date });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
}

export async function createCalendarEvent(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const event_date = formData.get("event_date") as string;
  const event_type = (formData.get("event_type") as string) || "other";
  const { error } = await supabase.from("calendar_events").insert({
    title,
    description,
    event_date,
    event_type,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
}

export async function deleteCalendarEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  return { error: null };
}
