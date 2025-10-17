-- Create profile for existing user in auth.users
-- First, let's find your user in auth.users

-- Check what users exist in auth.users
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- If you see your user (f.this.that@gmail.com), copy the ID and run this:
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from the query above

-- Example (replace with your actual user ID):
-- INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'f.this.that@gmail.com',
--   'Vadim Sagatdinov',
--   '+1234567890',  -- Replace with your actual phone
--   false,
--   false
-- );

-- Or run this to create profile for the most recent user:
INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE((au.raw_user_meta_data->>'role')::text = 'admin', false),
  COALESCE((au.raw_user_meta_data->>'can_see_prices')::text = 'true', false)
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ORDER BY au.created_at DESC
LIMIT 1;

-- Check if the profile was created
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;
