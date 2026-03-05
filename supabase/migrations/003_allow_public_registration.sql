-- Allow public registration form to create student rows (admin will see them).
-- Run in Supabase Dashboard → SQL Editor after 002_students_payments_attendance.sql.

-- Anonymous users can insert a student only when user_id is null (no portal account yet).
CREATE POLICY "students_insert_anon" ON public.students
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
