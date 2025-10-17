-- Debug and fix the trigger issue
-- Let's check what's happening with the trigger

-- First, let's see if the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check if there are any users in auth.users
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Let's recreate the trigger with better debugging
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new trigger function with more logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Trigger executing for user: %', NEW.email;
  RAISE NOTICE 'User ID: %', NEW.id;
  RAISE NOTICE 'Raw user meta data: %', NEW.raw_user_meta_data;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::text = 'admin', false),
    COALESCE((NEW.raw_user_meta_data->>'can_see_prices')::text = 'true', false)
  );
  
  RAISE NOTICE 'Successfully inserted user profile for: %', NEW.email;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE WARNING 'Error details: %', SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the trigger by manually inserting a test user (this will trigger the function)
-- But first, let's check if we can manually insert into public.users
INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  '+1234567890',
  false,
  false
);

-- Check if the manual insert worked
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Clean up the test user
DELETE FROM public.users WHERE email = 'test@example.com';
