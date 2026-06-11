"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCallerRole } from "./_auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createStudent(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!full_name?.trim()) return { error: "Full name is required" };
  if (!email || !EMAIL_RE.test(email)) return { error: "Valid email address is required" };

  const phone = (formData.get("phone") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const enrollment_date = (formData.get("enrollment_date") as string) || null;
  const status = (formData.get("status") as string) || "active";

  // Personal
  const date_of_birth = (formData.get("dob") as string) || null;
  const gender = (formData.get("gender") as string) || null;
  const nationality = (formData.get("nationality") as string) || null;
  const resident_address = (formData.get("resident_address") as string) || null;
  const why_learn_english = (formData.get("why_learn_english") as string) || null;

  // Academic / status
  const application_status = (formData.get("application_status") as string) || "submitted";
  const discovery_channel = (formData.get("discovery") as string) || null;
  const educational_level = (formData.get("educational_level") as string) || null;
  const program = (formData.get("program") as string) || null;

  // Guardian / emergency contact (optional)
  const guardian_name = (formData.get("guardian_name") as string) || null;
  const guardian_phone = (formData.get("guardian_phone") as string) || null;
  const guardian_address = (formData.get("guardian_address") as string) || null;
  const parent_email = (formData.get("parent_email") as string) || null;

  // Fold fields that have no dedicated column into notes
  const baseNotes = (formData.get("notes") as string) || "";
  const extra: string[] = [];
  if (program) extra.push(`Program: ${program.replace(/_/g, " ")}`);
  const notes = [baseNotes, ...extra].filter(Boolean).join("\n") || null;

  const { error } = await supabase.from("students").insert({
    full_name,
    email,
    phone,
    whatsapp: phone,
    level_id: level_id || null,
    enrollment_date: enrollment_date || null,
    date_of_birth,
    gender: gender || null,
    nationality,
    resident_address,
    why_learn_english,
    application_status,
    discovery_channel,
    educational_level,
    guardian_name,
    guardian_phone,
    guardian_address,
    parent_whatsapp: guardian_phone,
    parent_email,
    status,
    notes,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin") return { error: "Unauthorized" };

  const supabase = await createClient();
  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!full_name?.trim()) return { error: "Full name is required" };
  if (!email || !EMAIL_RE.test(email)) return { error: "Valid email address is required" };
  const phone = (formData.get("phone") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const enrollment_date = (formData.get("enrollment_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as string) || "active";

  // Personal
  const date_of_birth = (formData.get("dob") as string) || null;
  const gender = (formData.get("gender") as string) || null;
  const nationality = (formData.get("nationality") as string) || null;

  // Academic / status
  const application_status = (formData.get("application_status") as string) || "submitted";
  const discovery_channel = (formData.get("discovery") as string) || null;

  // Parent / guardian
  const parent_whatsapp = (formData.get("parent_phone") as string) || null;
  const parent_email = (formData.get("parent_email") as string) || null;

  const class_id = (formData.get("class_id") as string) || null;

  const { error } = await supabase
    .from("students")
    .update({
      full_name,
      email,
      phone,
      whatsapp: phone,
      level_id: level_id || null,
      class_id: class_id || null,
      enrollment_date: enrollment_date || null,
      date_of_birth,
      gender: gender || null,
      nationality,
      application_status,
      discovery_channel,
      parent_whatsapp,
      parent_email,
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

  // Only an admin may delete a student account.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  let roleName: string | null = null;
  if (profile?.role_id) {
    const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
    roleName = role?.name ?? null;
  }
  if (roleName !== "admin") return { error: "Only admins can delete student accounts." };

  // Capture the linked auth user before removing the record.
  const { data: studentRow } = await supabase.from("students").select("user_id").eq("id", id).maybeSingle();

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { error: error.message };

  // Best-effort: also remove the linked login account so the email can be reused.
  const linkedUserId = (studentRow as { user_id?: string | null } | null)?.user_id;
  if (linkedUserId) {
    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(linkedUserId);
    } catch {
      // Service role not configured or user already gone — student record is still deleted.
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
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
