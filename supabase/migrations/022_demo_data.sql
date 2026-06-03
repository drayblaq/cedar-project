-- ============================================
-- CEDAR TRAINING CENTER — DEMO DATA SEED
-- ============================================
-- Only inserts if data doesn't already exist
-- Safe to run multiple times for tables keyed by id / unique constraint
-- (students, classes, terms, attendance, levels, roles).
-- Note: announcements, calendar_events, payments, grades and timetable
-- have no natural unique key, so re-running will create duplicates.

-- Step 1: Ensure levels exist
INSERT INTO levels (name, sort_order) VALUES
  ('Beginner', 1),
  ('Elementary', 2),
  ('Intermediate', 3),
  ('Upper-Intermediate', 4),
  ('Advanced', 5)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Ensure roles exist
INSERT INTO roles (name) VALUES
  ('admin'), ('staff'), ('student'), ('parent')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create academic terms
INSERT INTO academic_terms (id, name, start_date, end_date) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Term 1 — 2026', '2026-01-06', '2026-04-04'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Term 2 — 2026', '2026-04-14', '2026-07-10')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create classes
INSERT INTO classes (id, name, level_id) VALUES
  ('c1d2e3f4-a5b6-7890-cdef-123456789012',
   'General English A1',
   (SELECT id FROM levels WHERE name = 'Beginner')),
  ('d2e3f4a5-b6c7-8901-defa-234567890123',
   'General English A2',
   (SELECT id FROM levels WHERE name = 'Elementary')),
  ('e3f4a5b6-c7d8-9012-efab-345678901234',
   'Business English B1',
   (SELECT id FROM levels WHERE name = 'Intermediate')),
  ('f4a5b6c7-d8e9-0123-fabc-456789012345',
   'IELTS Preparation B2',
   (SELECT id FROM levels WHERE name = 'Upper-Intermediate'))
ON CONFLICT (id) DO NOTHING;

-- Step 5: Add timetable for classes
INSERT INTO timetable (class_id, day_of_week, start_time, end_time, room) VALUES
  -- General English A1: Mon/Wed/Fri morning
  ('c1d2e3f4-a5b6-7890-cdef-123456789012', 1, '08:00', '10:00', 'Salle A'),
  ('c1d2e3f4-a5b6-7890-cdef-123456789012', 3, '08:00', '10:00', 'Salle A'),
  ('c1d2e3f4-a5b6-7890-cdef-123456789012', 5, '08:00', '10:00', 'Salle A'),
  -- General English A2: Tue/Thu evening
  ('d2e3f4a5-b6c7-8901-defa-234567890123', 2, '18:00', '20:00', 'Salle B'),
  ('d2e3f4a5-b6c7-8901-defa-234567890123', 4, '18:00', '20:00', 'Salle B'),
  -- Business English B1: Sat morning
  ('e3f4a5b6-c7d8-9012-efab-345678901234', 6, '09:00', '12:00', 'Salle C'),
  -- IELTS B2: Mon/Wed evening
  ('f4a5b6c7-d8e9-0123-fabc-456789012345', 1, '19:00', '21:00', 'Salle D'),
  ('f4a5b6c7-d8e9-0123-fabc-456789012345', 3, '19:00', '21:00', 'Salle D')
ON CONFLICT DO NOTHING;

-- Step 6: Add announcements
INSERT INTO announcements (title, body, published_at) VALUES
  (
    'Welcome to Term 2 — 2026',
    'Dear students, we are pleased to welcome you to Term 2. Classes resume on April 14th. Please ensure your fees are paid before the first session. Contact us at +229 01 96 19 64 40 for any questions.',
    '2026-04-10 09:00:00+00'
  ),
  (
    'IELTS Mock Exam — Saturday 7 June',
    'A full IELTS mock exam will be held on Saturday 7 June from 8:00am to 1:00pm in Salle D. All IELTS preparation students must attend. Results will be shared within 5 working days.',
    '2026-05-28 10:00:00+00'
  ),
  (
    'Public Holiday — Centre closed 1 June',
    'The centre will be closed on Sunday 1 June for the public holiday. All Monday 2 June morning classes will proceed as normal. Have a restful weekend.',
    '2026-05-29 08:00:00+00'
  ),
  (
    'New Program: Intensive English — July',
    'We are launching a 4-week intensive English program in July for working professionals. Morning and evening sessions available. Limited spots — register early at trainingcentercedar@gmail.com.',
    '2026-06-01 09:00:00+00'
  )
