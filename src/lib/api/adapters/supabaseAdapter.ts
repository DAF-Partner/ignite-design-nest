// Supabase adapter implementation for API interfaces
import { supabase } from '@/integrations/supabase/client';
import {
  type IApiClient,
  type IAuthApi,
  type ICasesApi,
  type ICaseIntakesApi,
  type IAdminConfigApi,
  type IApprovalsApi,
  type IInvoicesApi,
  type IGdprApi,
  type IUsersApi,
  type ITariffsApi,
  type ITemplatesApi,
  type IRetentionApi,
  type IAnalyticsApi,
  ApiError,
  NetworkError
} from '../interfaces';
import type {
  Case,
  User,
  Approval,
  Invoice,
  GdprRequest,
  Tariff,
  MessageTemplate,
  CreateCaseRequest,
  PaginatedResponse,
  ApiResponse,
  AuthTokens,
  DashboardStats,
  CaseIntake,
  CreateCaseIntakeRequest,
  AcceptanceReview,
  ServiceLevel,
  DebtStatus,
  LawfulBasis
} from '@/types';

// Helper function to transform Supabase response to API response
function transformResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true
  };
}

// Helper function to transform Supabase paginated response
function transformPaginatedResponse<T>(
  data: T[],
  count: number | null,
  cursor?: string
): PaginatedResponse<T> {
  return {
    data,
    total: count || data.length,
    hasNext: cursor ? true : false,
    nextCursor: cursor
  };
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any): never {
  if (error?.code === 'PGRST116') {
    throw new ApiError(404, 'Resource not found');
  }
  if (error?.code?.startsWith('PGRST')) {
    throw new ApiError(400, error.message || 'Database error');
  }
  if (error?.message?.includes('network')) {
    throw new NetworkError('Network connection failed', error);
  }
  throw new ApiError(500, error?.message || 'Unknown error occurred');
}

// Helper function to transform database case intake to TypeScript type
function transformCaseIntakeFromDb(dbRecord: any): CaseIntake {
  return {
    id: dbRecord.id,
    clientId: dbRecord.client_id,
    createdBy: dbRecord.created_by,
    reference: dbRecord.reference,
    debtorName: dbRecord.debtor_name,
    debtorType: dbRecord.debtor_type || 'individual',
    debtorEmail: dbRecord.debtor_email,
    debtorPhone: dbRecord.debtor_phone,
    debtorAddress: dbRecord.debtor_address,
    debtorVatId: dbRecord.debtor_vat_id,
    debtorTaxId: dbRecord.debtor_tax_id,
    debtorCountry: dbRecord.debtor_country,
    currencyCode: dbRecord.currency_code,
    totalAmount: parseFloat(dbRecord.total_amount) || 0,
    totalVat: parseFloat(dbRecord.total_vat) || 0,
    totalPenalties: parseFloat(dbRecord.total_penalties) || 0,
    totalInterest: parseFloat(dbRecord.total_interest) || 0,
    totalFees: parseFloat(dbRecord.total_fees) || 0,
    contractId: dbRecord.contract_id,
    serviceLevelId: dbRecord.service_level_id,
    debtStatusId: dbRecord.debt_status_id,
    lawfulBasisId: dbRecord.lawful_basis_id,
    isGdprSubject: dbRecord.is_gdpr_subject,
    notes: dbRecord.notes,
    status: dbRecord.status,
    assignedAgentId: dbRecord.assigned_agent_id,
    submittedAt: dbRecord.submitted_at,
    reviewedAt: dbRecord.reviewed_at,
    reviewedBy: dbRecord.reviewed_by,
    reviewNotes: dbRecord.review_notes,
    rejectionReason: dbRecord.rejection_reason,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    invoices: dbRecord.case_invoices || [],
    messages: dbRecord.case_messages || []
  };
}

// Helper function to transform database service level to TypeScript type
function transformServiceLevelFromDb(dbRecord: any): ServiceLevel {
  return {
    id: dbRecord.id,
    code: dbRecord.code,
    name: dbRecord.name,
    description: dbRecord.description,
    slaHours: dbRecord.sla_hours,
    isActive: dbRecord.is_active,
    isSystemDefault: dbRecord.is_system_default,
    tenantId: dbRecord.tenant_id,
    createdBy: dbRecord.created_by,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at
  };
}

