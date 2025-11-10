-- Non-destructive migration to add profile columns
-- Safe to run multiple times (uses IF NOT EXISTS)
-- No data loss, no downtime

-- Add phone column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add location column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add bio column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('phone', 'location', 'bio')
ORDER BY column_name;

-- Show sample to verify
SELECT id, email, full_name, phone, location, bio
FROM profiles
LIMIT 3;


