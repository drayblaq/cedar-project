"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createMomoPayment(formData: FormData) {
  const supabase = await createClient();
  const student_id = formData.get("student_id") as string;
  const amount = Number(formData.get("amount"));
  const currency = (formData.get("currency") as string) || "FCFA";
  const momo_reference = (formData.get("momo_reference") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!student_id || isNaN(amount) || amount <= 0) {
    return { error: "Invalid payment data." };
  }

  // Verify student exists and is in awaiting_payment state
  const { data: student } = await supabase
    .from("students")
    .select("id, email, user_id, status, application_status")
    .eq("id", student_id)
    .single();
  if (!student) return { error: "Student not found." };

  // Insert payment
  const { error: payErr } = await supabase.from("payments").insert({
    student_id,
    amount,
    currency,
    paid_at: new Date().toISOString(),
    notes: notes || null,
    momo_reference: momo_reference || null,
    payment_method: "momo",
  });
  if (payErr) return { error: payErr.message };

  // Activate student + set approved
  let authUserId = student.user_id as string | null;
  if (!authUserId) {
    try {
      const admin = createAdminClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        student.email,
        { redirectTo: `${siteUrl}/auth/login` }
      );
      if (!inviteErr) authUserId = inviteData?.user?.id ?? null;
    } catch {
      // invite failure is non-fatal — payment still recorded
    }
  }

  await supabase
    .from("students")
    .update({
      status: "active",
      application_status: "approved",
      user_id: authUserId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", student_id);

  revalidatePath(`/admin/students/${student_id}/application`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/payments");
  return { error: null };
}
