-- ============================================================
-- VENLIDATE: ADD IDEA SUMMARY COLUMNS
-- Adds description, score, and score_breakdown to ideas table
-- for roadmap generation and overview.
-- ============================================================

ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS score int,
ADD COLUMN IF NOT EXISTS score_breakdown jsonb;

-- Default description to problem for existing rows
UPDATE ideas SET description = problem WHERE description IS NULL;

COMMENT ON COLUMN ideas.description IS 'AI-enhanced or summarized description for roadmap context.';
COMMENT ON COLUMN ideas.score IS 'Latest overall validation score (0-100).';
COMMENT ON COLUMN ideas.score_breakdown IS 'Latest dimension-level scores (jsonb).';
