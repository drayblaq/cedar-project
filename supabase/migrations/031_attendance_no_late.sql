-- Remove 'late' from attendance status options.
-- Update any existing 'late' records to 'absent' first so the new CHECK passes.
UPDATE attendance SET status = 'absent' WHERE status = 'late';

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('present', 'absent'));
