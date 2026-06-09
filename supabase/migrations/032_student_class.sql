ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes(id);
