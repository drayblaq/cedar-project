-- Pre-registration fields, admission workflow, English placement test schema

-- Admission lifecycle (separate from enrollment status)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS application_status text NOT NULL DEFAULT 'submitted'
  CHECK (application_status IN ('submitted', 'under_review', 'awaiting_payment', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_students_application_status ON public.students(application_status);

-- Token for anonymous placement test access (set at registration)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS placement_access_token uuid UNIQUE;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not')),
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS bac_year text,
  ADD COLUMN IF NOT EXISTS bac_series text,
  ADD COLUMN IF NOT EXISTS previous_school text,
  ADD COLUMN IF NOT EXISTS parent_whatsapp text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS discovery_channel text;

-- Placement test catalog
CREATE TABLE IF NOT EXISTS public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  time_limit_seconds int NOT NULL DEFAULT 600,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  prompt text NOT NULL,
  points int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_test ON public.questions(test_id, sort_order);

-- Multiple-choice options (one row per option; is_correct marks the right answer)
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id, sort_order);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  score numeric(8, 2) NOT NULL,
  max_score numeric(8, 2) NOT NULL,
  time_taken_seconds int,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON public.test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test ON public.test_attempts(test_id);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- Published tests readable by anon + authenticated (placement UI)
CREATE POLICY "tests_select_published" ON public.tests
  FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "questions_select_by_published_test" ON public.questions
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.is_published = true)
  );

-- Do not expose correct answers to anon; app loads options server-side with service role.
CREATE POLICY "answers_select_admin" ON public.answers
  FOR SELECT TO authenticated USING (public.is_admin());

-- Attempts: admin/staff full access; students see own (linked user)
CREATE POLICY "test_attempts_select_admin" ON public.test_attempts
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "test_attempts_insert_admin" ON public.test_attempts
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Inserts from server using service role bypass RLS; optional student read:
CREATE POLICY "test_attempts_select_own_student" ON public.test_attempts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

-- Seed English placement test (grammar MCQ), idempotent
INSERT INTO public.tests (slug, title, time_limit_seconds, is_published)
VALUES ('english-placement', 'English placement test', 600, true)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  tid uuid;
  q1 uuid; q2 uuid; q3 uuid; q4 uuid; q5 uuid;
BEGIN
  SELECT id INTO tid FROM public.tests WHERE slug = 'english-placement' LIMIT 1;
  IF tid IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.questions WHERE test_id = tid) THEN RETURN; END IF;

  INSERT INTO public.questions (test_id, sort_order, prompt, points) VALUES (tid, 1, '____ name is Robert.', 1) RETURNING id INTO q1;
  INSERT INTO public.questions (test_id, sort_order, prompt, points) VALUES (tid, 2, 'They ____ from Spain.', 1) RETURNING id INTO q2;
  INSERT INTO public.questions (test_id, sort_order, prompt, points) VALUES (tid, 3, '____ are you from?', 1) RETURNING id INTO q3;
  INSERT INTO public.questions (test_id, sort_order, prompt, points) VALUES (tid, 4, 'They ____ heard us coming; we were making a lot of noise.', 1) RETURNING id INTO q4;
  INSERT INTO public.questions (test_id, sort_order, prompt, points) VALUES (tid, 5, 'He ____ to help me with the decorating.', 1) RETURNING id INTO q5;

  INSERT INTO public.answers (question_id, sort_order, label, is_correct) VALUES
    (q1, 1, 'Me', false), (q1, 2, 'I', false), (q1, 3, 'My', true),
    (q2, 1, 'is', false), (q2, 2, 'are', true), (q2, 3, 'do', false),
    (q3, 1, 'What', false), (q3, 2, 'Who', false), (q3, 3, 'Where', true),
    (q4, 1, 'must have', true), (q4, 2, 'must', false), (q4, 3, 'might', false), (q4, 4, 'could', false),
    (q5, 1, 'suggested', false), (q5, 2, 'offered', true), (q5, 3, 'invited', false), (q5, 4, 'told', false);
END $$;
