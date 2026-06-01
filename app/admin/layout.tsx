import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CedarShell } from "@/app/dashboard/CedarShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) redirect("/auth/login?next=/admin");

  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "admin") redirect("/auth/login?next=/admin");

  return <CedarShell>{children}</CedarShell>;
}
