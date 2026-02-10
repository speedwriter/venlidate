-- Add Stripe-related columns to user_subscriptions table
ALTER TABLE public.user_subscriptions
ADD COLUMN stripe_customer_id text UNIQUE,
ADD COLUMN stripe_subscription_id text UNIQUE,
ADD COLUMN stripe_price_id text,
ADD COLUMN stripe_current_period_end timestamptz,
ADD COLUMN stripe_cancel_at_period_end boolean DEFAULT false;

-- Create indexes for Stripe lookups
CREATE INDEX idx_user_subscriptions_stripe_customer 
  ON public.user_subscriptions(stripe_customer_id);
  
CREATE INDEX idx_user_subscriptions_stripe_subscription 
  ON public.user_subscriptions(stripe_subscription_id);

-- Update the subscription tiers to handle Stripe statuses
ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

ALTER TABLE public.user_subscriptions
ADD CONSTRAINT user_subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'expired', 'trialing', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'));

-- Comments for clarity
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe customer ID (cus_...)';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID (sub_...)';
COMMENT ON COLUMN public.user_subscriptions.stripe_price_id IS 'Current Stripe price ID (price_...)';
COMMENT ON COLUMN public.user_subscriptions.stripe_current_period_end IS 'When current billing period ends';
COMMENT ON COLUMN public.user_subscriptions.stripe_cancel_at_period_end IS 'Whether subscription will cancel at period end';
