/*
  # Ensure profiles table supports auth sync fields

  - Adds email_verified and verified_at columns
  - Adds COALESCE defaults for full_name and email to avoid null states
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

ALTER TABLE public.profiles
  ALTER COLUMN full_name SET DEFAULT '';

ALTER TABLE public.profiles
  ALTER COLUMN email SET DEFAULT '';

