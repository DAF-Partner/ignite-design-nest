/*
  # Fix RLS recursion in conversation_participants

  1. Problem
    - The existing RLS policy on `conversation_participants` uses `user_can_access_conversation()` 
    - This function queries `conversation_participants` table, creating infinite recursion

  2. Solution
    - Drop the existing recursive policy
    - Create a new non-recursive policy that allows users to see their own participant records
    - Admins can see all participant records

  3. Impact
    - Users can only see their own participation in conversations
    - If UI needs all participants, it should fetch them separately with proper access control
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;

-- Create a new non-recursive policy
CREATE POLICY "Users can view their own participation records"
ON public.conversation_participants FOR SELECT
USING (
  user_id = auth.uid()::text
  OR get_current_user_role() = 'ADMIN'
);