-- Create a robust trigger to ensure user_karma email is always populated
-- This trigger fires BEFORE insert or update on the user_karma table itself

CREATE OR REPLACE FUNCTION public.ensure_user_karma_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Only fetch if email is null or empty
    IF NEW.email IS NULL OR NEW.email = '' THEN
        SELECT email INTO NEW.email
        FROM auth.users
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_karma_before_upsert ON public.user_karma;
CREATE TRIGGER on_user_karma_before_upsert
    BEFORE INSERT OR UPDATE ON public.user_karma
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_karma_email();

-- Backfill any remaining NULL email addresses immediately
UPDATE public.user_karma uk
SET email = au.email
FROM auth.users au
WHERE uk.user_id = au.id
AND (uk.email IS NULL OR uk.email = '');
