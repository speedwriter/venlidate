-- Add email column to user_karma
ALTER TABLE public.user_karma ADD COLUMN IF NOT EXISTS email text;

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.create_user_karma()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_karma (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing records
-- We use a DO block to ensure safe execution
DO $$
BEGIN
  UPDATE public.user_karma uk
  SET email = au.email
  FROM auth.users au
  WHERE uk.user_id = au.id
  AND uk.email IS NULL;
END $$;
