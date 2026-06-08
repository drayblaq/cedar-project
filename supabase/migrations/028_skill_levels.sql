-- Add CEFR skill-level columns to grades for the English Level Assessment redesign
ALTER TABLE grades ADD COLUMN IF NOT EXISTS skill_level text
  CHECK (skill_level IN ('A1','A2','B1','B2','C1','C2'));
ALTER TABLE grades ADD COLUMN IF NOT EXISTS skill_area text
  CHECK (skill_area IN ('speaking','listening','grammar_vocabulary','reading','writing','overall'));

-- Keep score column for backwards compatibility but make it optional
ALTER TABLE grades ALTER COLUMN score DROP NOT NULL;

-- One row per student per skill area (needed for upsert onConflict).
-- Existing rows have skill_area = NULL; NULLs are distinct in Postgres,
-- so this does not conflict with legacy numeric grades.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'grades_student_skill_unique'
  ) THEN
    ALTER TABLE grades ADD CONSTRAINT grades_student_skill_unique
      UNIQUE (student_id, skill_area);
  END IF;
END $$;
