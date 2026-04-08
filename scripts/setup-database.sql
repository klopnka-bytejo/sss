-- =====================================================
-- GAMEBOOST DATABASE SETUP SCRIPT
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'pro', 'admin')),
  balance_cents INTEGER DEFAULT 0,
  pending_cents INTEGER DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  total_withdrawn_cents INTEGER DEFAULT 0,
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  bio TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  metadata JSONB DEFAULT '{}',
  availability_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email_orders": true, "email_marketing": false}',
  privacy_settings JSONB DEFAULT '{"profile_visible": true, "show_activity": true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT DEFAULT 'boosting',
  delivery_type TEXT DEFAULT 'piloted',
  pricing_type TEXT DEFAULT 'fixed',
  base_price_cents INTEGER NOT NULL DEFAULT 0,
  min_price_cents INTEGER,
  max_price_cents INTEGER,
  delivery_time_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  client_id UUID REFERENCES profiles(id),
  pro_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  status TEXT DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER DEFAULT 0,
  pro_payout_cents INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  selected_options JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  proof_link TEXT,
  completion_summary TEXT,
  proof_submitted_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ORDER MESSAGES TABLE
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  pro_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PRO APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS pro_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  discord TEXT,
  games JSONB DEFAULT '[]',
  experience TEXT,
  achievements TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  target_type TEXT DEFAULT 'all',
  target_id UUID,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PRICING RULES TABLE
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  base_value DECIMAL(10,2),
  multiplier DECIMAL(10,4) DEFAULT 1.0,
  options JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PRO FINES TABLE
CREATE TABLE IF NOT EXISTS pro_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  amount_cents INTEGER NOT NULL,
  reason TEXT NOT NULL,
  fine_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  deducted_at TIMESTAMPTZ
);

-- 13. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_options JSONB DEFAULT '{}',
  calculated_price_cents INTEGER NOT NULL,
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID,
  contact_email TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MODERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  blocked_content TEXT NOT NULL,
  matched_words TEXT[],
  severity TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_services_game ON services(game_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_pro ON orders(pro_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_messages_order ON order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pro ON reviews(pro_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_pro ON withdrawals(pro_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- SAMPLE DATA - GAMES
-- =====================================================
INSERT INTO games (name, slug, description, is_active, sort_order) VALUES
('League of Legends', 'league-of-legends', 'The world''s most popular MOBA game', true, 1),
('Valorant', 'valorant', 'Riot Games'' tactical shooter', true, 2),
('Counter-Strike 2', 'counter-strike-2', 'The legendary FPS game', true, 3),
('World of Warcraft', 'world-of-warcraft', 'The iconic MMORPG', true, 4),
('Fortnite', 'fortnite', 'The battle royale phenomenon', true, 5),
('Apex Legends', 'apex-legends', 'Fast-paced battle royale', true, 6),
('Destiny 2', 'destiny-2', 'Sci-fi action MMO', true, 7),
('Diablo IV', 'diablo-iv', 'Action RPG dungeon crawler', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SAMPLE DATA - SERVICES
-- =====================================================
INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Rank Boosting',
  'rank-boosting',
  'Professional rank boosting service',
  'Our expert players will boost your rank to your desired tier quickly and safely.',
  'boosting',
  'piloted',
  'dynamic',
  999,
  24,
  true,
  '["VPN Protection", "Offline Mode", "Stream on Request"]'::jsonb
FROM games g WHERE g.slug = 'league-of-legends'
ON CONFLICT DO NOTHING;

INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Placement Matches',
  'placement-matches',
  'Complete your placement matches',
  'Let our pros complete your placement matches for the best possible starting rank.',
  'boosting',
  'piloted',
  'fixed',
  2999,
  48,
  true,
  '["10 Games", "Priority Queue", "Live Updates"]'::jsonb
FROM games g WHERE g.slug = 'league-of-legends'
ON CONFLICT DO NOTHING;

INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Competitive Boosting',
  'competitive-boosting',
  'Reach your dream rank in Valorant',
  'Our Radiant-level players will boost your competitive rank safely.',
  'boosting',
  'piloted',
  'dynamic',
  1499,
  24,
  true,
  '["Radiant Players", "VPN Protection", "Daily Updates"]'::jsonb
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT DO NOTHING;

INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Coaching Session',
  'coaching-session',
  '1-on-1 coaching with pros',
  'Learn from the best with personalized coaching sessions.',
  'coaching',
  'coaching',
  'fixed',
  4999,
  2,
  true,
  '["1 Hour Session", "VOD Review", "Custom Tips"]'::jsonb
FROM games g WHERE g.slug = 'valorant'
ON CONFLICT DO NOTHING;

INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Premier Rank Boost',
  'premier-rank-boost',
  'Climb the Premier ranks',
  'Professional CS2 Premier rank boosting service.',
  'boosting',
  'piloted',
  'dynamic',
  1299,
  24,
  true,
  '["Global Elite Boosters", "Secure Account", "Fast Delivery"]'::jsonb
FROM games g WHERE g.slug = 'counter-strike-2'
ON CONFLICT DO NOTHING;

INSERT INTO services (game_id, title, slug, short_description, description, category, delivery_type, pricing_type, base_price_cents, delivery_time_hours, is_active, features)
SELECT 
  g.id,
  'Mythic+ Dungeons',
  'mythic-plus-dungeons',
  'Clear high-level Mythic+ dungeons',
  'Get carried through Mythic+ dungeons for the best gear.',
  'boosting',
  'selfplay',
  'fixed',
  1999,
  4,
  true,
  '["+15 Keys", "Full Loot", "Experienced Teams"]'::jsonb
FROM games g WHERE g.slug = 'world-of-warcraft'
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Games and Services: Public read
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);

-- Orders: Users see their own orders, PROs see assigned orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = client_id OR auth.uid() = pro_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Order parties can update" ON orders FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = pro_id);

-- Order Messages: Order parties can view and send
CREATE POLICY "Order parties can view messages" ON order_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_messages.order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid())));
CREATE POLICY "Order parties can send messages" ON order_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_messages.order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid())));

-- Reviews: Public read, clients can create
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Cart Items: Users manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Withdrawals: PROs see their own
CREATE POLICY "PROs can view own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "PROs can create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = pro_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Database setup complete! Tables created: profiles, games, services, orders, order_messages, reviews, withdrawals, wallet_transactions, pro_applications, discounts, pricing_rules, pro_fines, cart_items, support_tickets, moderation_logs, audit_logs' as status;
