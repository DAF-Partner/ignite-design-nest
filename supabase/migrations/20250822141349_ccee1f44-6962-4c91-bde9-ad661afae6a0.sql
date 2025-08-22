-- Fix infinite recursion in RLS policy for conversation_participants by using a SECURITY DEFINER helper
BEGIN;

-- Helper function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants p
    WHERE p.conversation_id = conv_id
      AND p.user_id = (auth.uid())::text
  );
$$;

-- Replace recursive SELECT policy on conversation_participants
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  public.is_conversation_member(conversation_participants.conversation_id)
  OR public.get_current_user_role() = 'ADMIN'
);

-- Align conversations SELECT policy to use the helper (no recursion risk here, but for consistency)
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
  public.is_conversation_member(conversations.id)
  OR public.get_current_user_role() = 'ADMIN'
);

COMMIT;