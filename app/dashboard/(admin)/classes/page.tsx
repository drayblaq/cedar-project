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
    .select("class_id, profile_id, profiles(full_name)");
  const staffByClass: Record<string, { profileId: string; name: string }[]> = {};
  for (const sc of staffClasses ?? []) {
    const cid = (sc as { class_id: string }).class_id;
    const pid = (sc as { profile_id: string }).profile_id;
    const prof = (sc as { profiles?: { full_name?: string } | { full_name?: string }[] }).profiles;
    const name = Array.isArray(prof) ? prof[0]?.full_name : prof?.full_name;
    if (!staffByClass[cid]) staffByClass[cid] = [];
    if (name) staffByClass[cid].push({ profileId: pid, name });
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
      staff: staffByClass[c.id] ?? [] as { profileId: string; name: string }[],
      studentCount: c.level_id ? (countByLevel[c.level_id as string] ?? 0) : 0,
    };
  });

  // Students (for class panel roster)
  const { data: studentsRaw } = await supabase.from("students").select("id, full_name, class_id").eq("status", "active").order("full_name");
  const students = (studentsRaw ?? []).map((s) => ({
    id: s.id as string,
    full_name: s.full_name as string,
    class_id: (s.class_id as string | null) ?? null,
  }));

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

  return (
    <ClassesTabs
      levels={(levels ?? []) as { id: string; name: string }[]}
      staff={(staffList ?? []) as { id: string; full_name: string | null }[]}
      classes={classes}
      timetable={timetable}
      students={students}
    />
  );
}
