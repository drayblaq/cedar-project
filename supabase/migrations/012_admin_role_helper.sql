-- Make sure the roles table has an 'admin' entry
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;

-- Helper function to check if current user is admin by role
CREATE OR REPLACE FUNCTION is_admin_by_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
    AND r.name = 'admin'
  );
$$;
