-- Enhanced Case Intake & Acceptance Gate Schema
-- Create admin-configurable lookup tables

-- Service Levels table
CREATE TABLE public.service_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  sla_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT false,
  tenant_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Debt Statuses table  
CREATE TABLE public.debt_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT false,
  tenant_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GDPR Lawful Bases table
CREATE TABLE public.lawful_bases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  article_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT false,
  tenant_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Cases table (modify existing or create new)
CREATE TABLE IF NOT EXISTS public.case_intakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  
  -- Contract & Service Info
  contract_id TEXT,
  service_level_id UUID REFERENCES public.service_levels(id),
  debt_status_id UUID REFERENCES public.debt_statuses(id),
  
  -- Debtor Info with GDPR
  debtor_name TEXT NOT NULL,
  debtor_type TEXT DEFAULT 'individual' CHECK (debtor_type IN ('individual', 'company')),
  debtor_tax_id TEXT,
  debtor_vat_id TEXT,
  debtor_email TEXT,
  debtor_phone TEXT,
  debtor_address JSONB,
  debtor_country TEXT,
  is_gdpr_subject BOOLEAN DEFAULT true,
  lawful_basis_id UUID REFERENCES public.lawful_bases(id),
  
  -- Financial totals (computed from invoices)
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_vat DECIMAL(15,2) DEFAULT 0,
  total_penalties DECIMAL(15,2) DEFAULT 0,
  total_interest DECIMAL(15,2) DEFAULT 0,
  total_fees DECIMAL(15,2) DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'EUR',
  
  -- Case workflow state
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'needs_info', 'rejected')),
  
  -- Metadata
  notes TEXT,
  client_id TEXT NOT NULL,
  assigned_agent_id TEXT,
  created_by TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case Invoices table (one-to-many with cases)
CREATE TABLE public.case_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.case_intakes(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  vat_amount DECIMAL(15,2) DEFAULT 0,
  penalties DECIMAL(15,2) DEFAULT 0,
  interest DECIMAL(15,2) DEFAULT 0,
  fees DECIMAL(15,2) DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case Messages/Thread table
CREATE TABLE public.case_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.case_intakes(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'auto')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Events table
CREATE TABLE public.case_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.case_intakes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default service levels
INSERT INTO public.service_levels (name, code, description, sla_hours, is_system_default) VALUES
  ('Soft Collection', 'SOFT', 'Gentle reminder and negotiation approach', 72, true),
  ('Field Visit', 'FIELD', 'In-person visit to debtor', 120, false),
  ('Legal Action', 'LEGAL', 'Formal legal proceedings', 168, false),
  ('Bailiff', 'BAILIFF', 'Enforcement through bailiff services', 48, false),
  ('All Services', 'ALL', 'Comprehensive collection approach', 24, false);

-- Insert default debt statuses
INSERT INTO public.debt_statuses (name, code, description, is_system_default) VALUES
  ('Pre-legal', 'PRE_LEGAL', 'Debt not yet in legal proceedings', true),
  ('Post-legal', 'POST_LEGAL', 'Debt already in legal proceedings', false);

-- Insert default lawful bases
INSERT INTO public.lawful_bases (name, code, description, article_reference, is_system_default) VALUES
  ('Contract', 'CONTRACT', 'Performance of contract with data subject', 'Art. 6(1)(b) GDPR', true),
  ('Legitimate Interest', 'LEGITIMATE_INTEREST', 'Legitimate interests of controller', 'Art. 6(1)(f) GDPR', false),
  ('Legal Obligation', 'LEGAL_OBLIGATION', 'Compliance with legal obligation', 'Art. 6(1)(c) GDPR', false),
  ('Consent', 'CONSENT', 'Data subject consent', 'Art. 6(1)(a) GDPR', false);

-- Enable Row Level Security
ALTER TABLE public.service_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_statuses ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.lawful_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-configurable tables (admin-only write, authenticated read)
CREATE POLICY "Authenticated users can view service levels" ON public.service_levels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage service levels" ON public.service_levels
  FOR ALL TO authenticated USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Authenticated users can view debt statuses" ON public.debt_statuses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage debt statuses" ON public.debt_statuses
  FOR ALL TO authenticated USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Authenticated users can view lawful bases" ON public.lawful_bases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage lawful bases" ON public.lawful_bases
  FOR ALL TO authenticated USING (get_current_user_role() = 'ADMIN');

-- RLS Policies for case intakes (role-based access)
CREATE POLICY "Users can view cases based on role" ON public.case_intakes
  FOR SELECT TO authenticated USING (
    CASE
      WHEN get_current_user_role() IN ('ADMIN', 'DPO') THEN true
      WHEN get_current_user_role() = 'CLIENT' AND client_id = auth.uid()::text THEN true
      WHEN get_current_user_role() = 'AGENT' AND assigned_agent_id = auth.uid()::text THEN true
      ELSE false
    END
  );

CREATE POLICY "Clients and admins can create cases" ON public.case_intakes
  FOR INSERT TO authenticated WITH CHECK (
    get_current_user_role() IN ('CLIENT', 'ADMIN') AND 
    created_by = auth.uid()::text
  );

CREATE POLICY "Authorized users can update cases" ON public.case_intakes
  FOR UPDATE TO authenticated USING (
    CASE
      WHEN get_current_user_role() = 'ADMIN' THEN true
      WHEN get_current_user_role() = 'CLIENT' AND client_id = auth.uid()::text AND status = 'draft' THEN true
      WHEN get_current_user_role() = 'AGENT' AND assigned_agent_id = auth.uid()::text THEN true
      ELSE false
    END
  );

-- RLS Policies for case invoices (follow parent case access)
CREATE POLICY "Users can view case invoices based on case access" ON public.case_invoices
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.case_intakes c 
      WHERE c.id = case_id AND (
        CASE
          WHEN get_current_user_role() IN ('ADMIN', 'DPO') THEN true
          WHEN get_current_user_role() = 'CLIENT' AND c.client_id = auth.uid()::text THEN true
          WHEN get_current_user_role() = 'AGENT' AND c.assigned_agent_id = auth.uid()::text THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Authorized users can manage case invoices" ON public.case_invoices
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.case_intakes c 
      WHERE c.id = case_id AND (
        get_current_user_role() = 'ADMIN' OR
        (get_current_user_role() = 'CLIENT' AND c.client_id = auth.uid()::text AND c.status = 'draft')
      )
    )
  );

