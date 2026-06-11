-- Staff were only able to see materials they personally uploaded.
-- Replace with a policy that lets all staff/admin see all materials.
DROP POLICY IF EXISTS "Staff view own uploaded materials" ON materials;
DROP POLICY IF EXISTS "Staff can manage own class materials" ON materials;
DROP POLICY IF EXISTS "Staff and admin can upload materials" ON materials;
DROP POLICY IF EXISTS "Staff and admin can delete materials" ON materials;
DROP POLICY IF EXISTS "Staff and admin can insert materials" ON materials;
DROP POLICY IF EXISTS "Staff and admin can delete materials rows" ON materials;

-- Admin and staff can see all materials (teacher-only and student-visible)
CREATE POLICY "Admin and staff can view all materials"
ON materials FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Admin and staff can insert materials
CREATE POLICY "Admin and staff can insert materials"
ON materials FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Admin and staff can update materials
CREATE POLICY "Admin and staff can update materials"
ON materials FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Admin and staff can delete materials
CREATE POLICY "Admin and staff can delete materials rows"
ON materials FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);
