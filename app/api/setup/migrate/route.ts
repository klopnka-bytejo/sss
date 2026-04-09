import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST() {
  try {
    // Create conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        participant_1_id UUID REFERENCES profiles(id),
        participant_2_id UUID REFERENCES profiles(id),
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES profiles(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_conversations_participants 
      ON conversations(participant_1_id, participant_2_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id, created_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_sender 
      ON messages(sender_id)
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully' 
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
