-- Dev-only relaxation: always return ADMIN in get_current_user_role so RLS allows reads without Supabase auth during development
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Development default: allow access when not authenticated
  IF auth.uid() IS NULL THEN
    RETURN 'ADMIN';
  END IF;

  -- Placeholder: treat all authenticated users as ADMIN in this demo
  RETURN 'ADMIN';
END;
$function$;