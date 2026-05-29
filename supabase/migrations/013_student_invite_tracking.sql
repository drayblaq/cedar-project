ALTER TABLE students
ADD COLUMN IF NOT EXISTS last_invite_sent_at timestamptz;
