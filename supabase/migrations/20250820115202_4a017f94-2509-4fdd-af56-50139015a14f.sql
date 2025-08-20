-- Make case_id and agent_id compatible with app's string IDs
ALTER TABLE public.actions
  ALTER COLUMN case_id TYPE text USING case_id::text,
  ALTER COLUMN agent_id TYPE text USING agent_id::text;

-- Relax RLS for demo to allow inserts/updates without Supabase auth session
DROP POLICY IF EXISTS "Authenticated users can create actions" ON public.actions;
DROP POLICY IF EXISTS "Users can update their own actions" ON public.actions;

CREATE POLICY "Anyone can create actions (demo)"
ON public.actions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update actions (demo)"
ON public.actions
FOR UPDATE
USING (true);
