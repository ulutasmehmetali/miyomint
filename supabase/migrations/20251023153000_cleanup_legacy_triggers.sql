/*
  # Remove legacy profile triggers

  Drops the old create_profile_if_verified triggers/functions that still
  reference raw_user_metadata and conflict with the new signup triggers.
*/

-- Drop legacy triggers if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'create_profile_if_verified_trigger'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER create_profile_if_verified_trigger ON auth.users';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'create_profile_if_verified_trigger_update'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER create_profile_if_verified_trigger_update ON auth.users';
  END IF;
END $$;

-- Drop legacy helper functions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'create_profile_if_verified'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE 'DROP FUNCTION public.create_profile_if_verified()';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'create_profile_if_verified_update'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE 'DROP FUNCTION public.create_profile_if_verified_update()';
  END IF;
END $$;

