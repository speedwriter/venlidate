-- Add solution column to ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS solution TEXT NOT NULL DEFAULT '';

-- Add solution column to shared_ideas
ALTER TABLE shared_ideas ADD COLUMN IF NOT EXISTS solution TEXT DEFAULT '';

-- Update comment for ideas
COMMENT ON COLUMN ideas.solution IS 'The proposed solution for the problem identified in the idea.';
