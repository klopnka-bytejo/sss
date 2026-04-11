-- Check if pro_applications table exists
\dt pro_applications

-- Show the structure of pro_applications table
\d pro_applications

-- If the table exists, list all columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pro_applications' 
ORDER BY ordinal_position;
