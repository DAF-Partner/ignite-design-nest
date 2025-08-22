-- Create a secure view that masks sensitive debtor information for non-admin users
CREATE OR REPLACE VIEW public.case_intakes_secure AS
SELECT 
  id,
  reference,
  contract_id,
  -- Mask debtor personal information based on user role
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_name
    ELSE LEFT(debtor_name, 3) || '***'
  END as debtor_name,
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_email
    ELSE NULL
  END as debtor_email,
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_phone
    ELSE NULL
  END as debtor_phone,
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_address
    ELSE NULL
  END as debtor_address,
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_tax_id
    ELSE NULL
  END as debtor_tax_id,
  CASE 
    WHEN get_current_user_role() IN ('ADMIN', 'DPO', 'AGENT') THEN debtor_vat_id
    ELSE NULL
  END as debtor_vat_id,
  debtor_type,
  debtor_country,
  status,
  total_amount,
  total_vat,
  total_penalties,
  total_interest,
  total_fees,
  currency_code,
  client_id,
  assigned_agent_id,
  created_by,
  service_level_id,
  debt_status_id,
  lawful_basis_id,
  is_gdpr_subject,
  notes,
  review_notes,
  rejection_reason,
  reviewed_by,
  created_at,
  updated_at,
  submitted_at,
  reviewed_at
FROM public.case_intakes;

-- Enable RLS on the secure view
ALTER VIEW public.case_intakes_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view cases through secure view based on role" 
ON public.case_intakes_secure
FOR SELECT 
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['ADMIN'::text, 'DPO'::text])) THEN true
    WHEN ((get_current_user_role() = 'CLIENT'::text) AND (client_id = (auth.uid())::text)) THEN true
    WHEN ((get_current_user_role() = 'AGENT'::text) AND (assigned_agent_id = (auth.uid())::text)) THEN true
    ELSE false
  END
);

-- Grant necessary permissions
GRANT SELECT ON public.case_intakes_secure TO authenticated;

-- Create a function to get case details with proper security
CREATE OR REPLACE FUNCTION public.get_secure_case_details(case_id_param uuid)
RETURNS TABLE (
  id uuid,
  reference text,
  contract_id text,
  debtor_name text,
  debtor_email text,
  debtor_phone text,
  debtor_address jsonb,
  debtor_tax_id text,
  debtor_vat_id text,
  debtor_type text,
  debtor_country text,
  status text,
  total_amount numeric,
  total_vat numeric,
  total_penalties numeric,
  total_interest numeric,
  total_fees numeric,
  currency_code text,
  client_id text,
  assigned_agent_id text,
  created_by text,
  service_level_id uuid,
  debt_status_id uuid,
  lawful_basis_id uuid,
  is_gdpr_subject boolean,
  notes text,
  review_notes text,
  rejection_reason text,
  reviewed_by text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.case_intakes_secure
  WHERE case_intakes_secure.id = case_id_param;
END;
$$;