"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
