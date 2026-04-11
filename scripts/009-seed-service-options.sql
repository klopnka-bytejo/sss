-- Seed Service Options for Dynamic Pricing

-- Insert common options for dynamic services
DO $$
DECLARE
  service_rec RECORD;
BEGIN
  -- Loop through all dynamic services and add options
  FOR service_rec IN SELECT id, name, category FROM game_services WHERE pricing_type = 'dynamic' LOOP
    
    -- Speed options (for all dynamic services)
    INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
    (service_rec.id, 'speed', 'Normal Speed', 'normal', 1.0, 1),
    (service_rec.id, 'speed', 'Express (+50%)', 'express', 1.5, 2),
    (service_rec.id, 'speed', 'Priority (+100%)', 'priority', 2.0, 3);
    
    -- Platform options (for all dynamic services)
    INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
    (service_rec.id, 'platform', 'PC', 'pc', 1.0, 1),
    (service_rec.id, 'platform', 'PlayStation', 'playstation', 1.0, 2),
    (service_rec.id, 'platform', 'Xbox', 'xbox', 1.0, 3);
    
    -- Level/Rank options based on category
    IF service_rec.category = 'Ranking' OR service_rec.category = 'PvP' THEN
      INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
      (service_rec.id, 'current_rank', 'Bronze', 'bronze', 1.0, 1),
      (service_rec.id, 'current_rank', 'Silver', 'silver', 0.9, 2),
      (service_rec.id, 'current_rank', 'Gold', 'gold', 0.8, 3),
      (service_rec.id, 'current_rank', 'Platinum', 'platinum', 0.7, 4),
      (service_rec.id, 'current_rank', 'Diamond', 'diamond', 0.6, 5);
      
      INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
      (service_rec.id, 'desired_rank', 'Silver', 'silver', 1.0, 1),
      (service_rec.id, 'desired_rank', 'Gold', 'gold', 1.5, 2),
      (service_rec.id, 'desired_rank', 'Platinum', 'platinum', 2.0, 3),
      (service_rec.id, 'desired_rank', 'Diamond', 'diamond', 3.0, 4),
      (service_rec.id, 'desired_rank', 'Champion', 'champion', 4.0, 5);
    END IF;
    
    IF service_rec.category = 'Leveling' THEN
      INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
      (service_rec.id, 'levels', '10 Levels', '10', 1.0, 1),
      (service_rec.id, 'levels', '25 Levels', '25', 2.0, 2),
      (service_rec.id, 'levels', '50 Levels', '50', 3.5, 3),
      (service_rec.id, 'levels', '100 Levels', '100', 6.0, 4);
    END IF;
    
    IF service_rec.category = 'Carries' THEN
      INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
      (service_rec.id, 'difficulty', 'Normal', 'normal', 1.0, 1),
      (service_rec.id, 'difficulty', 'Heroic', 'heroic', 1.5, 2),
      (service_rec.id, 'difficulty', 'Mythic', 'mythic', 2.5, 3);
    END IF;
    
    -- Add-ons
    INSERT INTO service_options (service_id, option_type, label, value, price_modifier, sort_order) VALUES
    (service_rec.id, 'addon', 'Stream the Session', 'stream', 0.1, 1),
    (service_rec.id, 'addon', 'VIP Support', 'vip', 0.2, 2),
    (service_rec.id, 'addon', 'Screenshot/Video Proof', 'proof', 0.05, 3);
    
  END LOOP;
END $$;
