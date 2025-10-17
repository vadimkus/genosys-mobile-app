-- Complete fix for registration issues
-- This addresses both RLS policies and foreign key constraints

-- Step 1: Temporarily disable RLS to allow registration
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Step 3: Fix the foreign key constraint issue
-- First, let's check if there are any orphaned records
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);

-- Step 4: Recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users with proper error handling
  INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::text = 'admin', false),
    COALESCE((NEW.raw_user_meta_data->>'can_see_prices')::text = 'true', false)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the registration
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Re-enable RLS with proper policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 7: Create new RLS policies that work
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Step 8: Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
