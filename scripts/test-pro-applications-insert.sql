-- Test insert into pro_applications to verify the table structure
INSERT INTO pro_applications (
  full_name, 
  email, 
  password_hash, 
  discord_username, 
  gamer_tag,
  games, 
  country, 
  years_of_experience, 
  bio, 
  status, 
  created_at,
  updated_at
) VALUES (
  'Test User', 
  'test@example.com', 
  'dGVzdHBhc3M=', 
  'testdiscord', 
  'TestGamer',
  '["valorant", "cs2"]', 
  'United States', 
  '5', 
  'Test bio for gaming',
  'pending', 
  NOW(),
  NOW()
)
RETURNING id, full_name, email, status, created_at;

-- Check the columns of pro_applications table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pro_applications' 
ORDER BY ordinal_position;
