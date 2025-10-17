-- Create RPC function to bypass RLS for user profile creation
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  user_is_admin BOOLEAN,
  user_can_see_prices BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert into public.users with elevated privileges
  INSERT INTO public.users (id, email, name, phone, is_admin, can_see_prices)
  VALUES (user_id, user_email, user_name, user_phone, user_is_admin, user_can_see_prices);
  
  -- Return the created user data
  SELECT to_json(public.users.*) INTO result
  FROM public.users
  WHERE id = user_id;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object('error', SQLERRM);
END;
$$;
