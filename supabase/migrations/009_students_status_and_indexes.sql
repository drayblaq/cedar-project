ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'active', 'inactive'));

CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_payments_student_paid_at ON public.payments(student_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_student_created_at ON public.grades(student_id, created_at DESC);

-- Ensure time columns exist (same as 007); production may run 009 before 007 was applied.
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time;

CREATE INDEX IF NOT EXISTS idx_calendar_events_date_start ON public.calendar_events(event_date, start_time);
