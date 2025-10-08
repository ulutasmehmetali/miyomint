/*
  # Create Auth Webhook Function
  
  1. Creates a database function to handle new user signups
  2. The function will call the send-welcome-email edge function
  3. Sets up a trigger on auth.users INSERT events
  
  Note: This enables automatic welcome emails when users sign up
*/

-- Create function to send welcome email via edge function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get the Supabase URL and service role key from environment
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-welcome-email';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Call the edge function asynchronously using pg_net
  PERFORM
    net.http_post(
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
          'raw_user_meta_data', NEW.raw_user_meta_data
        )
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();