// Helper function to transform database debt status to TypeScript type
function transformDebtStatusFromDb(dbRecord: any): DebtStatus {
  return {
    id: dbRecord.id,
    code: dbRecord.code,
    name: dbRecord.name,
    description: dbRecord.description,
    isActive: dbRecord.is_active,
    isSystemDefault: dbRecord.is_system_default,
    tenantId: dbRecord.tenant_id,
    createdBy: dbRecord.created_by,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at
  };
}

// Helper function to transform database lawful basis to TypeScript type
function transformLawfulBasisFromDb(dbRecord: any): LawfulBasis {
  return {
    id: dbRecord.id,
    code: dbRecord.code,
    name: dbRecord.name,
    description: dbRecord.description,
    articleReference: dbRecord.article_reference,
    isActive: dbRecord.is_active,
    isSystemDefault: dbRecord.is_system_default,
    tenantId: dbRecord.tenant_id,
    createdBy: dbRecord.created_by,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at
  };
}

// Auth API Implementation
class SupabaseAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (!data.user || !data.session) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // For now, use basic user data (profiles table doesn't exist yet)
      const profile = null;

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.name || data.user.user_metadata?.name || '',
        role: profile?.role || 'CLIENT',
        clientId: profile?.client_id,
        department: profile?.department,
        phone: profile?.phone,
        isActive: profile?.is_active ?? true,
        permissions: profile?.permissions || [],
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at,
        lastLoginAt: new Date().toISOString()
      };

      const tokens: AuthTokens = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token || '',
        expires_in: data.session.expires_in || 3600,
        user
      };

      return transformResponse(tokens);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (!data.session || !data.user) {
        throw new ApiError(401, 'Session refresh failed');
      }

      // For now, use basic user data (profiles table doesn't exist yet)
      const profile = null;

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.name || '',
        role: profile?.role || 'CLIENT',
        clientId: profile?.client_id,
        department: profile?.department,
        phone: profile?.phone,
        isActive: profile?.is_active ?? true,
        permissions: profile?.permissions || [],
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at
      };

      const tokens: AuthTokens = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token || '',
        expires_in: data.session.expires_in || 3600,
        user
      };

      return transformResponse(tokens);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) {
        throw new ApiError(401, 'Not authenticated');
      }

      // For now, use basic user data (profiles table doesn't exist yet)
      const profile = null;

      const userData: User = {
        id: user.id,
        email: user.email!,
        name: profile?.name || '',
        role: profile?.role || 'CLIENT',
        clientId: profile?.client_id,
        department: profile?.department,
        phone: profile?.phone,
        isActive: profile?.is_active ?? true,
        permissions: profile?.permissions || [],
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      return transformResponse(userData);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  isAuthenticated(): boolean {
    const session = supabase.auth.getSession();
    return !!session;
  }
}

// Cases API Implementation (Mock until database is set up)
class SupabaseCasesApi implements ICasesApi {
  async getCases(): Promise<PaginatedResponse<Case>> {
    return transformPaginatedResponse([], 0);
  }

  async getCase(): Promise<ApiResponse<Case>> {
    throw new ApiError(501, 'Cases not implemented - database tables pending');
  }

  async createCase(): Promise<ApiResponse<Case>> {
    throw new ApiError(501, 'Cases not implemented - database tables pending');
  }

  async updateCase(): Promise<ApiResponse<Case>> {
    throw new ApiError(501, 'Cases not implemented - database tables pending');
  }

  async deleteCase(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Cases not implemented - database tables pending');
  }

  async assignAgent(): Promise<ApiResponse<Case>> {
    throw new ApiError(501, 'Cases not implemented - database tables pending');
  }

  async getCaseEvents(): Promise<ApiResponse<any[]>> {
    return transformResponse([]);
  }
}

