-- Add email column to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS email text;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS user_subscriptions_email_idx ON public.user_subscriptions (email);

-- Update trigger function to include user email
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, status, email)
  VALUES (NEW.id, 'free', 'active', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing subscriptions if any
-- This assumes auth.users has the email, which it always should.
UPDATE public.user_subscriptions s
SET email = u.email
FROM auth.users u
WHERE s.user_id = u.id AND s.email IS NULL;
