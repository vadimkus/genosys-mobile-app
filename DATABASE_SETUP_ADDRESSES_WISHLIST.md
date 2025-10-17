# Database Setup for Addresses and Wishlist

This guide will help you set up the database tables for the Addresses and Wishlist features in your Genosys mobile app.

## Prerequisites

- Access to your Supabase project
- SQL Editor access in Supabase dashboard

## Step 1: Create Addresses Table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Create addresses table for Genosys app
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United Arab Emirates',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for addresses table
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If this address is being set as default, unset all other defaults for this user
  IF NEW.is_default = TRUE THEN
    UPDATE public.addresses 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure single default address
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();

-- Grant permissions
GRANT ALL ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO anon;
```

## Step 2: Create Wishlist Table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Create wishlist table for Genosys app
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

-- Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist_items table
CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items" ON public.wishlist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_wishlist_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_wishlist_updated_at_column();

-- Grant permissions
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO anon;
```

## Step 3: Verify Tables

After running both scripts, verify that the tables were created successfully:

1. Go to your Supabase dashboard
2. Navigate to "Table Editor"
3. You should see two new tables:
   - `addresses`
   - `wishlist_items`

## Features Included

### Addresses Table Features:
- ✅ User-specific addresses (linked to auth.users)
- ✅ Full address information (name, phone, address, city, state, zip, country)
- ✅ Default address functionality (only one default per user)
- ✅ Row Level Security (users can only access their own addresses)
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Cascade delete (addresses deleted when user is deleted)

### Wishlist Table Features:
- ✅ User-specific wishlist items (linked to auth.users)
- ✅ Product information storage (name, price, image, category, etc.)
- ✅ Unique constraint (prevents duplicate products per user)
- ✅ Row Level Security (users can only access their own wishlist)
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Cascade delete (wishlist items deleted when user is deleted)

## Next Steps

1. **Test the screens**: Navigate to Profile → Addresses and Profile → Wishlist
2. **Add sample data**: Use the screens to add test addresses and wishlist items
3. **Integrate with Supabase**: Update the screen components to use real Supabase queries instead of mock data

## Troubleshooting

If you encounter any issues:

1. **Permission errors**: Make sure you're running the scripts as a user with sufficient privileges
2. **Table already exists**: The scripts use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times
3. **RLS policies**: If you can't access data, check that the Row Level Security policies are correctly set up

## Security Notes

- All tables use Row Level Security (RLS) to ensure users can only access their own data
- Foreign key constraints ensure data integrity
- Triggers automatically maintain data consistency (single default address, timestamps)
