-- Add level_id so materials can be organized by level
ALTER TABLE materials ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES levels(id);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS week_number int;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
-- is_public = true means visible to all students regardless of level
-- (for general announcements, welcome docs etc)

-- ── RLS for level-based materials ──────────────────────────────────────────────
-- The original policies (migration 018) only covered class_id-based access.
-- Materials are now organised by level_id (often with no class_id), so we add
-- policies that work for level-based and public materials. RLS policies are
-- OR-combined, so these stack with the existing ones.

-- Staff & admin can insert any material
DROP POLICY IF EXISTS "Staff and admin can insert materials" ON materials;
CREATE POLICY "Staff and admin can insert materials"
ON materials FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Staff can view/manage the materials they uploaded; admin can manage all
DROP POLICY IF EXISTS "Staff view own uploaded materials" ON materials;
CREATE POLICY "Staff view own uploaded materials"
ON materials FOR SELECT TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name = 'admin'
  )
);

DROP POLICY IF EXISTS "Staff and admin can delete materials rows" ON materials;
CREATE POLICY "Staff and admin can delete materials rows"
ON materials FOR DELETE TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Students can view materials for their level, or public materials
DROP POLICY IF EXISTS "Students view materials by level or public" ON materials;
CREATE POLICY "Students view materials by level or public"
ON materials FOR SELECT TO authenticated
USING (
  is_public = true
  OR EXISTS (
    SELECT 1 FROM students s
    WHERE s.user_id = auth.uid()
    AND s.level_id = materials.level_id
  )
);
