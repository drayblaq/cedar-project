"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createPayment(formData: FormData) {
  const supabase = await createClient();
  const student_id = formData.get("student_id") as string;
  const amount = Number(formData.get("amount"));
  const currency = (formData.get("currency") as string) || "FCFA";
  const paid_at = (formData.get("paid_at") as string) || new Date().toISOString();
  const notes = (formData.get("notes") as string) || null;
  const momo_reference = (formData.get("momo_reference") as string) || null;
  const payment_method = (formData.get("payment_method") as string) || "momo";

  const { error } = await supabase.from("payments").insert({
    student_id,
    amount,
    currency,
    paid_at,
    notes,
    momo_reference: momo_reference || null,
    payment_method,
  });

  if (error) return { error: error.message };
  await tryFinalizeEnrollmentAfterPayment(supabase, student_id);
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  redirect("/admin/payments");
}

async function tryFinalizeEnrollmentAfterPayment(supabase: SupabaseClient, studentId: string) {
  const { data: student } = await supabase
    .from("students")
    .select("id, email, user_id, status, application_status")
    .eq("id", studentId)
    .maybeSingle();
  if (!student || student.status !== "pending") return;
  const appStatus = student.application_status ?? "submitted";
  if (appStatus === "rejected") return;
  if (appStatus !== "approved" && appStatus !== "awaiting_payment") return;

  const { count } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId);
  if (!count || count < 1) return;

  let authUserId = student.user_id as string | null;
  if (!authUserId) {
    try {
      const admin = createAdminClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        student.email,
        { redirectTo: `${siteUrl}/auth/login` }
      );
      if (inviteError) return;
      authUserId = inviteData.user?.id ?? null;
    } catch {
      return;
    }
  }

  await supabase
    .from("students")
    .update({
      status: "active",
      user_id: authUserId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId);
}
