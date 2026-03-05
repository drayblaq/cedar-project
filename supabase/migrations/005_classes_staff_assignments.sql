-- Phase 5: classes, staff-class assignment, assignments
-- Run after 004. Run in Supabase SQL Editor.

-- Classes: e.g. "Beginner A", "Intermediate B"; linked to a level
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_level ON public.classes(level_id);

-- Staff assigned to classes (profile_id = auth user with role staff)
CREATE TABLE IF NOT EXISTS public.staff_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_classes_profile ON public.staff_classes(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_classes_class ON public.staff_classes(class_id);

-- Assignments: per level (or per class); staff can add for their classes
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_level ON public.assignments(level_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);

-- Helper: true if current user has role 'staff'
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'staff'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: true if current user (staff) is assigned to the given class_id
CREATE OR REPLACE FUNCTION public.staff_teaches_class(p_class_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_classes sc
    WHERE sc.profile_id = auth.uid() AND sc.class_id = p_class_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Classes: admin all; staff can read classes they teach
CREATE POLICY "classes_select_admin" ON public.classes FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "classes_select_staff" ON public.classes FOR SELECT TO authenticated USING (public.staff_teaches_class(id));
CREATE POLICY "classes_insert" ON public.classes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "classes_update" ON public.classes FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "classes_delete" ON public.classes FOR DELETE TO authenticated USING (public.is_admin());

-- Staff_classes: admin manage; staff can read own
CREATE POLICY "staff_classes_select" ON public.staff_classes FOR SELECT TO authenticated USING (public.is_admin() OR profile_id = auth.uid());
CREATE POLICY "staff_classes_insert" ON public.staff_classes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "staff_classes_delete" ON public.staff_classes FOR DELETE TO authenticated USING (public.is_admin());

-- Assignments: admin all; staff read/write for their classes' levels
CREATE POLICY "assignments_select_admin" ON public.assignments FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "assignments_select_staff" ON public.assignments FOR SELECT TO authenticated
  USING (public.is_staff() AND (
    class_id IS NOT NULL AND public.staff_teaches_class(class_id)
    OR level_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.staff_classes sc
      JOIN public.classes c ON c.id = sc.class_id
      WHERE sc.profile_id = auth.uid() AND c.level_id = assignments.level_id
    )
  ));
CREATE POLICY "assignments_insert" ON public.assignments FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_staff());
CREATE POLICY "assignments_update" ON public.assignments FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_staff());
CREATE POLICY "assignments_delete" ON public.assignments FOR DELETE TO authenticated USING (public.is_admin() OR public.is_staff());

-- Allow staff to insert/update grades for students in their classes (student's level in staff's classes)
CREATE POLICY "grades_insert_staff" ON public.grades FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.staff_classes sc ON sc.profile_id = auth.uid()
    JOIN public.classes c ON c.id = sc.class_id
    WHERE s.id = grades.student_id AND s.level_id = c.level_id
  ));
CREATE POLICY "grades_update_staff" ON public.grades FOR UPDATE TO authenticated
  USING (public.is_staff() AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.staff_classes sc ON sc.profile_id = auth.uid()
    JOIN public.classes c ON c.id = sc.class_id
    WHERE s.id = grades.student_id AND s.level_id = c.level_id
  ));

-- Allow staff to read/write attendance for students in their classes (same pattern)
-- Attendance: add policy for staff to insert/update for students in their level/class
CREATE POLICY "attendance_insert_staff" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.staff_classes sc ON sc.profile_id = auth.uid()
    JOIN public.classes c ON c.id = sc.class_id
    WHERE s.id = attendance.student_id AND s.level_id = c.level_id
  ));
CREATE POLICY "attendance_update_staff" ON public.attendance FOR UPDATE TO authenticated
  USING (public.is_staff() AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.staff_classes sc ON sc.profile_id = auth.uid()
    JOIN public.classes c ON c.id = sc.class_id
    WHERE s.id = attendance.student_id AND s.level_id = c.level_id
  ));
