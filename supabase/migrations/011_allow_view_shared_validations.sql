-- Allow anyone to view validations that are linked to approved shared ideas
-- This ensures that the marketplace can display AI reasoning and other details
-- while still protecting unshared validations.

CREATE POLICY "Anyone can view validations for approved shared ideas"
  ON public.validations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_ideas
      WHERE shared_ideas.validation_id = public.validations.id
      AND shared_ideas.status = 'approved'
    )
  );
