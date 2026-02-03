-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'premium')),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  billing_period text CHECK (billing_period IN ('monthly', 'annual', NULL)),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_tier_idx ON public.user_subscriptions (tier);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON public.user_subscriptions (status);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only SELECT their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE via RLS (only admin/backend can modify)
-- (Implicitly denied by not creating policies, but can be explicit if preferred)

-- Create trigger function for auto-creating free subscription
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_free_subscription();

-- Add updated_at trigger
CREATE TRIGGER user_subscriptions_handle_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
