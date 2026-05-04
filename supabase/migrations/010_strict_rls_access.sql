-- Strict role-scoped read policies to replace broad USING (true)

CREATE OR REPLACE FUNCTION public.is_parent_of_student(p_student_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parent_students ps
    WHERE ps.parent_id = auth.uid() AND ps.student_id = p_student_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff_for_student(p_student_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.staff_classes sc ON sc.profile_id = auth.uid()
    JOIN public.classes c ON c.id = sc.class_id
    WHERE s.id = p_student_id AND s.level_id = c.level_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_access_student(p_student_id uuid)
RETURNS boolean AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = p_student_id AND s.user_id = auth.uid()
    )
    OR public.is_parent_of_student(p_student_id)
    OR public.is_staff_for_student(p_student_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "students_select" ON public.students;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "attendance_select" ON public.attendance;
DROP POLICY IF EXISTS "grades_select" ON public.grades;

CREATE POLICY "students_select_scoped" ON public.students
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR public.is_parent_of_student(id)
  OR public.is_staff_for_student(id)
);

CREATE POLICY "payments_select_scoped" ON public.payments
FOR SELECT TO authenticated
USING (public.can_access_student(student_id));

CREATE POLICY "attendance_select_scoped" ON public.attendance
FOR SELECT TO authenticated
USING (public.can_access_student(student_id));

CREATE POLICY "grades_select_scoped" ON public.grades
FOR SELECT TO authenticated
USING (public.can_access_student(student_id));
