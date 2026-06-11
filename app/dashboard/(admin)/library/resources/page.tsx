import { createClient } from "@/lib/supabase/server";
import { ResourcesClient, type ResourceMaterial } from "@/app/dashboard/staff/resources/ResourcesClient";

const C = { ink: "#0f172a", muted: "#64748b", border: "#e2e8f0", bg: "#f8fafc" };

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  const { data: materialsRaw } = await supabase
    .from("materials")
    .select("id, title, description, material_type, url, level_id, week_number, teacher_only, levels(name)")
    .eq("teacher_only", true)
    .order("level_id", { nullsFirst: false })
    .order("week_number", { ascending: true, nullsFirst: false })
    .order("title");

  const materials = (materialsRaw ?? []) as ResourceMaterial[];

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Teacher Resources
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          All teacher-only materials across every level.
        </p>
      </div>

      <ResourcesClient materials={materials} />
    </div>
  );
}
