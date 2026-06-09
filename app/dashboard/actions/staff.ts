"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteStaffMember(formData: FormData) {
  const email = formData.get("email") as string;
  const full_name = formData.get("full_name") as string;
  const roleName = formData.get("role") as string;

  if (!email || !full_name || !roleName) return { error: "All fields are required" };

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Guard: only admins may call this
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (profile?.role_id) {
    const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
    if (role?.name !== "admin") return { error: "Only admins can invite staff" };
  }

  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
  });

  if (inviteError) return { error: inviteError.message };

  const { data: roleRow } = await supabase.from("roles").select("id").eq("name", roleName).maybeSingle();

  if (roleRow) {
    await adminSupabase.from("profiles").upsert({
      id: inviteData.user.id,
      full_name,
      role_id: roleRow.id,
    });
  }

  revalidatePath("/admin/staff");
  return { success: true, message: `Invitation sent to ${email} — they will receive an email to set their password.` };
}

export async function updateStaffRole(userId: string, roleName: string) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (profile?.role_id) {
    const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
    if (role?.name !== "admin") return { error: "Only admins can update roles" };
  }

  const { data: role } = await supabase.from("roles").select("id").eq("name", roleName).maybeSingle();
  if (!role) return { error: "Role not found" };

  const { error } = await adminSupabase.from("profiles").update({ role_id: role.id }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/staff");
  return { success: true };
}
