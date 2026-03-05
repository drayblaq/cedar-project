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

  const { error } = await supabase.from("students").insert({
    full_name,
    email,
    phone,
    level_id: level_id || null,
    enrollment_date: enrollment_date || null,
    notes: notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const enrollment_date = (formData.get("enrollment_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const { error } = await supabase
    .from("students")
    .update({
      full_name,
      email,
      phone,
      level_id: level_id || null,
      enrollment_date: enrollment_date || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  redirect("/dashboard/students");
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  return { error: null };
}

export async function createPayment(formData: FormData) {
  const supabase = await createClient();
  const student_id = formData.get("student_id") as string;
  const amount = Number(formData.get("amount"));
  const currency = (formData.get("currency") as string) || "XOF";
  const paid_at = (formData.get("paid_at") as string) || new Date().toISOString();
  const notes = (formData.get("notes") as string) || null;

  const { error } = await supabase.from("payments").insert({
    student_id,
    amount,
    currency,
    paid_at,
    notes,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  redirect("/dashboard/payments");
}

export async function saveAttendance(formData: FormData) {
  const supabase = await createClient();
  const date = formData.get("date") as string;
  if (!date) return { error: "Missing date" };

  const rows: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_") && typeof value === "string") {
      const studentId = key.slice(7);
      rows[studentId] = value === "absent" || value === "late" ? value : "present";
    }
  }

  for (const [studentId, status] of Object.entries(rows)) {
    const { error } = await supabase
      .from("attendance")
      .upsert(
        { student_id: studentId, date, status },
        { onConflict: "student_id,date" }
      );
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  return { error: null };
}

// ---------- Phase 4: Grades, announcements, calendar ----------
export async function createGrade(formData: FormData) {
  const supabase = await createClient();
  const student_id = formData.get("student_id") as string;
  const academic_term_id = (formData.get("academic_term_id") as string) || null;
  const subject_or_type = (formData.get("subject_or_type") as string) || "general";
  const score = formData.get("score") ? Number(formData.get("score")) : null;
  const remarks = (formData.get("remarks") as string) || null;
  const { error } = await supabase.from("grades").insert({
    student_id,
    academic_term_id: academic_term_id || null,
    subject_or_type,
    score: score ?? null,
    remarks,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/grades");
  redirect("/dashboard/grades");
}

export async function deleteGrade(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/grades");
  return { error: null };
}

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

// ---------- Phase 5: Classes, staff assignment, assignments ----------
export async function createClass(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const level_id = formData.get("level_id") as string;
  const { error } = await supabase.from("classes").insert({ name, level_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

export async function assignStaffToClass(formData: FormData) {
  const supabase = await createClient();
  const profile_id = formData.get("profile_id") as string;
  const class_id = formData.get("class_id") as string;
  const { error } = await supabase.from("staff_classes").insert({ profile_id, class_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

export async function removeStaffFromClass(profileId: string, classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff_classes").delete().eq("profile_id", profileId).eq("class_id", classId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  return { error: null };
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const level_id = (formData.get("level_id") as string) || null;
  const class_id = (formData.get("class_id") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const { error } = await supabase.from("assignments").insert({
    title,
    description,
    level_id: level_id || null,
    class_id: class_id || null,
    due_date: due_date || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes");
}

// ---------- Student login invite (admin only, paid students only) ----------
export async function inviteStudentLogin(studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can send login invites" };

  const { data: student } = await supabase
    .from("students")
    .select("id, email, user_id")
    .eq("id", studentId)
    .single();
  if (!student) return { error: "Student not found" };
  if (student.user_id) return { error: "This student already has a portal login" };

  const { data: payments } = await supabase
    .from("payments")
    .select("id")
    .eq("student_id", studentId)
    .limit(1);
  if (!payments?.length) return { error: "Student must have at least one payment before receiving a login" };

  try {
    const admin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const { error } = await admin.auth.admin.inviteUserByEmail(student.email, {
      redirectTo: `${siteUrl}/auth/login`,
    });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send invite" };
  }

  revalidatePath("/dashboard/students");
  return { error: null };
}

// ---------- Parent–student links (admin only) ----------
export async function linkParentToStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can link parents to students" };

  const parent_id = formData.get("parent_id") as string;
  const student_id = formData.get("student_id") as string;
  if (!parent_id || !student_id) return { error: "Parent and student required" };

  const { error } = await supabase.from("parent_students").insert({ parent_id, student_id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/parent-links");
  revalidatePath("/dashboard/parent");
  return { error: null };
}

export async function unlinkParentFromStudent(linkId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) return { error: "No role" };
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") return { error: "Only admin can unlink" };

  const { error } = await supabase.from("parent_students").delete().eq("id", linkId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/parent-links");
  revalidatePath("/dashboard/parent");
  return { error: null };
}
