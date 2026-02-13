-- Add user_email column to cancellation_feedback table
ALTER TABLE cancellation_feedback ADD COLUMN user_email text;

-- Add comment for clarity
COMMENT ON COLUMN cancellation_feedback.user_email IS 'Email address of the user who canceled';

-- Update existing records if possible (optional, but good for consistency)
-- This might not be possible for all if profiles/auth.users don't match perfectly, 
-- but let's try to populate from auth.users via user_id
UPDATE cancellation_feedback 
SET user_email = u.email 
FROM auth.users u 
WHERE cancellation_feedback.user_id = u.id 
AND cancellation_feedback.user_email IS NULL;
