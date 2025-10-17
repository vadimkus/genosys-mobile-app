# Test Registration with Different Email Formats

The issue is that Supabase is rejecting `test2@example.com`. Let's try these email formats instead:

## Try These Email Formats:

1. **Gmail format**: `test2@gmail.com`
2. **Real domain**: `test2@genosys.ae`
3. **Simple format**: `test2@test.com`

## Steps to Test:

1. Go to your app: http://localhost:8085
2. Try registering with `test2@gmail.com` instead of `test2@example.com`
3. Check if the registration works
4. Check if a new row appears in `public.users` table

## Alternative: Check Supabase Settings

The issue might be in your Supabase project settings:

1. Go to your Supabase Dashboard
2. Go to **Authentication** → **Settings**
3. Check **Email validation** settings
4. Make sure **Enable email confirmations** is set to **OFF** for testing
5. Check if there are any **Email domain restrictions**

## Quick Fix: Use a Real Email Domain

Try registering with:
- `test2@gmail.com`
- `test2@yahoo.com`
- `test2@outlook.com`

These are more likely to pass Supabase's email validation.
