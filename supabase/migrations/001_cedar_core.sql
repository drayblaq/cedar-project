-- Cedar Training Center: core schema (roles, profiles, levels)
-- Run this in Supabase Dashboard → SQL Editor → New query, then Run.

-- Roles for RBAC
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

INSERT INTO public.roles (name) VALUES
  ('admin'),
  ('staff'),
  ('student'),
  ('parent')
ON CONFLICT (name) DO NOTHING;

-- Profiles: one per auth user, links to role
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id),
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- English levels for students
CREATE TABLE IF NOT EXISTS public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);

INSERT INTO public.levels (name, sort_order) VALUES
  ('Beginner', 1),
  ('Elementary', 2),
  ('Pre-Intermediate', 3),
  ('Intermediate', 4),
  ('Upper-Intermediate', 5),
  ('Advanced', 6)
ON CONFLICT (name) DO NOTHING;

-- RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles and levels
CREATE POLICY "roles_read" ON public.roles FOR SELECT USING (true);
CREATE POLICY "levels_read" ON public.levels FOR SELECT USING (true);

-- Users can read/update their own profile only
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow insert only for own profile (used by trigger on signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Trigger: create profile with default role when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id uuid;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'student' LIMIT 1;
  INSERT INTO public.profiles (id, role_id)
  VALUES (NEW.id, COALESCE(default_role_id, (SELECT id FROM public.roles LIMIT 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: allow first user to be set as admin manually in Supabase Table Editor
-- by updating profiles.role_id to the admin role id for that user.
