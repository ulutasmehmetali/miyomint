/*
  # Fix signup triggers to avoid raw_user_metadata error

  - Drop legacy handle_new_user trigger/function that referenced raw_user_metadata
  - Create dedicated functions for profile creation and welcome email dispatch
  - Ensure triggers use the new functions and are idempotent
*/

-- Drop the old trigger/function if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER on_auth_user_created ON auth.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_new_user'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE 'DROP FUNCTION public.handle_new_user()';
  END IF;
END $$;

-- Function to create profile rows safely
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_full_name text := '';
BEGIN
  new_full_name := COALESCE(
    (to_jsonb(NEW)->'raw_user_meta_data'->>'full_name'),
    ''
  );

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, new_full_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Function to enqueue welcome email via Edge Function (best effort)
CREATE OR REPLACE FUNCTION public.enqueue_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  BEGIN
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-welcome-email';
    service_role_key := current_setting('app.settings.service_role_key', true);

    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'users',
        'record', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'raw_user_meta_data', to_jsonb(NEW)->'raw_user_meta_data'
        )
      )
    );
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'enqueue_welcome_email failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Attach triggers if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'create_profile_on_signup'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER create_profile_on_signup
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_profile_on_signup();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'enqueue_welcome_email_on_signup'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER enqueue_welcome_email_on_signup
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.enqueue_welcome_email();
  END IF;
END $$;

