-- Create admin_emails table for tracking sent emails
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  message_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_emails_admin_id ON admin_emails(admin_id);
CREATE INDEX idx_admin_emails_recipient_email ON admin_emails(recipient_email);
CREATE INDEX idx_admin_emails_status ON admin_emails(status);
