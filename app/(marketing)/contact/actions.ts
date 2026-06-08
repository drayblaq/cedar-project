"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactForm(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in all required fields" };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, message });

  if (error) return { error: "Failed to send message. Please try again." };
  return { success: true };
}
