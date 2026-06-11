"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function submitContactForm(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in all required fields" };
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address" };
  }
  if (message.length > 5000) {
    return { error: "Message too long (max 5000 characters)" };
  }

  // Rate limit: max 3 messages per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= 3) {
    return { error: "Too many submissions. Please try again later." };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, message });

  if (error) return { error: "Failed to send message. Please try again." };

  // Notify admins (best-effort, service role since the submitter is anonymous)
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      type: "contact",
      title: "New contact message",
      body: `${name} sent a message`,
      link: "/admin/messages",
    });
  } catch {
    // non-critical
  }

  return { success: true };
}
