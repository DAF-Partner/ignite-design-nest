-- Fix the search path security issue for the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';