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
  user_role_val text;
  case_record record;
BEGIN
  -- Get the current user role
  user_role_val := get_current_user_role();
  
  -- Check if user has access to this case
  SELECT * INTO case_record FROM public.case_intakes 
  WHERE case_intakes.id = case_id_param
  AND (
    CASE
      WHEN (user_role_val = ANY (ARRAY['ADMIN', 'DPO'])) THEN true
      WHEN ((user_role_val = 'CLIENT') AND (case_intakes.client_id = (auth.uid())::text)) THEN true
      WHEN ((user_role_val = 'AGENT') AND (case_intakes.assigned_agent_id = (auth.uid())::text)) THEN true
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
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_name
      ELSE LEFT(case_record.debtor_name, 3) || '***'
    END,
    CASE 
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_email
      ELSE NULL::text
    END,
    CASE 
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_phone
      ELSE NULL::text
    END,
    CASE 
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_address
      ELSE NULL::jsonb
    END,
    CASE 
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_tax_id
      ELSE NULL::text
    END,
    CASE 
      WHEN user_role_val IN ('ADMIN', 'DPO', 'AGENT') THEN case_record.debtor_vat_id
      ELSE NULL::text
    END,
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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_case_with_privacy_protection(uuid) TO authenticated;