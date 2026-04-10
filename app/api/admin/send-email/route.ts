import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/neon/server'
import { sendEmailWorkflow } from '@/workflows/send-email'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('user_id')?.value

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    if (adminId === 'admin-hardcoded-user') {
      // Hardcoded admin is always authorized
    } else {
      const adminCheck = await sql`
        SELECT role FROM profiles WHERE id = ${adminId}
      `

      if (!adminCheck || adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { userId, userEmail, userName, subject, body: emailBody } = body

    if (!userId || !userEmail || !userName || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Start the email workflow
    const result = await sendEmailWorkflow({
      userEmail,
      userName,
      subject,
      body: emailBody,
      adminId
    })

    // Log the email action
    await sql`
      INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (
        ${adminId},
        'email_sent',
        'user',
        ${userId},
        ${JSON.stringify({ 
          userEmail, 
          userName, 
          subject,
          timestamp: new Date().toISOString()
        })},
        NOW()
      )
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      workflowId: result?.id
    })
  } catch (error) {
    console.error('[v0] Email sending error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }, { status: 500 })
  }
}
