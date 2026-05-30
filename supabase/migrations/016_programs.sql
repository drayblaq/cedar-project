CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  description_en text,
  description_fr text,
  duration_en text,
  duration_fr text,
  level_range text,
  category text CHECK (category IN ('general', 'professional', 'exam_prep', 'workshop')),
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO programs (slug, name_en, name_fr, category, sort_order) VALUES
  ('general-english',  'General English',                    'Anglais Général',                       'general',      1),
  ('business-english', 'Business English',                   'Anglais des Affaires',                  'professional', 2),
  ('ielts-toefl-toeic','IELTS · TOEFL · TOEIC Preparation', 'Préparation IELTS · TOEFL · TOEIC',     'exam_prep',    3),
  ('workshops',        'Workshops & Intensive Training',      'Ateliers et Formation Intensive',       'workshop',     4)
ON CONFLICT (slug) DO NOTHING;
