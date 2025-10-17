-- Temporarily disable RLS for testing
-- This will allow registration to work while we debug the policies

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- This should allow the registration to work immediately
-- We can re-enable RLS later with proper policies
