-- Migration: Add dynamic pricing support
-- Adds game_id, pricing_type to services
-- Creates service_options and order_items tables

-- Add columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS game_id uuid REFERENCES games(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_type varchar(20) DEFAULT 'fixed';
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price integer;
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_time varchar(50);

-- Create index on game_id
CREATE INDEX IF NOT EXISTS idx_services_game_id ON services(game_id);

-- Create service_options table for dynamic pricing
CREATE TABLE IF NOT EXISTS service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
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
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  item_type varchar(50),
  item_name varchar(255),
  selected_options jsonb,
  quantity integer DEFAULT 1,
  price_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
