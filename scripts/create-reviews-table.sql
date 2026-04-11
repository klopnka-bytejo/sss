-- Create Reviews Table for Elevate Gaming
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason VARCHAR(255),
  flagged_by UUID REFERENCES profiles(id),
  flagged_at TIMESTAMP WITH TIME ZONE,
  moderation_status VARCHAR(50) DEFAULT 'approved', -- approved, pending, rejected
  rejection_reason TEXT,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_pro_id ON reviews(pro_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Create table for review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Create index for votes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_helpful_votes(user_id);

-- Create view for review statistics by PRO
CREATE OR REPLACE VIEW pro_review_stats AS
SELECT 
  pro_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  ROUND(AVG(rating)::numeric, 2) as rounded_average_rating,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
  SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count,
  SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count,
  SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count,
  SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count
FROM reviews
WHERE moderation_status = 'approved'
GROUP BY pro_id;