ON CONFLICT DO NOTHING;

-- Step 7: Add calendar events
INSERT INTO calendar_events (title, event_date, event_type, start_time, end_time) VALUES
  ('Term 2 begins', '2026-04-14', 'other', '08:00', NULL),
  ('IELTS Mock Exam', '2026-06-07', 'exam', '08:00', '13:00'),
  ('Mid-term assessments', '2026-05-19', 'exam', '08:00', '12:00'),
  ('Public Holiday', '2026-06-01', 'holiday', NULL, NULL),
  ('Term 2 ends', '2026-07-10', 'deadline', NULL, NULL),
  ('Term 3 registration opens', '2026-07-01', 'deadline', '08:00', NULL)
ON CONFLICT DO NOTHING;

-- Step 8: Add demo students (these need auth.users to exist first,
-- so we add them as students without user_id for now)
INSERT INTO students (
  id, full_name, email, phone, level_id,
  status, application_status, created_at
) VALUES
  (
    'aa000001-0000-0000-0000-000000000001',
    'Fatoumata Koudjo',
    'fatoumata.koudjo@gmail.com',
    '+229 97 11 22 33',
    (SELECT id FROM levels WHERE name = 'Beginner'),
    'active', 'approved',
    '2026-01-10 09:00:00+00'
  ),
  (
    'aa000002-0000-0000-0000-000000000002',
    'Sékou Agossou',
    'sekou.agossou@gmail.com',
    '+229 96 44 55 66',
    (SELECT id FROM levels WHERE name = 'Elementary'),
    'active', 'approved',
    '2026-01-12 10:00:00+00'
  ),
  (
    'aa000003-0000-0000-0000-000000000003',
    'Mariama Dossou',
    'mariama.dossou@gmail.com',
    '+229 95 77 88 99',
    (SELECT id FROM levels WHERE name = 'Intermediate'),
    'active', 'approved',
    '2026-01-15 08:30:00+00'
  ),
  (
    'aa000004-0000-0000-0000-000000000004',
    'Théodore Gbaguidi',
    'theodore.gbaguidi@gmail.com',
    '+229 97 22 33 44',
    (SELECT id FROM levels WHERE name = 'Intermediate'),
    'active', 'approved',
    '2026-01-20 11:00:00+00'
  ),
  (
    'aa000005-0000-0000-0000-000000000005',
    'Adjoua Lawani',
    'adjoua.lawani@gmail.com',
    '+229 96 55 66 77',
    (SELECT id FROM levels WHERE name = 'Upper-Intermediate'),
    'active', 'approved',
    '2026-02-03 09:00:00+00'
  ),
  (
    'aa000006-0000-0000-0000-000000000006',
    'Roméo Ahounou',
    'romeo.ahounou@gmail.com',
    '+229 95 88 99 00',
    (SELECT id FROM levels WHERE name = 'Beginner'),
    'pending', 'awaiting_payment',
    '2026-05-28 14:00:00+00'
  ),
  (
    'aa000007-0000-0000-0000-000000000007',
    'Nadège Biokou',
    'nadege.biokou@gmail.com',
    '+229 97 33 44 55',
    (SELECT id FROM levels WHERE name = 'Elementary'),
    'pending', 'submitted',
    '2026-06-01 10:30:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Step 9: Add payments for active students
INSERT INTO payments (student_id, amount, currency, paid_at, payment_method, momo_reference) VALUES
  ('aa000001-0000-0000-0000-000000000001', 50000, 'FCFA', '2026-01-11 10:00:00+00', 'momo', 'MOMO-2601-001'),
  ('aa000002-0000-0000-0000-000000000002', 50000, 'FCFA', '2026-01-13 11:00:00+00', 'momo', 'MOMO-2601-002'),
  ('aa000003-0000-0000-0000-000000000003', 25000, 'FCFA', '2026-01-16 09:00:00+00', 'momo', 'MOMO-2601-003'),
  ('aa000003-0000-0000-0000-000000000003', 25000, 'FCFA', '2026-02-01 10:00:00+00', 'momo', 'MOMO-2602-001'),
  ('aa000004-0000-0000-0000-000000000004', 50000, 'FCFA', '2026-01-21 14:00:00+00', 'momo', 'MOMO-2601-004'),
  ('aa000005-0000-0000-0000-000000000005', 50000, 'FCFA', '2026-02-04 09:30:00+00', 'momo', 'MOMO-2602-002')
ON CONFLICT DO NOTHING;

-- Step 10: Add attendance records (last 30 days)
INSERT INTO attendance (student_id, date, status) VALUES
  -- Fatoumata — excellent attendance
  ('aa000001-0000-0000-0000-000000000001', '2026-05-05', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-07', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-09', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-12', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-14', 'late'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-16', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-19', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-21', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-23', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-26', 'absent'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-28', 'present'),
  ('aa000001-0000-0000-0000-000000000001', '2026-05-30', 'present'),
  -- Sékou — good attendance
  ('aa000002-0000-0000-0000-000000000002', '2026-05-06', 'present'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-08', 'present'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-13', 'absent'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-15', 'present'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-20', 'present'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-22', 'late'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-27', 'present'),
  ('aa000002-0000-0000-0000-000000000002', '2026-05-29', 'present'),
  -- Mariama
  ('aa000003-0000-0000-0000-000000000003', '2026-05-06', 'present'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-08', 'absent'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-13', 'present'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-15', 'present'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-20', 'late'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-22', 'present'),
  ('aa000003-0000-0000-0000-000000000003', '2026-05-27', 'present'),
  -- Théodore
  ('aa000004-0000-0000-0000-000000000004', '2026-05-03', 'present'),
  ('aa000004-0000-0000-0000-000000000004', '2026-05-10', 'present'),
  ('aa000004-0000-0000-0000-000000000004', '2026-05-17', 'absent'),
  ('aa000004-0000-0000-0000-000000000004', '2026-05-24', 'present'),
  ('aa000004-0000-0000-0000-000000000004', '2026-05-31', 'present'),
  -- Adjoua
  ('aa000005-0000-0000-0000-000000000005', '2026-05-05', 'present'),
  ('aa000005-0000-0000-0000-000000000005', '2026-05-07', 'present'),
  ('aa000005-0000-0000-0000-000000000005', '2026-05-12', 'present'),
  ('aa000005-0000-0000-0000-000000000005', '2026-05-19', 'late'),
  ('aa000005-0000-0000-0000-000000000005', '2026-05-26', 'present')
ON CONFLICT (student_id, date) DO NOTHING;

-- Step 11: Add grades
INSERT INTO grades (student_id, academic_term_id, subject_or_type, score) VALUES
  -- Fatoumata — strong student
  ('aa000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Speaking', 82),
  ('aa000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Listening', 78),
  ('aa000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Writing', 75),
  ('aa000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reading', 80),
  -- Sékou
  ('aa000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Speaking', 70),
  ('aa000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Listening', 65),
  ('aa000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Writing', 72),
  ('aa000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reading', 68),
  -- Mariama
  ('aa000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Speaking', 88),
  ('aa000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Listening', 85),
  ('aa000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Writing', 79),
  ('aa000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reading', 91),
  -- Théodore
  ('aa000004-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Speaking', 60),
  ('aa000004-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Listening', 55),
  ('aa000004-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Writing', 62),
  ('aa000004-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reading', 58),
  -- Adjoua — top student
  ('aa000005-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Speaking', 92),
  ('aa000005-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Listening', 89),
  ('aa000005-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Writing', 87),
  ('aa000005-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Reading', 94)
ON CONFLICT DO NOTHING;