// Case Intakes API Implementation
class SupabaseCaseIntakesApi implements ICaseIntakesApi {
  async getCaseIntakes(params?: {
    status?: string[];
    clientId?: string;
    assignedAgentId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<CaseIntake>> {
    try {
      let query = supabase
        .from('case_intakes')
        .select('*, case_invoices(*), case_messages(*)', { count: 'exact' });

      if (params?.status) {
        query = query.in('status', params.status);
      }
      if (params?.clientId) {
        query = query.eq('client_id', params.clientId);
      }
      if (params?.assignedAgentId) {
        query = query.eq('assigned_agent_id', params.assignedAgentId);
      }

      const limit = params?.limit || 50;
      query = query.limit(limit);

      if (params?.cursor) {
        query = query.gt('created_at', params.cursor);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return transformPaginatedResponse(
        (data || []).map(transformCaseIntakeFromDb), 
        count
      );
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async getCaseIntake(id: string): Promise<ApiResponse<CaseIntake>> {
    try {
      const { data, error } = await supabase
        .from('case_intakes')
        .select('*, case_invoices(*), case_messages(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return transformResponse(transformCaseIntakeFromDb(data));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async createCaseIntake(data: CreateCaseIntakeRequest): Promise<ApiResponse<CaseIntake>> {
    try {
      const { data: caseIntake, error } = await supabase
        .from('case_intakes')
        .insert({
          client_id: data.clientId,
          created_by: data.createdBy,
          reference: data.reference,
          debtor_name: data.debtorName,
          debtor_type: data.debtorType,
          debtor_email: data.debtorEmail,
          debtor_phone: data.debtorPhone,
          debtor_address: data.debtorAddress,
          debtor_vat_id: data.debtorVatId,
          debtor_tax_id: data.debtorTaxId,
          debtor_country: data.debtorCountry,
          currency_code: data.currencyCode,
          total_amount: data.totalAmount,
          contract_id: data.contractId,
          service_level_id: data.serviceLevelId,
          debt_status_id: data.debtStatusId,
          lawful_basis_id: data.lawfulBasisId,
          is_gdpr_subject: data.isGdprSubject,
          notes: data.notes
        })
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformCaseIntakeFromDb(caseIntake));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async updateCaseIntake(id: string, data: Partial<CaseIntake>): Promise<ApiResponse<CaseIntake>> {
    try {
      const { data: updated, error } = await supabase
        .from('case_intakes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformCaseIntakeFromDb(updated));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async deleteCaseIntake(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('case_intakes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return transformResponse(undefined);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async submitForReview(id: string): Promise<ApiResponse<CaseIntake>> {
    try {
      const { data, error } = await supabase
        .from('case_intakes')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformCaseIntakeFromDb(data));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async reviewCaseIntake(id: string, review: AcceptanceReview): Promise<ApiResponse<CaseIntake>> {
    try {
      const { data, error } = await supabase
        .from('case_intakes')
        .update({
          status: review.action === 'accept' ? 'accepted' : review.action === 'reject' ? 'rejected' : 'needs_info',
          reviewed_at: new Date().toISOString(),
          reviewed_by: review.reviewedBy,
          review_notes: review.reviewNotes || review.notes,
          rejection_reason: review.action === 'reject' ? review.rejectionReason : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformCaseIntakeFromDb(data));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async getCaseIntakeMessages(caseId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('case_messages')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return transformResponse(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async addCaseIntakeMessage(caseId: string, message: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('case_messages')
        .insert({
          case_id: caseId,
          sender_id: message.senderId,
          sender_name: message.senderName,
          content: message.content,
          message_type: message.messageType || 'user',
          is_internal: message.isInternal || false,
          mentions: message.mentions || []
        })
        .select()
        .single();

      if (error) throw error;

      return transformResponse(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

// Admin Configuration API Implementation
class SupabaseAdminConfigApi implements IAdminConfigApi {
  // Service Levels
  async getServiceLevels(): Promise<ApiResponse<ServiceLevel[]>> {
    try {
      const { data, error } = await supabase
        .from('service_levels')
        .select('*')
        .order('name');

      if (error) throw error;

      return transformResponse((data || []).map(transformServiceLevelFromDb));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async createServiceLevel(data: Partial<ServiceLevel>): Promise<ApiResponse<ServiceLevel>> {
    try {
      const { data: created, error } = await supabase
        .from('service_levels')
        .insert({
          code: data.code!,
          name: data.name!,
          description: data.description,
          sla_hours: data.slaHours,
          is_active: data.isActive,
          is_system_default: data.isSystemDefault,
          tenant_id: data.tenantId,
          created_by: data.createdBy
        })
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformServiceLevelFromDb(created));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async updateServiceLevel(id: string, data: Partial<ServiceLevel>): Promise<ApiResponse<ServiceLevel>> {
    try {
      const updateData: any = {};
      if (data.code !== undefined) updateData.code = data.code;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.slaHours !== undefined) updateData.sla_hours = data.slaHours;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.isSystemDefault !== undefined) updateData.is_system_default = data.isSystemDefault;

      const { data: updated, error } = await supabase
        .from('service_levels')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformServiceLevelFromDb(updated));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async deleteServiceLevel(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('service_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return transformResponse(undefined);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Debt Statuses
  async getDebtStatuses(): Promise<ApiResponse<DebtStatus[]>> {
    try {
      const { data, error } = await supabase
        .from('debt_statuses')
        .select('*')
        .order('name');

      if (error) throw error;

      return transformResponse((data || []).map(transformDebtStatusFromDb));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async createDebtStatus(data: Partial<DebtStatus>): Promise<ApiResponse<DebtStatus>> {
    try {
      const { data: created, error } = await supabase
        .from('debt_statuses')
        .insert({
          code: data.code!,
          name: data.name!,
          description: data.description,
          is_active: data.isActive,
          is_system_default: data.isSystemDefault,
          tenant_id: data.tenantId,
          created_by: data.createdBy
        })
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformDebtStatusFromDb(created));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async updateDebtStatus(id: string, data: Partial<DebtStatus>): Promise<ApiResponse<DebtStatus>> {
    try {
      const updateData: any = {};
      if (data.code !== undefined) updateData.code = data.code;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.isSystemDefault !== undefined) updateData.is_system_default = data.isSystemDefault;

      const { data: updated, error } = await supabase
        .from('debt_statuses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformDebtStatusFromDb(updated));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async deleteDebtStatus(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('debt_statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return transformResponse(undefined);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Lawful Bases
  async getLawfulBases(): Promise<ApiResponse<LawfulBasis[]>> {
    try {
      const { data, error } = await supabase
        .from('lawful_bases')
        .select('*')
        .order('name');

      if (error) throw error;

      return transformResponse((data || []).map(transformLawfulBasisFromDb));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async createLawfulBasis(data: Partial<LawfulBasis>): Promise<ApiResponse<LawfulBasis>> {
    try {
      const { data: created, error } = await supabase
        .from('lawful_bases')
        .insert({
          code: data.code!,
          name: data.name!,
          description: data.description,
          article_reference: data.articleReference,
          is_active: data.isActive,
          is_system_default: data.isSystemDefault,
          tenant_id: data.tenantId,
          created_by: data.createdBy
        })
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformLawfulBasisFromDb(created));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async updateLawfulBasis(id: string, data: Partial<LawfulBasis>): Promise<ApiResponse<LawfulBasis>> {
    try {
      const updateData: any = {};
      if (data.code !== undefined) updateData.code = data.code;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.articleReference !== undefined) updateData.article_reference = data.articleReference;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.isSystemDefault !== undefined) updateData.is_system_default = data.isSystemDefault;

      const { data: updated, error } = await supabase
        .from('lawful_bases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return transformResponse(transformLawfulBasisFromDb(updated));
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  async deleteLawfulBasis(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('lawful_bases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return transformResponse(undefined);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

// Placeholder implementations for other APIs
class SupabaseApprovalsApi implements IApprovalsApi {
  async getApprovals(): Promise<PaginatedResponse<Approval>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getApproval(): Promise<ApiResponse<Approval>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createApproval(): Promise<ApiResponse<Approval>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateApproval(): Promise<ApiResponse<Approval>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async getPendingApprovals(): Promise<ApiResponse<Approval[]>> {
    return transformResponse([]);
  }
}

class SupabaseInvoicesApi implements IInvoicesApi {
  async getInvoices(): Promise<PaginatedResponse<Invoice>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getInvoice(): Promise<ApiResponse<Invoice>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createInvoice(): Promise<ApiResponse<Invoice>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateInvoice(): Promise<ApiResponse<Invoice>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deleteInvoice(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async sendInvoice(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async markAsPaid(): Promise<ApiResponse<Invoice>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async generatePdf(): Promise<ApiResponse<{ pdfUrl: string }>> {
    throw new ApiError(501, 'Not implemented');
  }
}

class SupabaseGdprApi implements IGdprApi {
  async getRequests(): Promise<PaginatedResponse<GdprRequest>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getRequest(): Promise<ApiResponse<GdprRequest>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createRequest(): Promise<ApiResponse<GdprRequest>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateRequest(): Promise<ApiResponse<GdprRequest>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async exportData(): Promise<ApiResponse<{ downloadUrl: string }>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deleteData(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async processRequest(): Promise<ApiResponse<GdprRequest>> {
    throw new ApiError(501, 'Not implemented');
  }
}

class SupabaseUsersApi implements IUsersApi {
  async getUsers(): Promise<PaginatedResponse<User>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getUser(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createUser(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateUser(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deleteUser(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateUserRole(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async activateUser(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deactivateUser(): Promise<ApiResponse<User>> {
    throw new ApiError(501, 'Not implemented');
  }
}

class SupbaseTariffsApi implements ITariffsApi {
  async getTariffs(): Promise<PaginatedResponse<Tariff>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getTariff(): Promise<ApiResponse<Tariff>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createTariff(): Promise<ApiResponse<Tariff>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateTariff(): Promise<ApiResponse<Tariff>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deleteTariff(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async activateTariff(): Promise<ApiResponse<Tariff>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deactivateTariff(): Promise<ApiResponse<Tariff>> {
    throw new ApiError(501, 'Not implemented');
  }
}

class SupabaseTemplatesApi implements ITemplatesApi {
  async getTemplates(): Promise<PaginatedResponse<MessageTemplate>> {
    return transformPaginatedResponse([], 0);
  }
  
  async getTemplate(): Promise<ApiResponse<MessageTemplate>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async createTemplate(): Promise<ApiResponse<MessageTemplate>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async updateTemplate(): Promise<ApiResponse<MessageTemplate>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deleteTemplate(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async activateTemplate(): Promise<ApiResponse<MessageTemplate>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async deactivateTemplate(): Promise<ApiResponse<MessageTemplate>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async renderTemplate(): Promise<ApiResponse<{ content: string }>> {
    throw new ApiError(501, 'Not implemented');
  }
}

class SupabaseRetentionApi implements IRetentionApi {
  async getRetentionPolicies(): Promise<ApiResponse<any[]>> {
    return transformResponse([]);
  }
  
  async updateRetentionPolicy(): Promise<ApiResponse<any>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async scheduleDataDeletion(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async cancelDataDeletion(): Promise<ApiResponse<void>> {
    throw new ApiError(501, 'Not implemented');
  }
  
  async getPendingDeletions(): Promise<ApiResponse<any[]>> {
    return transformResponse([]);
  }
}

class SupabaseAnalyticsApi implements IAnalyticsApi {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    // Mock dashboard stats for now
    const stats: DashboardStats = {
      totalCases: 0,
      activeCases: 0,
      pendingApprovals: 0,
      overdueInvoices: 0,
      totalRecovered: 0,
      monthlyRecovered: 0,
      averageRecoveryTime: 0,
      successRate: 0
    };
    return transformResponse(stats);
  }
  
  async getCaseMetrics(): Promise<ApiResponse<any>> {
    return transformResponse({});
  }
  
  async getRecoveryMetrics(): Promise<ApiResponse<any>> {
    return transformResponse({});
  }
  
  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return transformResponse({});
  }
}

// Main Supabase API Client
export class SupabaseApiClient implements IApiClient {
  public auth: IAuthApi;
  public cases: ICasesApi;
  public caseIntakes: ICaseIntakesApi;
  public approvals: IApprovalsApi;
  public invoices: IInvoicesApi;
  public gdpr: IGdprApi;
  public users: IUsersApi;
  public tariffs: ITariffsApi;
  public templates: ITemplatesApi;
  public retention: IRetentionApi;
  public analytics: IAnalyticsApi;
  public adminConfig: IAdminConfigApi;

  constructor() {
    this.auth = new SupabaseAuthApi();
    this.cases = new SupabaseCasesApi();
    this.caseIntakes = new SupabaseCaseIntakesApi();
    this.approvals = new SupabaseApprovalsApi();
    this.invoices = new SupabaseInvoicesApi();
    this.gdpr = new SupabaseGdprApi();
    this.users = new SupabaseUsersApi();
    this.tariffs = new SupbaseTariffsApi();
    this.templates = new SupabaseTemplatesApi();
    this.retention = new SupabaseRetentionApi();
    this.analytics = new SupabaseAnalyticsApi();
    this.adminConfig = new SupabaseAdminConfigApi();
  }

  setBaseUrl(url: string): void {
    // Supabase URL is set via environment variables
    console.warn('Supabase URL cannot be changed at runtime');
  }

  setTimeout(timeout: number): void {
    // Supabase timeout configuration would go here
    console.warn('Supabase timeout configuration not implemented');
  }

  setAuthToken(token: string): void {
    // Supabase handles auth tokens automatically
    console.warn('Supabase auth token is managed automatically');
  }

  clearAuthToken(): void {
    // Supabase handles auth token clearing automatically
    console.warn('Supabase auth token is managed automatically');
  }
}