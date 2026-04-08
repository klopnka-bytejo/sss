import bcrypt from 'bcrypt'
import { sql } from './neon/server'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, displayName: string, role: 'client' | 'pro' | 'admin' = 'client') {
  try {
    const hashedPassword = await hashPassword(password)
    const result = await sql`
      INSERT INTO profiles (email, display_name, role)
      VALUES (${email}, ${displayName}, ${role})
      RETURNING id, email, display_name, role
    `
    return result[0]
  } catch (error) {
    console.error('Failed to create user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM profiles WHERE email = ${email}
    `
    return result[0] || null
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM profiles WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}
