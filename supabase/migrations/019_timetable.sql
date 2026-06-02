CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  -- 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Admin and staff can manage timetable
CREATE POLICY "Admin and staff can manage timetable"
ON timetable FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name IN ('admin', 'staff')
  )
);

-- Students and parents can view timetable
CREATE POLICY "Students and parents can view timetable"
ON timetable FOR SELECT TO authenticated
USING (true);
