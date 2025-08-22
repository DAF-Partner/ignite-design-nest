
-- Fix RLS for actions: let Admins and assigned Agents log actions and view them;
-- let Clients view actions on their own cases.

-- 1) Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- 2) Replace INSERT policy to include AGENT, with a proper check
DROP POLICY IF EXISTS "Authorized users can create actions" ON public.actions;

CREATE POLICY "Authorized users can create actions"
  ON public.actions
  FOR INSERT
  WITH CHECK (
    CASE
      WHEN public.get_current_user_role() = 'ADMIN' THEN true
      WHEN public.get_current_user_role() = 'CLIENT' THEN true
      WHEN public.get_current_user_role() = 'AGENT' THEN (agent_id = (auth.uid())::text)
      ELSE false
    END
  );

-- 3) Replace SELECT policy to allow Admin/DPO all, Agent on assigned cases, Client on own cases
DROP POLICY IF EXISTS "Users can view actions based on role" ON public.actions;

CREATE POLICY "Users can view actions based on role"
  ON public.actions
  FOR SELECT
  USING (
    CASE
      WHEN public.get_current_user_role() IN ('ADMIN','DPO') THEN true
      WHEN public.get_current_user_role() = 'AGENT' THEN EXISTS (
        SELECT 1
        FROM public.case_intakes c
        WHERE c.id::text = actions.case_id
          AND c.assigned_agent_id = (auth.uid())::text
      )
      WHEN public.get_current_user_role() = 'CLIENT' THEN EXISTS (
        SELECT 1
        FROM public.case_intakes c
        WHERE c.id::text = actions.case_id
          AND c.client_id = (auth.uid())::text
      )
      ELSE false
    END
  );

-- Keep existing UPDATE/DELETE policies (admins only) as-is.
