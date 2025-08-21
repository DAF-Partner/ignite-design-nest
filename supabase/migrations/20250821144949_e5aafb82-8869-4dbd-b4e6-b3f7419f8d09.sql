-- Fix security warning: Function Search Path Mutable
-- Update the function to set proper search_path

CREATE OR REPLACE FUNCTION public.update_case_totals()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update case totals based on invoices
  UPDATE public.case_intakes
  SET 
    total_amount = COALESCE((
      SELECT SUM(amount) FROM public.case_invoices 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
    ), 0),
    total_vat = COALESCE((
      SELECT SUM(vat_amount) FROM public.case_invoices 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
    ), 0),
    total_penalties = COALESCE((
      SELECT SUM(penalties) FROM public.case_invoices 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
    ), 0),
    total_interest = COALESCE((
      SELECT SUM(interest) FROM public.case_invoices 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
    ), 0),
    total_fees = COALESCE((
      SELECT SUM(fees) FROM public.case_invoices 
      WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.case_id, OLD.case_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;