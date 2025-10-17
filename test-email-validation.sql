-- Test email validation in Supabase
-- Let's see what emails are being accepted

-- Check Supabase auth settings
SELECT * FROM auth.config;

-- Try to see what's in the auth.users table
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any email validation rules
SELECT * FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%email%';
