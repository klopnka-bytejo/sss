'use workflow'

import { sleep } from 'workflow'
import { sendEmailStep } from './send-email-step'

interface EmailPayload {
  userEmail: string
  userName: string
  subject: string
  body: string
  adminId: string
}

export async function sendEmailWorkflow(payload: EmailPayload) {
  console.log('[v0] Starting email workflow for:', payload.userEmail)

  // Step 1: Validate email format
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.userEmail)
  if (!isValidEmail) {
    throw new Error('Invalid email address')
  }

  // Step 2: Send the email using step function
  const emailResult = await sendEmailStep({
    to: payload.userEmail,
    subject: payload.subject,
    name: payload.userName,
    body: payload.body,
    adminId: payload.adminId
  })

  if (!emailResult.success) {
    throw new Error(`Email sending failed: ${emailResult.error}`)
  }

  // Step 3: Wait a moment to ensure delivery
  await sleep('1s')

  console.log('[v0] Email workflow completed successfully')

  return {
    success: true,
    id: emailResult.messageId,
    timestamp: new Date().toISOString()
  }
}
