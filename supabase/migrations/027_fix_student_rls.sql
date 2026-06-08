-- Fix: public student registration was blocked by RLS.
-- The students_insert policy (002) only allows admins; the anon policy from
-- 003 is not active in this database. Allow anonymous + authenticated users
-- to INSERT a student row (registration). They still cannot read or update
-- anyone else's record — only the SELECT policy below governs reads.

-- Allow anonymous users to register (insert only)
DROP POLICY IF EXISTS "Anyone can register as a student" ON students;
CREATE POLICY "Anyone can register as a student"
ON students
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Students can read their own record only (admins/staff can read all)
DROP POLICY IF EXISTS "Students can view own record" ON students;
CREATE POLICY "Students can view own record"
ON students FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
  WHERE p.id = auth.uid() AND r.name IN ('admin', 'staff')
));
