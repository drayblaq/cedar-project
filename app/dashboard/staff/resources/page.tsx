import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ResourceExplorer } from "@/components/dashboard/ResourceExplorer";

const C = { ink: "#0f172a", muted: "#64748b", border: "#e2e8f0" };

export default async function StaffResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Get this staff member's assigned class level IDs
  const { data: staffClasses } = await supabase
    .from("staff_classes")
    .select("class:classes(id, level_id)")
    .eq("profile_id", user.id);

  type ClassRaw = { id: string; level_id: string | null };
  const levelIds = new Set<string>();
  for (const sc of staffClasses ?? []) {
    const cls = (Array.isArray(sc.class) ? sc.class[0] : sc.class) as ClassRaw | null;
    if (cls?.level_id) levelIds.add(cls.level_id);
  }

  // Pass undefined so ResourceExplorer shows all if no classes assigned yet
  const allowedLevelIds = levelIds.size > 0 ? [...levelIds] : undefined;

  return (
    <div>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Resources
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          Your teaching materials and lesson plans.
        </p>
      </div>
      <ResourceExplorer isAdmin={false} allowedLevelIds={allowedLevelIds} />
    </div>
  );
}
