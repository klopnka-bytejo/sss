-- Elevate Gaming Database Schema
-- Run this migration to set up the complete database structure

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'pro', 'admin')),
  balance_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRO Profiles (additional info for service providers)
CREATE TABLE IF NOT EXISTS pro_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  games TEXT[], -- ['league-of-legends', 'valorant', 'wow']
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  hourly_rate_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services Catalog
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES pro_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('boosting', 'coaching', 'account')),
  game TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'hourly', 'per_rank')),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES profiles(id),
  pro_id UUID REFERENCES pro_profiles(id),
  service_id UUID REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_progress', 'completed', 'disputed', 'refunded', 'cancelled')),
  total_cents INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'crypto')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  stripe_payment_intent_id TEXT,
  requirements JSONB DEFAULT '{}',
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Messages (chat between client and PRO)
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE REFERENCES orders(id),
  client_id UUID REFERENCES profiles(id),
  pro_id UUID REFERENCES pro_profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE REFERENCES orders(id),
  opened_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 8. Transactions (wallet/payouts)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'order_payment', 'order_earning', 'refund', 'fee')),
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Admin Audit Log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PRO Profiles policies (public read for browsing)
CREATE POLICY "pro_profiles_select_all" ON pro_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "pro_profiles_insert_own" ON pro_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "pro_profiles_update_own" ON pro_profiles FOR UPDATE USING (auth.uid() = id);

-- Services policies (public read for browsing)
CREATE POLICY "services_select_active" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "services_select_own" ON services FOR SELECT USING (pro_id = auth.uid());
CREATE POLICY "services_insert_own" ON services FOR INSERT WITH CHECK (pro_id = auth.uid());
CREATE POLICY "services_update_own" ON services FOR UPDATE USING (pro_id = auth.uid());
CREATE POLICY "services_delete_own" ON services FOR DELETE USING (pro_id = auth.uid());

-- Orders policies
CREATE POLICY "orders_select_client" ON orders FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "orders_select_pro" ON orders FOR SELECT USING (pro_id = auth.uid());
CREATE POLICY "orders_select_admin" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert_client" ON orders FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "orders_update_participant" ON orders FOR UPDATE USING (
  client_id = auth.uid() OR pro_id = auth.uid()
);

-- Order Messages policies
CREATE POLICY "messages_select_participant" ON order_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid()))
);
CREATE POLICY "messages_insert_participant" ON order_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid()))
);

-- Reviews policies
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert_client" ON reviews FOR INSERT WITH CHECK (client_id = auth.uid());

-- Disputes policies
CREATE POLICY "disputes_select_participant" ON disputes FOR SELECT USING (
  opened_by = auth.uid() OR
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "disputes_insert_participant" ON disputes FOR INSERT WITH CHECK (
  opened_by = auth.uid() AND
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.client_id = auth.uid() OR orders.pro_id = auth.uid()))
);

-- Transactions policies
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT USING (user_id = auth.uid());

-- Admin audit log policies
CREATE POLICY "audit_select_admin" ON admin_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "audit_insert_admin" ON admin_audit_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_game ON services(game);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_pro_id ON services(pro_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_pro_id ON orders(pro_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;

  -- If registering as PRO, create pro_profile too
  IF new.raw_user_meta_data ->> 'role' = 'pro' THEN
    INSERT INTO public.pro_profiles (id, display_name, games)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
      COALESCE(
        (SELECT array_agg(value) FROM jsonb_array_elements_text(new.raw_user_meta_data -> 'games')),
        ARRAY[]::TEXT[]
      )
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'ELV-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
