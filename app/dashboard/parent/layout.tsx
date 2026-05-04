import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ParentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (!profile?.role_id) redirect("/auth/login");
  const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
  if (role?.name !== "parent") redirect("/auth/login");

  return <>{children}</>;
}
