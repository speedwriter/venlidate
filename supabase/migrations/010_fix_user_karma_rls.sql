-- Add INSERT and UPDATE policies for user_karma
-- This allows users to initialize their own karma record if it doesn't exist
-- and allows the shareIdea/unshareIdea actions to update their karma
CREATE POLICY "Users can insert own karma"
  ON user_karma FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own karma"
  ON user_karma FOR UPDATE
  USING (auth.uid() = user_id);
