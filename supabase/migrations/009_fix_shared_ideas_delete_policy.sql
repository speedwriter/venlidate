-- Add missing DELETE policy for shared_ideas
CREATE POLICY "Users can delete own shared ideas"
  ON shared_ideas FOR DELETE
  USING (auth.uid() = user_id);
