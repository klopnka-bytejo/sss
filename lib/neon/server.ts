import { neon } from '@neondatabase/serverless'

// Create SQL client only if DATABASE_URL is available
const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : async () => [] // Return empty results if not configured

export { sql }
export default sql
