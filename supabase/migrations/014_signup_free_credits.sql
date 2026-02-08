-- Update trigger function for user_karma initialization with free credits
-- Rule: New users get 5 free validation credits if they sign up before 15 March 2026.

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

    INSERT INTO public.user_karma (user_id, free_validation_credits)
    VALUES (NEW.id, initial_credits)
    ON CONFLICT (user_id) DO UPDATE 
    SET free_validation_credits = EXCLUDED.free_validation_credits;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger 'on_auth_user_created_karma' already exists from migration 007.
-- We are just updating the function it calls.
