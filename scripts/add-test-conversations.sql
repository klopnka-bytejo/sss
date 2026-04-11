-- Insert test conversations and messages for admin testing
-- Get two existing users (or create test users if needed)
WITH test_users AS (
  SELECT id FROM profiles LIMIT 2
)
INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message_at, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM profiles LIMIT 1 OFFSET 0),
  (SELECT id FROM profiles LIMIT 1 OFFSET 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations LIMIT 1);
