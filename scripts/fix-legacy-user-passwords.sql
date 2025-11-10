-- Fix Legacy User Passwords Migration
-- Date: October 16, 2025
-- Purpose: Remove passwords from users who have passwords but metadata says has_password=false
-- These users were created with random passwords they never knew about

-- First, let's create a backup table of affected users for reference
CREATE TABLE IF NOT EXISTS public.legacy_password_fix_backup (
  user_id UUID PRIMARY KEY,
  email TEXT,
  fixed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Insert affected users into backup table
INSERT INTO public.legacy_password_fix_backup (user_id, email, metadata)
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE 
  (raw_user_meta_data->>'has_password' = 'false' OR raw_user_meta_data->>'has_password' IS NULL)
  AND encrypted_password IS NOT NULL 
  AND encrypted_password != ''
ON CONFLICT (user_id) DO NOTHING;

-- Count affected users before fix
SELECT COUNT(*) as users_to_fix FROM public.legacy_password_fix_backup;

-- Now remove passwords from affected users
-- This will allow them to log in with magic link
UPDATE auth.users 
SET encrypted_password = NULL
WHERE id IN (
  SELECT user_id FROM public.legacy_password_fix_backup
);

-- Verify the fix
SELECT 
  COUNT(*) as fixed_users,
  COUNT(CASE WHEN encrypted_password IS NULL THEN 1 END) as users_without_password,
  COUNT(CASE WHEN encrypted_password IS NOT NULL THEN 1 END) as users_still_with_password
FROM auth.users
WHERE id IN (
  SELECT user_id FROM public.legacy_password_fix_backup
);

-- Check Susan specifically
SELECT 
  email,
  CASE WHEN encrypted_password IS NULL THEN 'NO_PASSWORD' ELSE 'HAS_PASSWORD' END as password_status,
  raw_user_meta_data->>'has_password' as metadata_has_password
FROM auth.users
WHERE email = 'susan@susanthelen.com';



