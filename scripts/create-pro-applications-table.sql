-- Create pro_applications table to store PRO application submissions
CREATE TABLE IF NOT EXISTS pro_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  gamer_tag TEXT NOT NULL,
  games JSONB NOT NULL,
  country TEXT NOT NULL,
  years_of_experience TEXT NOT NULL,
  bio TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pro_applications_status ON pro_applications(status);
CREATE INDEX IF NOT EXISTS idx_pro_applications_email ON pro_applications(email);
CREATE INDEX IF NOT EXISTS idx_pro_applications_created_at ON pro_applications(created_at DESC);
