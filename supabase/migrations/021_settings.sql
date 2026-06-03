CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  label text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage settings"
ON settings FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name = 'admin'
  )
);

CREATE POLICY "Authenticated users can read settings"
ON settings FOR SELECT TO authenticated
USING (true);

-- Seed default values
INSERT INTO settings (key, value, label) VALUES
  ('tuition_amount', '50000', 'Tuition fee (XOF)'),
  ('currency', 'FCFA', 'Currency'),
  ('center_name', 'Cedar Training Center', 'Center name'),
  ('center_phone', '+229 01 96 19 64 40', 'Phone number'),
  ('center_email', 'trainingcentercedar@gmail.com', 'Email address'),
  ('center_address', 'Gbédjromédé, Cotonou, Bénin', 'Address')
ON CONFLICT (key) DO NOTHING;
