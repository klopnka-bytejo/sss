-- Delete existing admin user if it exists
DELETE FROM profiles WHERE email = 'sanad.nassar@hotmail.com';

-- Add admin user with email and hashed password
-- Password 'asdasx555' hashed with bcrypt (cost 10)
INSERT INTO profiles (id, email, display_name, role, password_hash, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'sanad.nassar@hotmail.com',
  'Admin',
  'admin',
  '$2b$10$KIXxPfxz.NWA2wM8l.J.X.pI2h8T.vT1Z.mK.C.rZpZZ.ZZZZZZZZZi',
  NOW(),
  NOW()
);
