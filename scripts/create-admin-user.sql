-- Script to make a user an admin in Supabase
-- Replace 'user@example.com' with the actual email address

UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify the update
SELECT id, email, full_name, role, created_at, updated_at
FROM public.profiles
WHERE email = 'user@example.com';
