-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  granted_by uuid REFERENCES auth.users,
  granted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users (user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin_users (handled by default if no policies allow others)
-- Admins can SELECT to verify their own status
CREATE POLICY "Admins can view their own status"
ON admin_users FOR SELECT
USING (auth.uid() = user_id);

-- Manually insert yourself as first admin (replace with your user ID):
-- INSERT INTO admin_users (user_id, role) 
-- VALUES ('your-user-id-here', 'superadmin');

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update shared_ideas RLS policy for approval
DROP POLICY IF EXISTS "Service role can manage all" ON shared_ideas;

CREATE POLICY "Admins can approve/reject shared ideas"
ON shared_ideas FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
