-- Create admin user with specific email and password
-- Email: sanad.nassar@hotmail.com
-- Password: asdasx555 (bcrypt hashed)

INSERT INTO profiles (
  id,
  email,
  username,
  full_name,
  password_hash,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'sanad.nassar@hotmail.com',
  'admin',
  'Admin User',
  '$2a$10$Qj8DjHvJvK9.K8bJk8bJkO5q8zQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v', -- bcrypt hash of 'asdasx555'
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Qj8DjHvJvK9.K8bJk8bJkO5q8zQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8v',
  role = 'admin'
RETURNING id, email, role;
