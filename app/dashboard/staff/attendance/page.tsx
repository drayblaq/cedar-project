import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/dashboard/actions/index";
import AttendanceForm from "@/app/dashboard/(admin)/attendance/AttendanceForm";
import Link from "next/link";

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; class?: string }>;
}) {
  const t = await getTranslations("dashboard.staff");
  const tc = await getTranslations("dashboard.common");
  const { date: dateParam, class: classIdParam } = await searchParams;
  const date = dateParam || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myClasses } = await supabase
    .from("staff_classes")
    .select("class_id, classes(id, name, level_id, levels(name))")
    .eq("profile_id", user.id);

  const classList = (myClasses ?? []).map((row: { class_id: string; classes: unknown }) => {
    const c = row.classes as { id: string; name: string; level_id: string; levels: { name: string } | null } | null;
    return c ? { id: c.id, name: c.name, levelId: c.level_id, levelName: c.levels?.name } : null;
  }).filter(Boolean) as { id: string; name: string; levelId: string; levelName: string }[];

  let students: { id: string; full_name: string; levels: { name: string } | null }[] = [];
  let selectedClass = classList[0];

  if (classIdParam && classList.some((c) => c.id === classIdParam)) {
    selectedClass = classList.find((c) => c.id === classIdParam) ?? classList[0];
    if (selectedClass?.levelId) {
      const { data: studentsRaw } = await supabase
        .from("students")
        .select("id, full_name, levels(name)")
        .eq("level_id", selectedClass.levelId)
        .order("full_name");
      students = (studentsRaw ?? []).map((s: { id: string; full_name: string; levels: unknown }) => ({
        id: s.id,
        full_name: s.full_name,
        levels: Array.isArray(s.levels) ? (s.levels[0] ?? null) : (s.levels as { name: string } | null),
      }));
    }
  } else if (classList[0]?.levelId) {
    selectedClass = classList[0];
    const { data: studentsRaw } = await supabase
      .from("students")
      .select("id, full_name, levels(name)")
      .eq("level_id", classList[0].levelId)
      .order("full_name");
    students = (studentsRaw ?? []).map((s: { id: string; full_name: string; levels: unknown }) => ({
      id: s.id,
      full_name: s.full_name,
      levels: Array.isArray(s.levels) ? (s.levels[0] ?? null) : (s.levels as { name: string } | null),
    }));
  }

  const { data: existing } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("date", date);
  const byStudent = (existing ?? []).reduce(
    (acc: Record<string, string>, r: { student_id: string; status: string }) => {
      acc[r.student_id] = r.status;
      return acc;
    },
    {}
  );

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <Link href="/staff" style={{ fontSize: 13, color: "#687a6c", textDecoration: "none", display: "inline-block", marginBottom: 14 }}>
        ← {t("backToClasses")}
      </Link>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: "#16241a" }}>{t("markAttendance")}</h1>
        <p style={{ fontSize: 13.5, color: "#687a6c", marginTop: 4 }}>
          {selectedClass ? `${tc("level")}: ${selectedClass.name} (${selectedClass.levelName})` : t("selectClass")}
        </p>
      </div>

      {classList.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {classList.map((c) => {
            const on = classIdParam === c.id || (!classIdParam && c.id === classList[0]?.id);
            return (
              <Link key={c.id} href={`/staff/attendance?class=${c.id}&date=${date}`}
                className={"cd-chip" + (on ? " cd-chip-on" : "")} style={{ textDecoration: "none" }}>
                {c.name}
              </Link>
            );
          })}
        </div>
      )}

      <AttendanceForm
        date={date}
        students={students}
        initialStatus={byStudent}
        saveAction={saveAttendance}
        basePath="/staff/attendance"
      />
    </div>
  );
}
