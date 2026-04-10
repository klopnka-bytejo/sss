-- Add password_hash column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verify the column was added
SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='password_hash';
