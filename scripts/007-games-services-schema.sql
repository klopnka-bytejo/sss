-- Complete Games & Services Schema with Dynamic Pricing

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  description text,
  logo_url text,
  banner_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_services table (separate from PRO services)
CREATE TABLE IF NOT EXISTS game_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  pricing_type varchar(20) DEFAULT 'fixed',
  base_price_cents integer NOT NULL,
  delivery_time varchar(50),
  category varchar(100),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_services_game_id ON game_services(game_id);

-- Create service_options table for dynamic pricing
CREATE TABLE IF NOT EXISTS service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES game_services(id) ON DELETE CASCADE,
  option_type varchar(50) NOT NULL,
  label varchar(100) NOT NULL,
  value varchar(100) NOT NULL,
  price_modifier numeric(10,2) DEFAULT 1.0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_options_service_id ON service_options(service_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  service_id uuid REFERENCES game_services(id),
  item_type varchar(50),
  item_name varchar(255),
  selected_options jsonb,
  quantity integer DEFAULT 1,
  price_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
