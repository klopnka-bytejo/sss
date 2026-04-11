-- Seed sample services for testing
-- First create a test PRO user if not exists
INSERT INTO profiles (id, email, display_name, role, avatar_url, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'pro1@elevate.gg', 'EliteGamer', 'pro', null, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'pro2@elevate.gg', 'ProCoach', 'pro', null, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'pro3@elevate.gg', 'MasterCarry', 'pro', null, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, user_id, title, description, price_cents, duration_minutes, category, active, created_at, updated_at)
VALUES
  -- Boosting Services
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Rank Boost - Bronze to Silver', 'Professional rank boosting from Bronze to Silver. Fast and efficient with live streaming available.', 1999, 120, 'Boosting', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Rank Boost - Silver to Gold', 'Get boosted from Silver to Gold rank by a verified PRO player. Guaranteed results.', 2999, 180, 'Boosting', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Rank Boost - Gold to Platinum', 'Professional boosting service to help you reach Platinum rank. Secure and confidential.', 4999, 240, 'Boosting', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Rank Boost - Diamond+', 'Elite boosting to Diamond and above. Only top 1% players.', 9999, 480, 'Boosting', true, NOW(), NOW()),
  
  -- Coaching Services
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '1-on-1 Coaching Session', 'Personal coaching session with VOD review and gameplay analysis. Improve your skills fast!', 2499, 60, 'Coaching', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Weekly Coaching Package', '4 coaching sessions over a week. Includes progress tracking and custom training plan.', 7999, 240, 'Coaching', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Team Coaching', 'Full team coaching session. Strategy, communication, and coordination training.', 14999, 120, 'Coaching', true, NOW(), NOW()),
  
  -- Duo Queue Services
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Duo Queue - 5 Games', 'Play 5 ranked games with a PRO player. Learn while you play!', 1499, 150, 'Duo Queue', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Duo Queue - 10 Games', 'Extended duo session with 10 ranked games. More time to improve together.', 2499, 300, 'Duo Queue', true, NOW(), NOW()),
  
  -- Account Services
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Placement Matches', 'Complete your placement matches with a PRO. Start the season right!', 3499, 180, 'Placements', true, NOW(), NOW()),
  
  -- Achievement Services
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Achievement Unlock', 'Get specific achievements unlocked by a skilled player.', 999, 60, 'Achievements', true, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '100% Completion', 'Full game completion including all achievements and collectibles.', 4999, 480, 'Achievements', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
