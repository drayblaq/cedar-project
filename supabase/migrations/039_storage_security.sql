-- Tighten storage bucket access:
-- The bucket was created as public=true in migration 025, which allows
-- unauthenticated URL access regardless of RLS policies. Set it private
-- so only authenticated sessions can read files via the API.
-- Note: existing getPublicUrl() links stored in materials.url still work
-- until those records are regenerated; new uploads will use authenticated access.
UPDATE storage.buckets SET public = false WHERE id = 'course-materials';

-- Drop the old SELECT policy and replace with a clean authenticated-only one
DROP POLICY IF EXISTS "Public can view course materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view materials" ON storage.objects;

CREATE POLICY "Authenticated users can view storage files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-materials');

-- Recreate upload/delete policies cleanly (drop first in case 025 already exists)
DROP POLICY IF EXISTS "Staff and admin can upload materials" ON storage.objects;
CREATE POLICY "Staff and admin can upload materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

DROP POLICY IF EXISTS "Staff and admin can delete materials" ON storage.objects;
CREATE POLICY "Staff and admin can delete materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);
