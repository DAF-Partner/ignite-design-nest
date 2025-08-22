-- Create a function to get case details with masked debtor information based on user role
CREATE OR REPLACE FUNCTION public.get_case_with_privacy_protection(case_id_param uuid)
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
DECLARE
  current_role text;
  case_record record;
BEGIN
  -- Get the current user role
  current_role := get_current_user_role();
  
  -- Check if user has access to this case
  SELECT * INTO case_record FROM public.case_intakes 
  WHERE case_intakes.id = case_id_param
  AND (
    CASE
      WHEN (current_role = ANY (ARRAY['ADMIN', 'DPO'])) THEN true
      WHEN ((current_role = 'CLIENT') AND (case_intakes.client_id = (auth.uid())::text)) THEN true
      WHEN ((current_role = 'AGENT') AND (case_intakes.assigned_agent_id = (auth.uid())::text)) THEN true
      ELSE false
    END
  );
  
  -- If no case found or no access, return empty
  IF case_record.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return case data with privacy protection
  RETURN QUERY SELECT
    case_record.id,
    case_record.reference,
    case_record.contract_id,
    -- Mask debtor personal information based on user role
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_name
      ELSE LEFT(case_record.debtor_name, 3) || '***'
    END as debtor_name,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_email
      ELSE NULL::text
    END as debtor_email,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_phone
      ELSE NULL::text
    END as debtor_phone,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_address
      ELSE NULL::jsonb
    END as debtor_address,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_tax_id
      ELSE NULL::text
    END as debtor_tax_id,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_vat_id
      ELSE NULL::text
    END as debtor_vat_id,
    case_record.debtor_type,
    case_record.debtor_country,
    case_record.status,
    case_record.total_amount,
    case_record.total_vat,
    case_record.total_penalties,
    case_record.total_interest,
    case_record.total_fees,
    case_record.currency_code,
    case_record.client_id,
    case_record.assigned_agent_id,
    case_record.created_by,
    case_record.service_level_id,
    case_record.debt_status_id,
    case_record.lawful_basis_id,
    case_record.is_gdpr_subject,
    case_record.notes,
    case_record.review_notes,
    case_record.rejection_reason,
    case_record.reviewed_by,
    case_record.created_at,
    case_record.updated_at,
    case_record.submitted_at,
    case_record.reviewed_at;
END;
$$;

-- Create a function to list cases with privacy protection
CREATE OR REPLACE FUNCTION public.list_cases_with_privacy_protection()
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
DECLARE
  current_role text;
BEGIN
  -- Get the current user role
  current_role := get_current_user_role();
  
  -- Return cases with privacy protection based on user role and access
  RETURN QUERY 
  SELECT
    c.id,
    c.reference,
    c.contract_id,
    -- Mask debtor personal information based on user role
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_name
      ELSE LEFT(c.debtor_name, 3) || '***'
    END as debtor_name,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_email
      ELSE NULL::text
    END as debtor_email,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_phone
      ELSE NULL::text
    END as debtor_phone,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_address
      ELSE NULL::jsonb
    END as debtor_address,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_tax_id
      ELSE NULL::text
    END as debtor_tax_id,
    CASE 
      WHEN current_role IN ('ADMIN', 'DPO', 'AGENT') THEN c.debtor_vat_id
      ELSE NULL::text
    END as debtor_vat_id,
    c.debtor_type,
    c.debtor_country,
    c.status,
    c.total_amount,
    c.total_vat,
    c.total_penalties,
    c.total_interest,
    c.total_fees,
    c.currency_code,
    c.client_id,
    c.assigned_agent_id,
    c.created_by,
    c.service_level_id,
    c.debt_status_id,
    c.lawful_basis_id,
    c.is_gdpr_subject,
    c.notes,
    c.review_notes,
    c.rejection_reason,
    c.reviewed_by,
    c.created_at,
    c.updated_at,
    c.submitted_at,
    c.reviewed_at
  FROM public.case_intakes c
  WHERE (
    CASE
      WHEN (current_role = ANY (ARRAY['ADMIN', 'DPO'])) THEN true
      WHEN ((current_role = 'CLIENT') AND (c.client_id = (auth.uid())::text)) THEN true
      WHEN ((current_role = 'AGENT') AND (c.assigned_agent_id = (auth.uid())::text)) THEN true
      ELSE false
    END
  );
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_case_with_privacy_protection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_cases_with_privacy_protection() TO authenticated;