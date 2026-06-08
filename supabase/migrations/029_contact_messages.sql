CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
CREATE POLICY "Anyone can submit contact form"
ON contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only admin can read / manage messages
DROP POLICY IF EXISTS "Admin can read contact messages" ON contact_messages;
CREATE POLICY "Admin can read contact messages"
ON contact_messages FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);
