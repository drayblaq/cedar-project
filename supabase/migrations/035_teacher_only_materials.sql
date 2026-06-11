ALTER TABLE materials ADD COLUMN IF NOT EXISTS teacher_only boolean DEFAULT false;

DROP POLICY IF EXISTS "Students can view materials for their level" ON materials;

CREATE POLICY "Students can view materials for their level"
ON materials FOR SELECT TO authenticated
USING (
  teacher_only = false
  AND (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.user_id = auth.uid()
      AND s.level_id = materials.level_id
    )
  )
);
