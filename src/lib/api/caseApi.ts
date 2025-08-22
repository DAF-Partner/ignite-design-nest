// Secure Case API with Privacy Protection
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/types';

// Interface matching the secure function return type
export interface SecureCase {
  id: string;
  reference: string;
  contract_id?: string;
  debtor_name: string;
  debtor_email?: string;
  debtor_phone?: string;
  debtor_address?: any;
  debtor_tax_id?: string;
  debtor_vat_id?: string;
  debtor_type?: string;
  debtor_country?: string;
  status: string;
  total_amount: number;
  total_vat?: number;
  total_penalties?: number;
  total_interest?: number;
  total_fees?: number;
  currency_code: string;
  client_id: string;
  assigned_agent_id?: string;
  created_by: string;
  service_level_id?: string;
  debt_status_id?: string;
  lawful_basis_id?: string;
  is_gdpr_subject?: boolean;
  notes?: string;
  review_notes?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
}

// Map database status values to frontend expected values
function mapDatabaseStatusToFrontend(dbStatus: string): string {
  const statusMapping: Record<string, string> = {
    'draft': 'new',
    'submitted': 'in_progress',
    'under_review': 'in_progress', 
    'accepted': 'awaiting_approval',
    'needs_info': 'in_progress',
    'rejected': 'closed'
  };
  
  return statusMapping[dbStatus] || dbStatus;
}

// Transform secure case data to application format
function transformSecureCaseToCase(secureCase: SecureCase): Case {
  return {
    id: secureCase.id,
    reference: secureCase.reference,
    clientId: secureCase.client_id,
    clientName: 'Client', // This would need to be resolved from clientId
    assignedAgentId: secureCase.assigned_agent_id,
    assignedAgentName: undefined, // This would need to be resolved from assignedAgentId
    debtor: {
      name: secureCase.debtor_name,
      email: secureCase.debtor_email || '',
      phone: secureCase.debtor_phone,
      address: secureCase.debtor_address || {
        street: '',
        city: '',
        postalCode: '',
        country: secureCase.debtor_country || ''
      }
    },
    amount: secureCase.total_amount,
    currency: secureCase.currency_code,
    status: mapDatabaseStatusToFrontend(secureCase.status) as any,
    description: secureCase.notes,
    originalCreditor: undefined, // This would need to be added to the database
    createdAt: secureCase.created_at,
    updatedAt: secureCase.updated_at
  };
}

export const caseApi = {
  // Get a single case with privacy protection
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const { data, error } = await supabase.rpc('get_case_with_privacy_protection', {
        case_id_param: caseId
      });

      if (error) {
        console.error('Error fetching case:', error);
        throw new Error(`Failed to fetch case: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      return transformSecureCaseToCase(data[0]);
    } catch (error) {
      console.error('Error in getCase:', error);
      throw error;
    }
  },

  // Get all cases with privacy protection (for listing)
  async getCases(): Promise<Case[]> {
    try {
      // For now, we'll use the direct table query with RLS
      // In production, you might want to create a similar function for listing
      const { data, error } = await supabase
        .from('case_intakes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cases:', error);
        throw new Error(`Failed to fetch cases: ${error.message}`);
      }

      return data?.map((caseData: any) => ({
        id: caseData.id,
        reference: caseData.reference,
        clientId: caseData.client_id,
        clientName: 'Client', // This would need to be resolved
        assignedAgentId: caseData.assigned_agent_id,
        assignedAgentName: undefined, // This would need to be resolved
        debtor: {
          name: caseData.debtor_name,
          email: caseData.debtor_email || '',
          phone: caseData.debtor_phone,
          address: caseData.debtor_address || {
            street: '',
            city: '',
            postalCode: '',
            country: caseData.debtor_country || ''
          }
        },
        amount: caseData.total_amount,
        currency: caseData.currency_code,
        status: mapDatabaseStatusToFrontend(caseData.status) as any,
        description: caseData.notes,
        originalCreditor: undefined, // This would need to be added
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getCases:', error);
      throw error;
    }
  }
};