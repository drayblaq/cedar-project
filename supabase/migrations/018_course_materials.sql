CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  material_type text NOT NULL CHECK (material_type IN ('pdf', 'link', 'video', 'document', 'other')),
  url text,
  file_path text,
  created_at timestamptz DEFAULT now()
);

-- Students can view materials for their class
-- Staff can manage materials for their classes
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage own class materials"
ON materials
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_classes sc
    JOIN profiles p ON p.id = auth.uid()
    JOIN roles r ON r.id = p.role_id
    WHERE (sc.profile_id = auth.uid() AND sc.class_id = materials.class_id)
    OR r.name = 'admin'
  )
);

CREATE POLICY "Students can view materials for their level"
ON materials
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON c.level_id = s.level_id
    WHERE s.user_id = auth.uid()
    AND c.id = materials.class_id
  )
);
