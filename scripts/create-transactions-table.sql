-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'earn', 'refund')),
  amount_cents INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_id TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);

-- Insert sample transactions if none exist
INSERT INTO transactions (user_id, type, amount_cents, description, status)
SELECT 
  p.id,
  'deposit',
  50000,
  'Initial wallet credit',
  'completed'
FROM profiles p
WHERE p.role = 'client'
AND NOT EXISTS (SELECT 1 FROM transactions WHERE user_id = p.id)
LIMIT 1;
