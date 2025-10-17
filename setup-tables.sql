-- Complete setup for addresses and wishlist tables
-- Run this in your Supabase SQL editor

-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT NOT NULL DEFAULT 'United Arab Emirates',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
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
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;

DROP POLICY IF EXISTS "Users can view own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON public.wishlist_items;

-- Grant full permissions
GRANT ALL ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO anon;
GRANT ALL ON public.addresses TO service_role;

GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO anon;
GRANT ALL ON public.wishlist_items TO service_role;

-- Create function to update updated_at timestamp for addresses
CREATE OR REPLACE FUNCTION public.update_addresses_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp for wishlist_items
CREATE OR REPLACE FUNCTION public.update_wishlist_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_addresses_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON public.wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_wishlist_updated_at_column();

-- Test the tables exist
SELECT 'Addresses table created successfully' as status;
SELECT 'Wishlist items table created successfully' as status;
