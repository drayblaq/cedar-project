CREATE TABLE IF NOT EXISTS library_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES library_folders(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  sort_order int DEFAULT 0
);

ALTER TABLE library_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and staff can manage folders"
ON library_folders FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
  )
);

ALTER TABLE materials ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES library_folders(id) ON DELETE SET NULL;
