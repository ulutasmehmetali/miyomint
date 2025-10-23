/*
  # Create automatic profile creation trigger

  1. Changes
    - Create function to automatically create profile when user signs up
    - Create trigger on auth.users table
    - This eliminates the need for manual profile creation in app code
  
  2. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
    - Only creates profile, doesn't expose sensitive data
*/

-- Drop existing policies that we no longer need
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_full_name text := '';
BEGIN
  -- Safely extract full_name even if raw_user_meta_data is missing
  new_full_name := COALESCE(
    (to_jsonb(NEW)->'raw_user_meta_data'->>'full_name'),
    ''
  );

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    new_full_name
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
