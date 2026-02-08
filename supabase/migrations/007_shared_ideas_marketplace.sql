-- Create shared_ideas table
CREATE TABLE shared_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id uuid REFERENCES validations(id) NOT NULL UNIQUE,
  idea_id uuid REFERENCES ideas(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Display fields (denormalized for performance)
  title text NOT NULL,
  problem text NOT NULL,
  target_customer text NOT NULL,
  overall_score integer NOT NULL,
  traffic_light text NOT NULL,
  
  -- Privacy settings
  is_anonymous boolean DEFAULT true,
  shared_by_name text,
  
  -- Metadata
  view_count integer DEFAULT 0,
  inspiration_count integer DEFAULT 0,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for shared_ideas
CREATE INDEX shared_ideas_user_id_idx ON shared_ideas(user_id);
CREATE INDEX shared_ideas_status_idx ON shared_ideas(status);
CREATE INDEX shared_ideas_overall_score_idx ON shared_ideas(overall_score);
CREATE INDEX shared_ideas_created_at_idx ON shared_ideas(created_at);
CREATE INDEX shared_ideas_approved_at_idx ON shared_ideas(approved_at);

-- Create composite index for efficient querying of approved ideas
CREATE INDEX shared_ideas_status_approved_at_idx ON shared_ideas(status, approved_at DESC) WHERE status = 'approved';

-- Enable RLS for shared_ideas
ALTER TABLE shared_ideas ENABLE ROW LEVEL SECURITY;

-- Shared ideas RLS Policies
CREATE POLICY "Anyone can view approved shared ideas"
  ON shared_ideas FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own shared ideas"
  ON shared_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can share own ideas"
  ON shared_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared ideas"
  ON shared_ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all"
  ON shared_ideas FOR ALL
  USING (true);

-- Create user_karma table
CREATE TABLE user_karma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  karma_points integer DEFAULT 0,
  ideas_shared integer DEFAULT 0,
  ideas_inspired integer DEFAULT 0,
  free_validation_credits integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_karma user_id
CREATE INDEX user_karma_user_id_idx ON user_karma(user_id);

-- Enable RLS for user_karma
ALTER TABLE user_karma ENABLE ROW LEVEL SECURITY;

-- user_karma RLS Policies
CREATE POLICY "Users can view own karma"
  ON user_karma FOR SELECT
  USING (auth.uid() = user_id);

-- Restricting INSERT/UPDATE to service role (backend logic)
-- Note: Service role has access by default, but we can be explicit if needed.
-- Policies only apply if not using service role.

-- Create trigger function for user_karma initialization
CREATE OR REPLACE FUNCTION create_user_karma()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_karma (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created_karma
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_karma();

-- Add updated_at triggers (assuming handle_updated_at exists from 001)
CREATE TRIGGER shared_ideas_updated_at
  BEFORE UPDATE ON shared_ideas
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_karma_updated_at
  BEFORE UPDATE ON user_karma
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
