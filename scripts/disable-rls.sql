-- Disable RLS on conversations table since we handle auth in the API
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on messages table since we handle auth in the API  
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
