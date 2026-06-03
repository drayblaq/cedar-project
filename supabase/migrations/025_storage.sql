-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow admin and staff to upload files
CREATE POLICY "Staff and admin can upload materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Allow admin and staff to delete their files
CREATE POLICY "Staff and admin can delete materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-materials' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Allow all authenticated users to view files
CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-materials');
