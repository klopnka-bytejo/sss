-- Create admin user if it doesn't exist
INSERT INTO profiles (
  id,
  email,
  display_name,
  password_hash,
  role,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@example.com',
  'Admin',
  '$2a$10$lCVL8KFvV4X3S6.c.Y1mAOdRqGf0dGZfqF7yP4hc4N6VqN6xv9oHW', -- password: admin123456 (bcrypt hashed)
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = '$2a$10$lCVL8KFvV4X3S6.c.Y1mAOdRqGf0dGZfqF7yP4hc4N6VqN6xv9oHW'
WHERE profiles.email = 'admin@example.com';
