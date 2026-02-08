-- Add used_credit column to validations table
ALTER TABLE validations 
ADD COLUMN used_credit BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN validations.used_credit IS 'Indicates if this validation was paid for using a free credit instead of monthly quota';
