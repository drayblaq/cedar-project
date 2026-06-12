-- ── Quiz questions linked to materials ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('mcq', 'fill_blank', 'true_false')),
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  sort_order int DEFAULT 0,
  approved boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ── Student quiz attempts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  score int DEFAULT 0,
  total_questions int DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(student_id, material_id)
);

-- ── Lesson progress (completion tracking) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(student_id, material_id)
);

ALTER TABLE quiz_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- ── quiz_questions policies ──────────────────────────────────────────────────
-- Authenticated users can see approved questions
CREATE POLICY "Authenticated can view approved questions"
ON quiz_questions FOR SELECT TO authenticated
USING (approved = true);

-- Admin and staff can manage all questions (includes unapproved)
CREATE POLICY "Admin and staff manage questions"
ON quiz_questions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
  )
);

-- ── quiz_attempts policies ───────────────────────────────────────────────────
CREATE POLICY "Students manage own attempts"
ON quiz_attempts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.user_id = auth.uid() AND s.id = quiz_attempts.student_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.user_id = auth.uid() AND s.id = quiz_attempts.student_id
  )
);

CREATE POLICY "Admin and staff view attempts"
ON quiz_attempts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
  )
);

-- ── lesson_progress policies ─────────────────────────────────────────────────
CREATE POLICY "Students manage own progress"
ON lesson_progress FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.user_id = auth.uid() AND s.id = lesson_progress.student_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.user_id = auth.uid() AND s.id = lesson_progress.student_id
  )
);

CREATE POLICY "Admin and staff view lesson progress"
ON lesson_progress FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
  )
);

-- ── Seed demo questions ──────────────────────────────────────────────────────
DO $$
DECLARE
  mat_id uuid;
BEGIN
  SELECT id INTO mat_id FROM materials
  WHERE title ILIKE '%introducing yourself%'
  LIMIT 1;

  IF mat_id IS NOT NULL THEN
    INSERT INTO quiz_questions (material_id, question_text, question_type, options, correct_answer, explanation, sort_order, approved) VALUES

    -- 5 Multiple Choice
    (mat_id, 'What do you say when you meet someone for the first time?', 'mcq',
     '["Nice to meet you", "Goodbye", "Thank you", "I am sorry"]',
     'Nice to meet you',
     '"Nice to meet you" is the standard greeting when meeting someone new.',
     1, true),

    (mat_id, 'Which sentence is correct to introduce yourself?', 'mcq',
     '["My name is John", "I name is John", "Name my is John", "Is John my name"]',
     'My name is John',
     'The correct structure is: My name is + [your name].',
     2, true),

    (mat_id, 'What does "Where are you from?" mean?', 'mcq',
     '["What is your job?", "What country or city are you from?", "How old are you?", "What is your name?"]',
     'What country or city are you from?',
     '"Where are you from?" asks about someone''s origin — their country or city.',
     3, true),

    (mat_id, 'How do you say your age in English? (Example: 20 years old)', 'mcq',
     '["I have 20 years", "I am 20 years old", "My age is have 20", "I be 20 years"]',
     'I am 20 years old',
     'In English we say "I am + [age] + years old". Not "I have" like in French.',
     4, true),

    (mat_id, 'Which question asks about someone''s job?', 'mcq',
     '["What do you do?", "Where do you go?", "How do you do?", "Who do you know?"]',
     'What do you do?',
     '"What do you do?" is the most common way to ask about someone''s job or profession.',
     5, true),

    -- 5 Fill in the Blank
    (mat_id, 'Complete the sentence: "Hello, my name ___ Sarah."', 'fill_blank',
     NULL, 'is',
     'We use "is" with names: My name IS Sarah.',
     6, true),

    (mat_id, 'Complete the sentence: "I am ___ France." (My country)', 'fill_blank',
     NULL, 'from',
     '"I am FROM France" — we use "from" to talk about our country of origin.',
     7, true),

    (mat_id, 'Complete the sentence: "It is nice to ___ you."', 'fill_blank',
     NULL, 'meet',
     '"Nice to MEET you" is the standard phrase when being introduced.',
     8, true),

    (mat_id, 'Complete the sentence: "I ___ a student at Cedar Training Center."', 'fill_blank',
     NULL, 'am',
     '"I AM a student" — we use "am" with "I" in the present tense.',
     9, true),

    (mat_id, 'Complete the sentence: "What is your ___?" (asking for someone''s name)', 'fill_blank',
     NULL, 'name',
     '"What is your NAME?" is the standard question to ask someone''s name.',
     10, true),

    -- 5 True or False
    (mat_id, '"Hello" and "Hi" have the same meaning in English.', 'true_false',
     '["True", "False"]', 'True',
     'Both "Hello" and "Hi" are greetings. "Hi" is more informal but they mean the same thing.',
     11, true),

    (mat_id, 'You say "Nice to meet you" at the END of a conversation.', 'true_false',
     '["True", "False"]', 'False',
     '"Nice to meet you" is said at the BEGINNING when you first meet someone, not at the end.',
     12, true),

    (mat_id, 'In English, "I am from Cotonou" and "I come from Cotonou" mean the same thing.', 'true_false',
     '["True", "False"]', 'True',
     'Both sentences correctly express your city of origin. Both are acceptable in English.',
     13, true),

    (mat_id, '"My name is" and "I am called" cannot both be used to introduce yourself.', 'true_false',
     '["True", "False"]', 'False',
     'Both expressions are correct: "My name is John" and "I am called John" are both used in English.',
     14, true),

    (mat_id, 'When someone says "How are you?", the most common reply is "Fine, thank you."', 'true_false',
     '["True", "False"]', 'True',
     '"Fine, thank you" or "I am fine, thank you" is the most common polite response to "How are you?"',
     15, true);

  END IF;
END $$;
