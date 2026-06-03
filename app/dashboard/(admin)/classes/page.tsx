import { createClient } from "@/lib/supabase/server";
import { ClassesTabs } from "./ClassesTabs";

export default async function ClassesPage() {
  const supabase = await createClient();

  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const { data: classesRaw } = await supabase.from("classes").select("id, name, level_id, levels(name)").order("name");
  const { data: staffRole } = await supabase.from("roles").select("id").eq("name", "staff").single();
  const { data: staffList } = staffRole
    ? await supabase.from("profiles").select("id, full_name").eq("role_id", staffRole.id)
    : { data: [] };

  // Staff assignments per class
  const { data: staffClasses } = await supabase
    .from("staff_classes")
    .select("class_id, profiles(full_name)");
  const staffByClass: Record<string, string[]> = {};
  for (const sc of staffClasses ?? []) {
    const cid = (sc as { class_id: string }).class_id;
    const prof = (sc as { profiles?: { full_name?: string } | { full_name?: string }[] }).profiles;
    const name = Array.isArray(prof) ? prof[0]?.full_name : prof?.full_name;
    if (!staffByClass[cid]) staffByClass[cid] = [];
    if (name) staffByClass[cid].push(name);
  }

  // Student counts per level
  const { data: studentLevels } = await supabase.from("students").select("level_id");
  const countByLevel: Record<string, number> = {};
  for (const s of studentLevels ?? []) {
    const lid = (s as { level_id: string | null }).level_id;
    if (lid) countByLevel[lid] = (countByLevel[lid] ?? 0) + 1;
  }

  const classes = (classesRaw ?? []).map((c) => {
    const lvl = Array.isArray(c.levels) ? (c.levels[0] as { name?: string })?.name : (c.levels as { name?: string } | null)?.name;
    return {
      id: c.id,
      name: c.name,
      level_id: c.level_id as string,
      levelName: lvl ?? "—",
      staff: staffByClass[c.id] ?? [],
      studentCount: c.level_id ? (countByLevel[c.level_id as string] ?? 0) : 0,
    };
  });

  // Timetable with class name
  const { data: ttRaw } = await supabase
    .from("timetable")
    .select("id, class_id, day_of_week, start_time, end_time, room, classes(name)")
    .order("day_of_week")
    .order("start_time");
  const timetable = (ttRaw ?? []).map((s) => {
    const cls = Array.isArray(s.classes) ? (s.classes[0] as { name?: string })?.name : (s.classes as { name?: string } | null)?.name;
    return {
      id: s.id as string,
      class_id: s.class_id as string,
      className: cls ?? "—",
      day_of_week: s.day_of_week as number,
      start_time: s.start_time as string,
      end_time: s.end_time as string,
      room: (s.room as string | null) ?? null,
    };
  });

  // Materials with level name
  const { data: matRaw } = await supabase
    .from("materials")
    .select("id, title, material_type, url, week_number, topic, level_id, is_public, levels(name)")
    .order("created_at", { ascending: false });
  const materials = (matRaw ?? []).map((m) => {
    const lvl = Array.isArray(m.levels) ? (m.levels[0] as { name?: string })?.name : (m.levels as { name?: string } | null)?.name;
    return {
      id: m.id as string,
      title: m.title as string,
      material_type: m.material_type as string,
      url: (m.url as string | null) ?? null,
      week_number: (m.week_number as number | null) ?? null,
      topic: (m.topic as string | null) ?? null,
      levelName: m.is_public ? "All students" : (lvl ?? "—"),
    };
  });

  return (
    <ClassesTabs
      levels={(levels ?? []) as { id: string; name: string }[]}
      staff={(staffList ?? []) as { id: string; full_name: string | null }[]}
      classes={classes}
      timetable={timetable}
      materials={materials}
    />
  );
}
