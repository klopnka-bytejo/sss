import bcrypt from 'bcrypt'

// This script generates a bcrypt hash for the admin password
// Run: npx tsx scripts/setup-admin.ts

const password = 'asdasx555'

async function generateHash() {
  const hash = await bcrypt.hash(password, 12)
  console.log('Password:', password)
  console.log('Bcrypt Hash:', hash)
  console.log('\nUse this SQL to update admin:')
  console.log(`UPDATE profiles SET password_hash = '${hash}' WHERE email = 'sanad.nassar@hotmail.com';`)
}

generateHash()
