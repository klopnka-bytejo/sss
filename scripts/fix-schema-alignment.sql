-- Add user_id column to pro_applications if it doesn't exist
ALTER TABLE pro_applications ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add message column to pro_applications if it doesn't exist  
ALTER TABLE pro_applications ADD COLUMN IF NOT EXISTS message TEXT;

-- Ensure messages table has all required columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_applications_status ON pro_applications(status);
CREATE INDEX IF NOT EXISTS idx_pro_applications_email ON pro_applications(email);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Verify schemas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pro_applications' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;
