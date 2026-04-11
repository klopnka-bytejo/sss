-- Check the exact structure of pro_applications table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pro_applications'
ORDER BY ordinal_position;

-- Show first row to verify structure
SELECT * FROM pro_applications LIMIT 1;
