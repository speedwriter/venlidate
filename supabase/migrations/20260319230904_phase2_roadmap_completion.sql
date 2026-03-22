-- ============================================================
-- VENLIDATE: ROADMAP COMPLETION & EXTENDED PHASES
-- ============================================================

-- Add completion summary to roadmap table
ALTER TABLE roadmap
ADD COLUMN IF NOT EXISTS completion_summary text,
ADD COLUMN IF NOT EXISTS completion_summary_generated_at timestamptz,
ADD COLUMN IF NOT EXISTS post_completion_choice text 
  CHECK (post_completion_choice IN ('course', 'pivot', 'continue') OR post_completion_choice IS NULL);

-- Allow phase_count to exceed 5 for extended roadmaps
ALTER TABLE phase
DROP CONSTRAINT IF EXISTS phase_phase_number_check;

ALTER TABLE phase
ADD CONSTRAINT phase_phase_number_check 
  CHECK (phase_number BETWEEN 1 AND 10);
