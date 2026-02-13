-- Add thinking questions field to validations table
ALTER TABLE validations
ADD COLUMN thinking_questions jsonb DEFAULT '{}';

COMMENT ON COLUMN validations.thinking_questions IS 'AI-generated questions per dimension to help users improve their ideas. Structure: { dimension_name: ["question1", "question2"] }';
