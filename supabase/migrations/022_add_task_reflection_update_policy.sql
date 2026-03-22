-- Add missing UPDATE RLS policy for task_reflection table
-- Without this, users cannot edit their reflections (update silently fails)
CREATE POLICY "Users can update own reflections" ON task_reflection FOR UPDATE USING (auth.uid() = user_id);
