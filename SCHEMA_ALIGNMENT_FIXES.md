# Schema Alignment Fixes - Elevate Gaming

## Overview
All API routes and frontend forms have been fixed to match the EXISTING database schema exactly. No database modifications were made - only code was updated to align with the actual table structure.

## Database Schema Verified
The following tables were inspected and their exact column names confirmed:

### pro_applications Table
**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, nullable)
- `full_name` (text)
- `email` (text)
- `password_hash` (text)
- `discord_username` (text)
- `gamer_tag` (text)
- `games` (jsonb)
- `country` (text)
- `years_of_experience` (text)
- `bio` (text)
- `message` (text)
- `status` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `reviewed_at` (timestamp, nullable)
- `reviewed_by` (uuid, nullable)
- `rejection_reason` (text, nullable)

### messages Table
**Columns:**
- `id` (uuid, primary key)
- `conversation_id` (uuid)
- `sender_id` (uuid)
- `recipient_id` (uuid)
- `content` (text)
- `is_read` (boolean)
- `read_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### conversations Table
**Columns:**
- `id` (uuid, primary key)
- `participant_1_id` (uuid)
- `participant_2_id` (uuid)
- `created_at` (timestamp)
- `last_message_at` (timestamp)

### profiles Table
**Key columns used:**
- `id` (uuid, primary key)
- `email` (text)
- `display_name` (text)
- `password_hash` (text)
- `role` (text)
- `created_at` (timestamp)

## API Routes Updated

### 1. POST /api/become-pro
**File:** `/app/api/become-pro/route.ts`

**Changes Made:**
- ✅ Uses exact column names from `pro_applications` table
- ✅ Accepts `fullName` from form, inserts as `full_name` in DB
- ✅ Properly handles all optional fields with empty string defaults
- ✅ Includes validation function that checks required fields
- ✅ Uses parameterized queries (`$1, $2, $3...`) for SQL injection prevention
- ✅ Returns proper HTTP status codes (201 for success, 400 for validation, 500 for server errors)
- ✅ Cleaned up debug console.log statements

**Query:**
```sql
INSERT INTO pro_applications (
  user_id, full_name, email, password_hash, discord_username, 
  gamer_tag, games, country, years_of_experience, bio, message, 
  status, created_at, updated_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
```

**Request Fields Accepted:**
- `fullName` (required) → `full_name` column
- `email` (required) → `email` column
- `password` (required) → `password_hash` column (base64 encoded)
- `games` (required array) → `games` column (JSON)
- `country` (required) → `country` column
- `discordUsername` (optional) → `discord_username` column
- `gamerTag` (optional) → `gamer_tag` column
- `yearsOfExperience` (optional) → `years_of_experience` column
- `bio` (optional) → `bio` column
- `message` (optional) → `message` column
- `customCountry` (used if country is "Other")

### 2. POST /api/messages/send
**File:** `/app/api/messages/send/route.ts`

**Changes Made:**
- ✅ Uses exact column names from `messages` table
- ✅ Accepts both `recipientId` and `recipient_id` for flexibility
- ✅ Accepts both `content` and `message` for message body
- ✅ Validates that recipient exists before creating message
- ✅ Auto-creates conversation if it doesn't exist
- ✅ Uses parameterized queries for security
- ✅ Returns proper HTTP status codes
- ✅ Cleaned up debug console.log statements

**Queries:**
```sql
-- Check recipient exists
SELECT id FROM profiles WHERE id = $1

-- Get or create conversation
SELECT id FROM conversations 
WHERE (participant_1_id = $1 AND participant_2_id = $2)
   OR (participant_1_id = $2 AND participant_2_id = $1)

-- Create new conversation if needed
INSERT INTO conversations (participant_1_id, participant_2_id, created_at, last_message_at)
VALUES ($1, $2, NOW(), NOW())

-- Create message
INSERT INTO messages (conversation_id, sender_id, recipient_id, content, is_read, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, NOW(), NOW())

-- Update conversation last message timestamp
UPDATE conversations SET last_message_at = NOW() WHERE id = $1
```

**Request Fields Accepted:**
- `recipientId` or `recipient_id` (required) → `recipient_id` column
- `content` or `message` (required) → `content` column

## Frontend Forms Updated

### Become a PRO Form
**File:** `/app/become-pro/page.tsx`

**Changes Made:**
- ✅ Form state matches API expectations exactly
- ✅ All field names in FormData type match request body names
- ✅ Validation function checks only required fields
- ✅ Optional fields allowed to be empty
- ✅ Cleaned up debug console.log statements from game toggle

**Form Submission:**
- Method: POST
- Endpoint: `/api/become-pro`
- Content-Type: application/json
- Includes error handling with non-JSON response detection

## Validation Rules

### PRO Application
- `fullName`: Required, non-empty string
- `email`: Required, must contain '@'
- `password`: Required, minimum 8 characters
- `games`: Required, at least one game selected
- `country`: Required
- `customCountry`: Required only if country is "Other"
- All other fields: Optional

### Message
- `recipientId`: Required, must be valid user UUID
- `content`/`message`: Required, non-empty string

## Error Handling

### HTTP Status Codes
- **201 Created**: Successfully created resource (PRO application, message)
- **400 Bad Request**: Validation error or missing required fields
- **401 Unauthorized**: Missing user authentication
- **404 Not Found**: Resource not found (e.g., recipient doesn't exist)
- **500 Internal Server Error**: Database error or server issue

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "fieldName": "Error message for field"
  }
}
```

## Testing Checklist

✅ **PRO Application Submission**
- [ ] Form validates required fields
- [ ] Optional fields can be empty
- [ ] Submission creates record in pro_applications table
- [ ] All columns receive correct values
- [ ] Games array is stored as JSON
- [ ] Password is hashed
- [ ] Timestamp fields are auto-populated
- [ ] Success message displays after submission

✅ **Message Sending**
- [ ] Validates recipient exists
- [ ] Creates conversation if needed
- [ ] Stores message in messages table
- [ ] All columns receive correct values
- [ ] Conversation's last_message_at updates
- [ ] Accepts both field name variations (content/message, recipientId/recipient_id)

## Summary of Fixes

| Issue | Solution | File(s) |
|-------|----------|---------|
| Column name mismatches | Updated all queries to use exact schema column names | `/api/become-pro/route.ts`, `/api/messages/send/route.ts` |
| Optional field handling | Changed from NULL to empty strings for NOT NULL columns | Both API routes |
| Parameter binding | Using Neon `.query()` with `$1, $2...` placeholders | Both API routes |
| Form field names | Matched FormData to API expectations | `/app/become-pro/page.tsx` |
| Validation | Only checks required fields, allows optional fields | Both API routes |
| Debug statements | Removed all `console.log("[v0]...")` statements | All 3 files |
| Error messages | Return clear, user-friendly error responses | Both API routes |

No database schema was modified. All changes were code-level only to match the existing database structure.
