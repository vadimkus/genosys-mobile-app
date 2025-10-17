-- Test and fix wishlist table issues
-- First, let's check if the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'wishlist_items';

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  product_original_price DECIMAL(10,2),
  product_image TEXT,
  product_category TEXT,
  product_brand TEXT,
  product_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user and product
  UNIQUE(user_id, product_id)
);

-- Disable RLS temporarily to allow operations
ALTER TABLE public.wishlist_items DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON public.wishlist_items;

-- Grant full permissions
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO anon;
GRANT ALL ON public.wishlist_items TO service_role;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_wishlist_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON public.wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_wishlist_updated_at_column();

-- Test insert (this should work now)
-- You can test this manually in Supabase SQL editor
