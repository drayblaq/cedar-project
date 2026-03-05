-- Cedar: students, payments, attendance (run after 001_cedar_core.sql)
-- Run in Supabase Dashboard → SQL Editor → New query → Run.

-- Students: can be linked to auth user (user_id) when they have a portal account
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  level_id uuid REFERENCES public.levels(id) ON DELETE SET NULL,
  enrollment_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(level_id);
CREATE INDEX IF NOT EXISTS idx_students_user ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'XOF',
  paid_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

-- Attendance: one row per student per day
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- RLS: only admin can manage students, payments, attendance
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Helper: true if current user has role 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Students: admin can do everything; authenticated can read (for staff/student views later)
CREATE POLICY "students_select" ON public.students FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "students_insert" ON public.students FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "students_update" ON public.students FOR UPDATE
  TO authenticated USING (public.is_admin());
CREATE POLICY "students_delete" ON public.students FOR DELETE
  TO authenticated USING (public.is_admin());

-- Payments: same
CREATE POLICY "payments_select" ON public.payments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "payments_update" ON public.payments FOR UPDATE
  TO authenticated USING (public.is_admin());
CREATE POLICY "payments_delete" ON public.payments FOR DELETE
  TO authenticated USING (public.is_admin());

-- Attendance: same
CREATE POLICY "attendance_select" ON public.attendance FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "attendance_update" ON public.attendance FOR UPDATE
  TO authenticated USING (public.is_admin());
CREATE POLICY "attendance_delete" ON public.attendance FOR DELETE
  TO authenticated USING (public.is_admin());
