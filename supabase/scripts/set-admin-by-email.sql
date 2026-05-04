-- ============================================================
-- Set your user to ADMIN by email (no need to copy any UUIDs)
-- ============================================================
-- Instant admin login (no inbox): add the same email to app env
-- ADMIN_PASSWORDLESS_EMAILS (comma-separated), set SUPABASE_SERVICE_ROLE_KEY,
-- and allow redirect URL in Supabase Auth → URL configuration:
--   {YOUR_SITE}/auth/callback
-- ============================================================
-- If you see "(no role)" in the app, your user had no profile row.
-- This script CREATES the profile if missing, then sets role to admin.
--
-- 1. Replace YOUR_EMAIL_HERE with your exact login email (keep the quotes).
--    Example: 'you@example.com'
-- 2. Run in Supabase Dashboard → SQL Editor → New query → Run.

-- Create profile with admin role if missing; otherwise update role to admin
INSERT INTO public.profiles (id, role_id)
SELECT u.id, (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1)
FROM auth.users u
WHERE u.email = 'YOUR_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

-- Check: run this in a new query (replace the email) to confirm you see role = admin
-- SELECT u.email, r.name AS role FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id JOIN public.roles r ON r.id = p.role_id
-- WHERE u.email = 'YOUR_EMAIL_HERE';
