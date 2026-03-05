-- Phase 4: grades, academic_terms, announcements
-- Run after 003. Run in Supabase SQL Editor.

-- Academic terms (e.g. "Term 1 2025", "Q1")
CREATE TABLE IF NOT EXISTS public.academic_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Calendar events (optional: holidays, exams, etc.)
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text DEFAULT 'other' CHECK (event_type IN ('holiday', 'exam', 'deadline', 'other')),
  created_at timestamptz DEFAULT now()
);

-- Grades: per student, per term (or general), with optional remarks
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_term_id uuid REFERENCES public.academic_terms(id) ON DELETE SET NULL,
  subject_or_type text NOT NULL DEFAULT 'general',
  score numeric(5, 2) CHECK (score >= 0 AND score <= 100),
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_term ON public.grades(academic_term_id);

-- Announcements: center-wide (all roles can read)
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published_at);

-- RLS
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Academic terms: authenticated read; admin write
CREATE POLICY "academic_terms_select" ON public.academic_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "academic_terms_insert" ON public.academic_terms FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "academic_terms_update" ON public.academic_terms FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "academic_terms_delete" ON public.academic_terms FOR DELETE TO authenticated USING (public.is_admin());

-- Calendar events: same
CREATE POLICY "calendar_events_select" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_events_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "calendar_events_update" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "calendar_events_delete" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_admin());

-- Grades: authenticated read; admin write (staff write later in Phase 5)
CREATE POLICY "grades_select" ON public.grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "grades_insert" ON public.grades FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "grades_update" ON public.grades FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "grades_delete" ON public.grades FOR DELETE TO authenticated USING (public.is_admin());

-- Announcements: authenticated read; admin write
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());
