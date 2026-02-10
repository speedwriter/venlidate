-- Fix the create_user_karma() trigger function to include email field
-- This was accidentally removed in migration 014_signup_free_credits.sql

CREATE OR REPLACE FUNCTION public.create_user_karma()
RETURNS TRIGGER AS $$
DECLARE
    initial_credits integer := 0;
    expiry_date timestamptz := '2026-03-15 00:00:00+00';
BEGIN
    -- Check if we are still within the promotion period
    IF now() < expiry_date THEN
        initial_credits := 5;
    END IF;

    -- Insert user_karma with user_id, email, and free_validation_credits
    INSERT INTO public.user_karma (user_id, email, free_validation_credits)
    VALUES (NEW.id, NEW.email, initial_credits)
    ON CONFLICT (user_id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        free_validation_credits = EXCLUDED.free_validation_credits;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill NULL email addresses for existing records
DO $$
BEGIN
  UPDATE public.user_karma uk
  SET email = au.email
  FROM auth.users au
  WHERE uk.user_id = au.id
  AND uk.email IS NULL;
END $$;
