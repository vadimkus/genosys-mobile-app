-- Verify user data in both tables
-- Check what's in public.users
SELECT 
    id,
    email,
    name,
    phone,
    is_admin,
    can_see_prices,
    created_at,
    updated_at
FROM public.users 
ORDER BY created_at DESC;

-- Check what's in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Check if the IDs match between the two tables
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    pu.name as public_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;
