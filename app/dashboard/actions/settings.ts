"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ALLOWED_KEYS = new Set([
  "tuition_amount",
  "currency",
  "center_name",
  "center_phone",
  "center_email",
  "center_address",
]);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Not authenticated" as const };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  let roleName: string | null = null;
  if (profile?.role_id) {
    const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
    roleName = role?.name ?? null;
  }
  if (roleName !== "admin") return { supabase, error: "Only admins can change settings." as const };
  return { supabase, error: null };
}

/** Save every setting submitted by the settings form in one go. */
export async function updateSettings(formData: FormData) {
  const { supabase, error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const updates: { key: string; value: string; updated_at: string }[] = [];
  const now = new Date().toISOString();
  for (const key of ALLOWED_KEYS) {
    const v = formData.get(key);
    if (typeof v === "string") updates.push({ key, value: v.trim(), updated_at: now });
  }

  const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { success: true };
}
