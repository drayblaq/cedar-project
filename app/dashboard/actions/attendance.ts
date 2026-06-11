"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCallerRole } from "./_auth";

export async function saveAttendance(formData: FormData) {
  const role = await getCallerRole();
  if (!role) return { error: "Not authenticated" };
  if (role !== "admin" && role !== "staff") return { error: "Unauthorized" };

  const supabase = await createClient();
  const date = formData.get("date") as string;
  if (!date) return { error: "Missing date" };
  if (isNaN(new Date(date).getTime())) return { error: "Invalid date format" };

  const rows: Record<string, string> = {};
  // Only 'present' / 'absent' are valid. Unmarked students are not submitted.
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_") && typeof value === "string") {
      const studentId = key.slice(7);
      rows[studentId] = value === "absent" ? "absent" : "present";
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
