import { neon } from '@neondatabase/serverless'

// Create SQL client using DATABASE_URL or DATABASE_URL_UNPOOLED
// For serverless, prefer the pooled connection (DATABASE_URL)
// Fallback to UNPOOLED if pooled is not available
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED

const sql = databaseUrl
  ? neon(databaseUrl)
  : async () => [] // Return empty results if not configured

export { sql }
export default sql
