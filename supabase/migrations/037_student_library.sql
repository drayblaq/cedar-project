-- Add student_level_id so admin/teacher can assign materials to a student level
ALTER TABLE materials ADD COLUMN IF NOT EXISTS student_level_id uuid REFERENCES levels(id);

-- Rebuild student SELECT policy
DROP POLICY IF EXISTS "Students can view materials for their level" ON materials;
DROP POLICY IF EXISTS "Students can view their assigned materials" ON materials;

CREATE POLICY "Students can view their assigned materials"
ON materials FOR SELECT TO authenticated
USING (
  teacher_only = false
  AND (
    is_public = true
    OR student_level_id IN (
      SELECT level_id FROM students WHERE user_id = auth.uid()
    )
  )
);

-- Students can browse all folders (folder visibility is controlled by the materials inside)
DROP POLICY IF EXISTS "Students can view student folders" ON library_folders;

CREATE POLICY "Students can view student folders"
ON library_folders FOR SELECT TO authenticated
USING (true);
