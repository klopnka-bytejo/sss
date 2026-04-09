'use step'

import { sql } from '@/lib/neon/server'
import nodemailer from 'nodemailer'

interface SendEmailParams {
  to: string
  subject: string
  name: string
  body: string
  adminId: string
}

// Create a reusable email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export async function sendEmailStep(params: SendEmailParams) {
  'use step'

  try {
    // Build the email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Hello ${params.name},</h2>
            </div>
            <div class="content">
              ${params.body.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>This is an automated message from Elevate Gaming Admin.</p>
              <p>If you have any questions, please contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@elevategaming.com',
      to: params.to,
      subject: params.subject,
      html: htmlContent,
      text: params.body
    })

    // Log email in database
    await sql`
      INSERT INTO admin_emails (admin_id, recipient_email, recipient_name, subject, status, message_id, sent_at)
      VALUES (
        ${params.adminId},
        ${params.to},
        ${params.name},
        ${params.subject},
        'sent',
        ${info.messageId},
        NOW()
      )
    `

    console.log('[v0] Email sent successfully:', info.messageId)

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    }
  } catch (error) {
    console.error('[v0] Email sending error:', error)

    // Log failed email attempt
    try {
      await sql`
        INSERT INTO admin_emails (admin_id, recipient_email, recipient_name, subject, status, error_message, sent_at)
        VALUES (
          ${params.adminId},
          ${params.to},
          ${params.name},
          ${params.subject},
          'failed',
          ${error instanceof Error ? error.message : 'Unknown error'},
          NOW()
        )
      `
    } catch (dbError) {
      console.error('[v0] Failed to log email error:', dbError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}
