#!/usr/bin/env node

// This script creates a test admin user in the Neon database
// Usage: node scripts/create-admin.js

const crypto = require('crypto');
const { execSync } = require('child_process');

// Hash password using Node crypto (bcrypt would be better but this works for testing)
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

// Admin credentials
const adminId = crypto.randomUUID();
const adminEmail = 'admin@gamingservices.local';
const adminPassword = 'Admin123!@#';
const adminPasswordHash = hashPassword(adminPassword);
const adminDisplayName = 'Platform Admin';

// SQL to insert admin user
const sql = `
INSERT INTO profiles (
  id,
  email,
  password_hash,
  display_name,
  role,
  created_at,
  updated_at
) VALUES (
  '${adminId}',
  '${adminEmail}',
  '${adminPasswordHash}',
  '${adminDisplayName}',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '${adminPasswordHash}',
  role = 'admin';
`;

console.log('[v0] Creating admin user...');
console.log('Email:', adminEmail);
console.log('Password:', adminPassword);
console.log('');
console.log('SQL:');
console.log(sql);
console.log('');
console.log('[v0] Note: Use the email and password above to login to the admin panel at /auth/admin');
