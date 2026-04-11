-- Seed Games and Services with Dynamic Pricing

-- Insert 8 Games
INSERT INTO games (name, slug, description, banner_url, sort_order) VALUES
('Call of Duty', 'call-of-duty', 'Dominate the battlefield with our CoD boosting services', '/images/games/cod.jpg', 1),
('Arc Raiders', 'arc-raiders', 'Conquer the alien threat with expert carries', '/images/games/arc-raiders.jpg', 2),
('EA FC 26', 'ea-fc-26', 'Rise to the top divisions with our FIFA boosting', '/images/games/ea-fc.jpg', 3),
('World of Warcraft', 'world-of-warcraft', 'Level up, raid clears, and mythic+ carries', '/images/games/wow.jpg', 4),
('Fortnite', 'fortnite', 'Win more matches and unlock exclusive rewards', '/images/games/fortnite.jpg', 5),
('Destiny 2', 'destiny-2', 'Raid completions, trials carries, and more', '/images/games/destiny2.jpg', 6),
('Battlefield', 'battlefield', 'Battlefield boosting and unlock services', '/images/games/battlefield.jpg', 7),
('Elden Ring', 'elden-ring', 'Boss kills, leveling, and build optimization', '/images/games/elden-ring.jpg', 8)
ON CONFLICT (slug) DO NOTHING;

-- Get game IDs for reference
DO $$
DECLARE
  cod_id uuid;
  arc_id uuid;
  fc_id uuid;
  wow_id uuid;
  fortnite_id uuid;
  destiny_id uuid;
  bf_id uuid;
  elden_id uuid;
BEGIN
  SELECT id INTO cod_id FROM games WHERE slug = 'call-of-duty';
  SELECT id INTO arc_id FROM games WHERE slug = 'arc-raiders';
  SELECT id INTO fc_id FROM games WHERE slug = 'ea-fc-26';
  SELECT id INTO wow_id FROM games WHERE slug = 'world-of-warcraft';
  SELECT id INTO fortnite_id FROM games WHERE slug = 'fortnite';
  SELECT id INTO destiny_id FROM games WHERE slug = 'destiny-2';
  SELECT id INTO bf_id FROM games WHERE slug = 'battlefield';
  SELECT id INTO elden_id FROM games WHERE slug = 'elden-ring';

  -- Call of Duty Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (cod_id, 'Rank Boost', 'Climb the competitive ranks with our expert players', 'dynamic', 1999, '1-3 days', 'Ranking'),
  (cod_id, 'Camo Unlocks', 'Unlock all weapon camos including mastery camos', 'fixed', 4999, '2-5 days', 'Unlocks'),
  (cod_id, 'Leveling Service', 'Power level your account to max prestige', 'dynamic', 999, '1-2 days', 'Leveling'),
  (cod_id, 'Zombie Carries', 'Complete high round zombie challenges', 'fixed', 2499, '1-2 days', 'Carries');

  -- World of Warcraft Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (wow_id, 'Mythic+ Dungeons', 'Complete any mythic+ key level', 'dynamic', 1499, '30-60 min', 'Carries'),
  (wow_id, 'Raid Carries', 'Full raid clears on any difficulty', 'dynamic', 4999, '2-4 hours', 'Carries'),
  (wow_id, 'Character Leveling', 'Level your character from 1 to max', 'dynamic', 2999, '1-3 days', 'Leveling'),
  (wow_id, 'PvP Arena Boost', 'Reach your desired arena rating', 'dynamic', 3999, '2-7 days', 'PvP'),
  (wow_id, 'Gold Farming', 'Reliable gold delivery to your character', 'fixed', 999, '1-24 hours', 'Currency');

  -- EA FC 26 Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (fc_id, 'Division Rivals Boost', 'Climb to your desired division', 'dynamic', 1999, '1-5 days', 'Ranking'),
  (fc_id, 'FUT Champions', 'Achieve your target wins in Weekend League', 'dynamic', 2999, '2-3 days', 'Ranking'),
  (fc_id, 'Coin Boost', 'Earn millions of FUT coins', 'fixed', 4999, '3-7 days', 'Currency'),
  (fc_id, 'Squad Building', 'Expert team building and tactics', 'fixed', 1499, '1 day', 'Custom');

  -- Fortnite Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (fortnite_id, 'Battle Pass Leveling', 'Complete your battle pass quickly', 'dynamic', 1999, '1-7 days', 'Leveling'),
  (fortnite_id, 'Victory Royales', 'Get guaranteed wins with our pros', 'fixed', 999, '1-2 hours', 'Carries'),
  (fortnite_id, 'Arena Points Boost', 'Reach Champion division', 'dynamic', 2999, '2-5 days', 'Ranking'),
  (fortnite_id, 'Challenge Completion', 'Complete all weekly challenges', 'fixed', 1499, '1-2 days', 'Unlocks');

  -- Destiny 2 Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (destiny_id, 'Raid Completions', 'Clear any raid with guaranteed loot', 'fixed', 2999, '1-3 hours', 'Carries'),
  (destiny_id, 'Trials of Osiris', 'Flawless trials carries', 'dynamic', 4999, '2-4 hours', 'PvP'),
  (destiny_id, 'Exotic Quests', 'Complete any exotic weapon quest', 'fixed', 1999, '1-3 days', 'Unlocks'),
  (destiny_id, 'Power Level Boost', 'Reach pinnacle power level', 'dynamic', 3499, '3-7 days', 'Leveling');

  -- Elden Ring Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (elden_id, 'Boss Kills', 'Defeat any boss with co-op assistance', 'fixed', 999, '30 min - 1 hour', 'Carries'),
  (elden_id, 'Rune Farming', 'Fast rune accumulation for leveling', 'dynamic', 1499, '1-3 hours', 'Currency'),
  (elden_id, 'Build Optimization', 'Create the perfect build for your playstyle', 'fixed', 2499, '1-2 days', 'Custom'),
  (elden_id, 'Full Completion', '100% game completion service', 'fixed', 9999, '5-10 days', 'Leveling');

  -- Arc Raiders Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (arc_id, 'Mission Carries', 'Complete difficult missions with our team', 'fixed', 1999, '1-2 hours', 'Carries'),
  (arc_id, 'Gear Farming', 'Farm the best gear and weapons', 'dynamic', 2499, '2-5 hours', 'Leveling'),
  (arc_id, 'Account Leveling', 'Level up your account quickly', 'dynamic', 1999, '1-3 days', 'Leveling');

  -- Battlefield Services
  INSERT INTO game_services (game_id, name, description, pricing_type, base_price_cents, delivery_time, category) VALUES
  (bf_id, 'Weapon Unlocks', 'Unlock all weapons and attachments', 'fixed', 3999, '3-7 days', 'Unlocks'),
  (bf_id, 'Rank Progression', 'Level up your soldier rank', 'dynamic', 1999, '2-5 days', 'Leveling'),
  (bf_id, 'Vehicle Mastery', 'Unlock all vehicle upgrades', 'fixed', 2999, '3-5 days', 'Unlocks');

END $$;
