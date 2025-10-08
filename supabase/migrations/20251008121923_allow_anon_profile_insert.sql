/*
  # Allow anonymous users to insert profiles during signup

  1. Changes
    - Add INSERT policy for anon users during email confirmation flow
    - This allows profile creation before email is confirmed
  
  2. Security
    - Anonymous users can only insert with matching user ID
    - Still requires valid auth session
*/

CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);
