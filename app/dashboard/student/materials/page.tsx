import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StudentLibraryExplorer } from "./StudentLibraryExplorer";

const C = { ink: "#0f172a", muted: "#64748b", border: "#e2e8f0" };

export default async function StudentMaterialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id, level_id, levels(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  type LevelRow = { name: string } | { name: string }[] | null;
  const rawLevel = student?.levels as LevelRow;
  const levelName = Array.isArray(rawLevel) ? rawLevel[0]?.name : rawLevel?.name;

  let materialsQuery = supabase
    .from("materials")
    .select("id, title, material_type, url, folder_id, created_at, student_level_id, library_folders(id, name, parent_id)")
    .eq("teacher_only", false)
    .order("title");

  if (student?.level_id) {
    materialsQuery = materialsQuery.or(
      `is_public.eq.true,student_level_id.eq.${student.level_id},student_level_id.is.null`
    );
  } else {
    materialsQuery = materialsQuery.eq("is_public", true);
  }

  const { data: materialsRaw } = await materialsQuery;

  return (
    <div>
      <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${C.border}`, background: "#fff" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, marginBottom: 4 }}>
          Library
        </h1>
        <p style={{ fontSize: 13, color: C.muted, paddingBottom: 16 }}>
          {levelName ? `Level ${levelName} · ` : ""}Your learning materials
        </p>
      </div>
      <StudentLibraryExplorer
        materials={(materialsRaw ?? []) as Parameters<typeof StudentLibraryExplorer>[0]["materials"]}
      />
    </div>
  );
}
