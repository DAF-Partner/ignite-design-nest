-- First, drop the existing overly permissive demo policies
DROP POLICY IF EXISTS "Anyone can create actions (demo)" ON public.actions;
DROP POLICY IF EXISTS "Anyone can update actions (demo)" ON public.actions;
DROP POLICY IF EXISTS "Anyone can view actions (demo)" ON public.actions;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- For now, we'll use a simple approach - in a real app this would come from a profiles/user_roles table
  -- This is a placeholder that returns 'ADMIN' for authenticated users
  -- You should replace this with actual role lookup from your user management system
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Placeholder: return ADMIN for authenticated users
  -- In production, this should query your user roles table
  RETURN 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create secure RLS policies for the actions table

-- Policy for viewing actions - only authenticated users with proper roles
CREATE POLICY "Users can view actions based on role" 
ON public.actions 
FOR SELECT 
TO authenticated
USING (
  CASE 
    WHEN get_current_user_role() = 'ADMIN' THEN true
    WHEN get_current_user_role() = 'DPO' THEN true
    -- Add more role-based conditions as needed
    ELSE false
  END
);

-- Policy for creating actions - only authenticated users with proper roles
CREATE POLICY "Authorized users can create actions" 
ON public.actions 
FOR INSERT 
TO authenticated
WITH CHECK (
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'CLIENT') THEN true
    ELSE false
  END
);

-- Policy for updating actions - only authenticated users with proper roles
CREATE POLICY "Authorized users can update actions" 
ON public.actions 
FOR UPDATE 
TO authenticated
USING (
  CASE 
    WHEN get_current_user_role() = 'ADMIN' THEN true
    -- Add case-specific ownership checks here when you have case ownership logic
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN get_current_user_role() = 'ADMIN' THEN true
    ELSE false
  END
);

-- Policy for deleting actions - restrict to admins only
CREATE POLICY "Only admins can delete actions" 
ON public.actions 
FOR DELETE 
TO authenticated
USING (get_current_user_role() = 'ADMIN');