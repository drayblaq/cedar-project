import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  level_id: string | null;
  enrollment_date: string | null;
  levels?: { name: string } | { name: string }[] | null;
};

/**
 * Returns the current user's linked student record if they have role "student".
 * Runs link logic (invited student by email) if needed. Use in student portal pages only.
 */
export async function getStudentForCurrentUser(): Promise<{
  student: StudentRow | null;
  userId: string;
} | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .single();
  if (!profile?.role_id) return null;

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();
  if (role?.name !== "student") return null;

  // Link this auth user to the student record (invited students: same email, not yet linked)
  try {
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("email", user.email ?? "")
      .is("user_id", null)
      .limit(1)
      .maybeSingle();
    if (existing?.id) {
      const admin = createAdminClient();
      await admin.from("students").update({ user_id: user.id }).eq("id", existing.id);
    }
  } catch {
    // Ignore if admin client not configured or update fails
  }

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, phone, level_id, enrollment_date, levels(name)")
    .eq("user_id", user.id)
    .single();

  return { student: student as StudentRow | null, userId: user.id };
}

export function levelName(levels: StudentRow["levels"]): string {
  if (!levels) return "—";
  const name = Array.isArray(levels) ? (levels[0] as { name?: string })?.name : (levels as { name?: string })?.name;
  return name ?? "—";
}
