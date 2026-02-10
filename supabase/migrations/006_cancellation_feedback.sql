-- Create table to store cancellation feedback
CREATE TABLE cancellation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  reason text NOT NULL,
  feedback text,
  tier text, -- What tier were they on when they canceled?
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX idx_cancellation_feedback_reason ON cancellation_feedback(reason);
CREATE INDEX idx_cancellation_feedback_created_at ON cancellation_feedback(created_at);

-- Enable RLS
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON cancellation_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback (for analysis)
-- We'll create admin policy later, for now service role handles this

-- Comments for clarity
COMMENT ON TABLE cancellation_feedback IS 'Stores user feedback when they cancel subscriptions';
COMMENT ON COLUMN cancellation_feedback.reason IS 'Primary reason for cancellation (from predefined list)';
COMMENT ON COLUMN cancellation_feedback.feedback IS 'Optional additional feedback from user';
COMMENT ON COLUMN cancellation_feedback.tier IS 'User tier at time of cancellation (pro/premium)';
