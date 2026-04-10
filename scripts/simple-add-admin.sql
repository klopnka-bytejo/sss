-- Add password_hash column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Insert admin user
INSERT INTO profiles (email, role, password_hash, created_at)
VALUES (
  'sanad.nassar@hotmail.com',
  'admin',
  '$2b$10$KIXxPfxz.NWA2wM8l.J.X.pI2h8T.vT1Z.mK.C.rZpZZ.ZZZZZZZZZi',
  NOW()
);
