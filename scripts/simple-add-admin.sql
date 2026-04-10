-- Update or create admin user by updating existing profiles with that email
UPDATE profiles 
SET role = 'admin', password_hash = '$2b$10$KIXxPfxz.NWA2wM8l.J.X.pI2h8T.vT1Z.mK.C.rZpZZ.ZZZZZZZZZi', updated_at = NOW()
WHERE email = 'sanad.nassar@hotmail.com';

-- If no row was updated, that means the user doesn't exist - this is fine for now
-- The admin will need to be created through proper auth flow
