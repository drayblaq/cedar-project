"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const enrollment_date = (formData.get("enrollment_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as string) || "active";

  const { error } = await supabase.from("students").insert({
    full_name,
    email,
    phone,
    level_id: level_id || null,
    enrollment_date: enrollment_date || null,
    status,
    notes: notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const enrollment_date = (formData.get("enrollment_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as string) || "active";

  const { error } = await supabase
    .from("students")
    .update({
      full_name,
      email,
      phone,
      level_id: level_id || null,
      enrollment_date: enrollment_date || null,
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  redirect("/admin/students");
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/admin/students");
  return { error: null };
}

export async function inviteStudentLogin(studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { success: false, error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { success: false, error: "Only admin can send login invites" };

  const { data: student } = await supabase
    .from("students")
    .select("id, email, user_id")
    .eq("id", studentId)
    .single();
  if (!student) return { success: false, error: "Student not found" };
  if (student.user_id) return { success: false, error: "This student already has a portal login" };

  const { data: payments } = await supabase
    .from("payments")
    .select("id")
    .eq("student_id", studentId)
    .limit(1);
  if (!payments?.length) return { success: false, error: "Student must have at least one payment before receiving a login" };

  try {
    const admin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const redirectTo = `${siteUrl}/auth/login`;

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(student.email, { redirectTo });
    if (inviteError) {
      // If already invited (not yet accepted), fall back to a magic link so the resend works
      const msg = inviteError.message.toLowerCase();
      const alreadyExists = msg.includes("already") || msg.includes("registered") || msg.includes("exists");
      if (!alreadyExists) return { success: false, error: inviteError.message };

      const { error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: student.email,
        options: { redirectTo },
      });
      if (linkError) return { success: false, error: linkError.message };
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to send invite" };
  }

  await supabase
    .from("students")
    .update({ last_invite_sent_at: new Date().toISOString() })
    .eq("id", studentId);

  revalidatePath("/admin/students");
  return { success: true, error: null };
}

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "awaiting_payment"
  | "approved"
  | "rejected";

export async function setStudentApplicationStatus(
  studentId: string,
  applicationStatus: ApplicationStatus
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can update admission status" };

  const { error } = await supabase
    .from("students")
    .update({
      application_status: applicationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId);

  if (error) return { error: error.message };
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}/application`);
  return { error: null as null };
}
