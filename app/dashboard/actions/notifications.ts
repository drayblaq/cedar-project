"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { supabase, ok: false };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  return { supabase, ok: role?.name === "admin" };
}

/** Mark all notifications as read (admin only). */
export async function markNotificationsRead() {
  const { supabase, ok } = await isAdmin();
  if (!ok) return { error: "Not authorized" };
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

/** Mark a single notification as read (admin only). */
export async function markNotificationRead(id: string) {
  const { supabase, ok } = await isAdmin();
  if (!ok) return { error: "Not authorized" };
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}