-- RLS Policies for case messages (participants only)
CREATE POLICY "Case participants can view messages" ON public.case_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.case_intakes c 
      WHERE c.id = case_id AND (
        CASE
          WHEN get_current_user_role() IN ('ADMIN', 'DPO') THEN true
          WHEN get_current_user_role() = 'CLIENT' AND c.client_id = auth.uid()::text THEN true
          WHEN get_current_user_role() = 'AGENT' AND c.assigned_agent_id = auth.uid()::text THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "Case participants can send messages" ON public.case_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.case_intakes c 
      WHERE c.id = case_id AND (
        CASE
          WHEN get_current_user_role() IN ('ADMIN', 'DPO') THEN true
          WHEN get_current_user_role() = 'CLIENT' AND c.client_id = auth.uid()::text THEN true
          WHEN get_current_user_role() = 'AGENT' AND c.assigned_agent_id = auth.uid()::text THEN true
          ELSE false
        END
      )
    )
  );

-- RLS Policies for audit events (read-only for participants, write for system)
CREATE POLICY "Case participants can view audit events" ON public.case_audit_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.case_intakes c 
      WHERE c.id = case_id AND (
        CASE
          WHEN get_current_user_role() IN ('ADMIN', 'DPO') THEN true
          WHEN get_current_user_role() = 'CLIENT' AND c.client_id = auth.uid()::text THEN true
          WHEN get_current_user_role() = 'AGENT' AND c.assigned_agent_id = auth.uid()::text THEN true
          ELSE false
        END
      )
    )
  );

CREATE POLICY "System can create audit events" ON public.case_audit_events
  FOR INSERT TO authenticated WITH CHECK (
    get_current_user_role() IN ('ADMIN', 'AGENT', 'CLIENT')
  );

-- Create function to update totals when invoices change
CREATE OR REPLACE FUNCTION public.update_case_totals()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers for updating case totals
CREATE TRIGGER update_case_totals_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON public.case_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_case_totals();

-- Create triggers for updated_at columns
CREATE TRIGGER update_service_levels_updated_at
  BEFORE UPDATE ON public.service_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debt_statuses_updated_at
  BEFORE UPDATE ON public.debt_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lawful_bases_updated_at
  BEFORE UPDATE ON public.lawful_bases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_intakes_updated_at
  BEFORE UPDATE ON public.case_intakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_invoices_updated_at
  BEFORE UPDATE ON public.case_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();