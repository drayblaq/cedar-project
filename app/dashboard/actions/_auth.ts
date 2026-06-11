import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated caller's role name, or null if unauthenticated / no role.
 * Used as a fast auth guard at the top of server actions.
 */
export async function getCallerRole(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.role_id) return null;
  const { data: roleRow } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .maybeSingle();
  return (roleRow as { name?: string } | null)?.name ?? null;
}
