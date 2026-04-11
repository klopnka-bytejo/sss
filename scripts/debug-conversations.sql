-- Debug script to check conversations data
SELECT 'Total profiles' as check_name, COUNT(*) as count FROM profiles;
SELECT 'Total conversations' as check_name, COUNT(*) as count FROM conversations;
SELECT 'Total messages' as check_name, COUNT(*) as count FROM messages;

-- Show all conversations with participants
SELECT 
  c.id,
  c.participant_1_id,
  c.participant_2_id,
  p1.display_name as participant_1_name,
  p2.display_name as participant_2_name,
  c.last_message_at,
  c.created_at
FROM conversations c
LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN profiles p2 ON c.participant_2_id = p2.id;

-- Show messages for each conversation
SELECT 
  m.conversation_id,
  m.id as message_id,
  m.sender_id,
  m.content,
  m.created_at
FROM messages m
ORDER BY m.conversation_id, m.created_at DESC;
