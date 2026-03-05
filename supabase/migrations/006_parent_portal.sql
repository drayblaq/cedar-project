-- Phase 7: Parent portal – link parents to students
-- Run after 005. Run in Supabase SQL Editor.

-- Parent–student links (parent_id = profiles.id = auth user id of parent)
CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON public.parent_students(student_id);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- Helper: true if current user has role 'parent'
CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'parent'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Parents can read their own links; admin can do everything
CREATE POLICY "parent_students_select_own" ON public.parent_students
  FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "parent_students_select_admin" ON public.parent_students
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "parent_students_insert" ON public.parent_students
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "parent_students_delete" ON public.parent_students
  FOR DELETE TO authenticated USING (public.is_admin());
