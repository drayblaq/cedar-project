-- Expand placement test from 5 to 30 questions across 3 difficulty tiers.
-- Tier 1 (Q1–10): 1 pt each  → max 10
-- Tier 2 (Q11–20): 2 pts each → max 20
-- Tier 3 (Q21–30): 3 pts each → max 30
-- Total max score: 60 pts

-- Clear existing placeholder questions and answers
DELETE FROM answers WHERE question_id IN (
  SELECT q.id FROM questions q
  JOIN tests t ON t.id = q.test_id
  WHERE t.slug = 'english-placement'
);
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE slug = 'english-placement');

-- Update test settings (30 min for 30 questions)
UPDATE tests
SET title = 'English Placement Test', time_limit_seconds = 1800
WHERE slug = 'english-placement';

-- ─────────────────────────────────────────────────────
-- Insert questions and answers via a CTE-based block
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  tid  uuid;
  qid  uuid;
BEGIN
  SELECT id INTO tid FROM tests WHERE slug = 'english-placement' LIMIT 1;
  IF tid IS NULL THEN
    RAISE EXCEPTION 'Test english-placement not found';
  END IF;

  -- ── TIER 1: BEGINNER (1 pt each) ──────────────────

  -- Q1
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 1, 'She ___ to school every day.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'goes',  true),
    (qid, 2, 'go',    false),
    (qid, 3, 'going', false),
    (qid, 4, 'gone',  false);

  -- Q2
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 2, 'There ___ two apples on the table.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'are', true),
    (qid, 2, 'is',  false),
    (qid, 3, 'be',  false),
    (qid, 4, 'am',  false);

  -- Q3
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 3, 'What is the plural of "child"?', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'children', true),
    (qid, 2, 'childs',   false),
    (qid, 3, 'childen',  false),
    (qid, 4, 'child''s', false);

  -- Q4
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 4, 'He ___ not speak French.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'does', true),
    (qid, 2, 'do',   false),
    (qid, 3, 'is',   false),
    (qid, 4, 'has',  false);

  -- Q5
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 5, 'Which word means the opposite of "happy"?', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'sad',   true),
    (qid, 2, 'glad',  false),
    (qid, 3, 'angry', false),
    (qid, 4, 'tired', false);

  -- Q6
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 6, 'I ___ a student at this school.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'am',  true),
    (qid, 2, 'is',  false),
    (qid, 3, 'are', false),
    (qid, 4, 'be',  false);

  -- Q7
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 7, 'She bought ___ umbrella because it was raining.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'an',  true),
    (qid, 2, 'a',   false),
    (qid, 3, 'the', false),
    (qid, 4, '—',   false);

  -- Q8
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 8, 'They ___ watching TV when I called.', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'were', true),
    (qid, 2, 'was',  false),
    (qid, 3, 'are',  false),
    (qid, 4, 'have', false);

  -- Q9
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 9, 'Which sentence is correct?', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'I have two brothers.',        true),
    (qid, 2, 'I has two brothers.',         false),
    (qid, 3, 'I having two brothers.',      false),
    (qid, 4, 'I had have two brothers.',    false);

  -- Q10
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 10, 'How ___ does a ticket cost?', 1) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'much',  true),
    (qid, 2, 'many',  false),
    (qid, 3, 'long',  false),
    (qid, 4, 'often', false);

  -- ── TIER 2: INTERMEDIATE (2 pts each) ─────────────

  -- Q11
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 11, 'By the time she arrived, we ___ dinner.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'had finished',  true),
    (qid, 2, 'finished',      false),
    (qid, 3, 'have finished', false),
    (qid, 4, 'finish',        false);

  -- Q12
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 12, 'If I ___ more time, I would study harder.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'had',        true),
    (qid, 2, 'have',       false),
    (qid, 3, 'has',        false),
    (qid, 4, 'would have', false);

  -- Q13
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 13, 'The report must ___ before Friday.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'be submitted',    true),
    (qid, 2, 'submit',          false),
    (qid, 3, 'be submitting',   false),
    (qid, 4, 'submitted',       false);

  -- Q14
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 14, 'She is ___ at math than her brother.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'better',    true),
    (qid, 2, 'more good', false),
    (qid, 3, 'gooder',    false),
    (qid, 4, 'best',      false);

  -- Q15
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 15, 'The word "meticulous" most closely means:', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'very careful', true),
    (qid, 2, 'very fast',    false),
    (qid, 3, 'very loud',    false),
    (qid, 4, 'very tired',   false);

  -- Q16
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 16, 'Neither the students nor the teacher ___ ready.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'was',      true),
    (qid, 2, 'were',     false),
    (qid, 3, 'are',      false),
    (qid, 4, 'have been',false);

  -- Q17
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 17, 'He suggested ___ earlier to avoid traffic.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'leaving',   true),
    (qid, 2, 'to leave',  false),
    (qid, 3, 'leave',     false),
    (qid, 4, 'left',      false);

  -- Q18
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 18, 'The project was delayed ___ bad weather.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'due to',   true),
    (qid, 2, 'because',  false),
    (qid, 3, 'despite',  false),
    (qid, 4, 'although', false);

  -- Q19
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 19, 'Which sentence uses the passive voice correctly?', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'The letter was written by him.',  true),
    (qid, 2, 'He written the letter.',          false),
    (qid, 3, 'The letter written.',             false),
    (qid, 4, 'He was writing by her.',          false);

  -- Q20
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 20, 'She asked me where I ___ from.', 2) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'came',   true),
    (qid, 2, 'come',   false),
    (qid, 3, 'comes',  false),
    (qid, 4, 'coming', false);

  -- ── TIER 3: ADVANCED / BUSINESS (3 pts each) ──────

  -- Q21
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 21, 'The board of directors ___ its decision tomorrow.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'will announce',   true),
    (qid, 2, 'will announces',  false),
    (qid, 3, 'announce',        false),
    (qid, 4, 'announcing',      false);

  -- Q22
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 22, 'Despite ___ extensively, she couldn''t find the document.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'searching',  true),
    (qid, 2, 'to search',  false),
    (qid, 3, 'searched',   false),
    (qid, 4, 'search',     false);

  -- Q23
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 23, 'The new policy will ___ effect from January 1st.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'take',  true),
    (qid, 2, 'make',  false),
    (qid, 3, 'bring', false),
    (qid, 4, 'put',   false);

  -- Q24
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 24, 'Which word best completes: "The CEO gave a ___ speech that inspired the entire team"?', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'compelling',    true),
    (qid, 2, 'compelled',     false),
    (qid, 3, 'compulsion',    false),
    (qid, 4, 'compellingly',  false);

  -- Q25
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 25, 'The merger ___ pending regulatory approval for six months.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'has been', true),
    (qid, 2, 'is',       false),
    (qid, 3, 'was',      false),
    (qid, 4, 'had',      false);

  -- Q26
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 26, 'Employees are required to ___ with all safety regulations.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'comply',   true),
    (qid, 2, 'complete', false),
    (qid, 3, 'compare',  false),
    (qid, 4, 'compose',  false);

  -- Q27
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 27, 'The data ___ that sales increased by 30% last quarter.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'indicates',   true),
    (qid, 2, 'indicate',    false),
    (qid, 3, 'indicated',   false),
    (qid, 4, 'indicating',  false);

  -- Q28
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 28, 'Which sentence is most formal and appropriate for a business email?', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'I am writing to inquire about the status of my application.', true),
    (qid, 2, 'I wanna know about my application.',                          false),
    (qid, 3, 'What''s up with my application?',                            false),
    (qid, 4, 'Checking in on my application thing.',                        false);

  -- Q29
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 29, 'The contract stipulates that payment ___ within 30 days of delivery.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'must be made', true),
    (qid, 2, 'must make',    false),
    (qid, 3, 'is making',    false),
    (qid, 4, 'makes',        false);

  -- Q30
  INSERT INTO questions (test_id, sort_order, prompt, points)
  VALUES (tid, 30, 'Had the team ___ better, they would have won the contract.', 3) RETURNING id INTO qid;
  INSERT INTO answers (question_id, sort_order, label, is_correct) VALUES
    (qid, 1, 'prepared',     true),
    (qid, 2, 'prepare',      false),
    (qid, 3, 'preparing',    false),
    (qid, 4, 'been prepare', false);

END $$;
