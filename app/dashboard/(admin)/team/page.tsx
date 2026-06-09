import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageClient } from "./StaffPageClient";

const C = { ink: "#16241a", muted: "#687a6c" };

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch all roles to get admin/staff role ids
  const { data: roles } = await supabase.from("roles").select("id, name");
  const staffRoleIds = (roles ?? [])
    .filter(r => r.name === "staff" || r.name === "admin")
    .map(r => r.id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role_id, created_at")
    .in("role_id", staffRoleIds.length ? staffRoleIds : ["__none__"])
    .order("created_at");

  // Fetch emails via admin client (auth.admin.listUsers)
  let emailMap: Record<string, string> = {};
  try {
    const adminSupabase = createAdminClient();
    const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authUsers) emailMap[u.id] = u.email ?? "";
  } catch {
    // Service role not configured — emails won't show
  }

  const roleNameMap = Object.fromEntries((roles ?? []).map(r => [r.id, r.name]));

  const staffUsers = (profiles ?? []).map(p => ({
    id: p.id,
    full_name: p.full_name ?? null,
    email: emailMap[p.id] ?? null,
    created_at: p.created_at ?? null,
    roleName: p.role_id ? (roleNameMap[p.role_id] ?? null) : null,
  }));

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Staff Management</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
          Invite teachers and admins — no Supabase dashboard needed.
        </p>
      </div>
      <StaffPageClient staffUsers={staffUsers} currentUserId={user.id} />
    </div>
  );
}
