-- Add action plan field to validations table
ALTER TABLE validations
ADD COLUMN action_plan jsonb;

COMMENT ON COLUMN validations.action_plan IS 'AI-generated personalized action plan for Pro/Premium users. Structure: { priorities: [...], timeline: "...", readinessCriteria: "..." }';
