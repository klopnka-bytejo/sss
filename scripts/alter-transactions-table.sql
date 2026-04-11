-- Alter transactions table to add balance_after_cents if it doesn't exist
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_after_cents INTEGER DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
