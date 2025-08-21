// API Interface definitions for backend-agnostic architecture
import type {
  Case,
  User,
  Approval,
  Invoice,
  GdprRequest,
  Tariff,
  MessageTemplate,
  CreateCaseRequest,
  CaseFilters,
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

// Base API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

// Authentication API Interface
export interface IAuthApi {
  login(email: string, password: string): Promise<ApiResponse<AuthTokens>>;
  logout(): Promise<void>;
  refreshToken(): Promise<ApiResponse<AuthTokens>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  isAuthenticated(): boolean;
}

// Cases API Interface
export interface ICasesApi {
  getCases(params?: {
    status?: string[];
    clientId?: string;
    assignedAgentId?: string;
    amountMin?: number;
    amountMax?: number;
    search?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Case>>;
  
  getCase(id: string): Promise<ApiResponse<Case>>;
  
  createCase(data: CreateCaseRequest): Promise<ApiResponse<Case>>;
  
  updateCase(id: string, data: Partial<Case>): Promise<ApiResponse<Case>>;
  
  deleteCase(id: string): Promise<ApiResponse<void>>;
  
  assignAgent(caseId: string, agentId: string): Promise<ApiResponse<Case>>;
  
  getCaseEvents(caseId: string): Promise<ApiResponse<any[]>>;
}

// Approvals API Interface
export interface IApprovalsApi {
  getApprovals(params?: {
    state?: string[];
    type?: string;
    caseId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Approval>>;
  
  getApproval(id: string): Promise<ApiResponse<Approval>>;
  
  createApproval(data: {
    caseId: string;
    type: string;
    amount?: number;
    currency?: string;
    description: string;
    clauseId?: string;
  }): Promise<ApiResponse<Approval>>;
  
  updateApproval(id: string, data: {
    state: 'approved' | 'rejected';
    decisionNotes?: string;
  }): Promise<ApiResponse<Approval>>;
  
  getPendingApprovals(): Promise<ApiResponse<Approval[]>>;
}

// Invoices API Interface
export interface IInvoicesApi {
  getInvoices(params?: {
    status?: string[];
    clientId?: string;
    caseId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Invoice>>;
  
  getInvoice(id: string): Promise<ApiResponse<Invoice>>;
  
  createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>>;
  
  updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>>;
  
  deleteInvoice(id: string): Promise<ApiResponse<void>>;
  
  sendInvoice(id: string): Promise<ApiResponse<void>>;
  
  markAsPaid(id: string, paidAt?: string): Promise<ApiResponse<Invoice>>;
  
  generatePdf(id: string): Promise<ApiResponse<{ pdfUrl: string }>>;
}

// GDPR API Interface
export interface IGdprApi {
  getRequests(params?: {
    type?: string[];
    status?: string[];
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<GdprRequest>>;
  
  getRequest(id: string): Promise<ApiResponse<GdprRequest>>;
  
  createRequest(data: {
    type: string;
    dataSubject: string;
    description: string;
  }): Promise<ApiResponse<GdprRequest>>;
  
  updateRequest(id: string, data: Partial<GdprRequest>): Promise<ApiResponse<GdprRequest>>;
  
  exportData(subjectId: string): Promise<ApiResponse<{ downloadUrl: string }>>;
  
  deleteData(subjectId: string, reason?: string): Promise<ApiResponse<void>>;
  
  processRequest(id: string): Promise<ApiResponse<GdprRequest>>;
}

// Users API Interface
export interface IUsersApi {
  getUsers(params?: {
    role?: string[];
    isActive?: boolean;
    clientId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<User>>;
  
  getUser(id: string): Promise<ApiResponse<User>>;
  
  createUser(data: Partial<User>): Promise<ApiResponse<User>>;
  
  updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
  
  deleteUser(id: string): Promise<ApiResponse<void>>;
  
  updateUserRole(id: string, role: string): Promise<ApiResponse<User>>;
  
  activateUser(id: string): Promise<ApiResponse<User>>;
  
  deactivateUser(id: string): Promise<ApiResponse<User>>;
}

// Tariffs API Interface
export interface ITariffsApi {
  getTariffs(params?: {
    isActive?: boolean;
    type?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Tariff>>;
  
  getTariff(id: string): Promise<ApiResponse<Tariff>>;
  
  createTariff(data: Partial<Tariff>): Promise<ApiResponse<Tariff>>;
  
  updateTariff(id: string, data: Partial<Tariff>): Promise<ApiResponse<Tariff>>;
  
  deleteTariff(id: string): Promise<ApiResponse<void>>;
  
  activateTariff(id: string): Promise<ApiResponse<Tariff>>;
  
  deactivateTariff(id: string): Promise<ApiResponse<Tariff>>;
}

// Templates API Interface
export interface ITemplatesApi {
  getTemplates(params?: {
    type?: string;
    locale?: string;
    isActive?: boolean;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<MessageTemplate>>;
  
  getTemplate(id: string): Promise<ApiResponse<MessageTemplate>>;
  
  createTemplate(data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>>;
  
  updateTemplate(id: string, data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>>;
  
  deleteTemplate(id: string): Promise<ApiResponse<void>>;
  
  activateTemplate(id: string): Promise<ApiResponse<MessageTemplate>>;
  
  deactivateTemplate(id: string): Promise<ApiResponse<MessageTemplate>>;
  
  renderTemplate(id: string, variables: Record<string, any>): Promise<ApiResponse<{ content: string }>>;
}

// Retention API Interface  
export interface IRetentionApi {
  getRetentionPolicies(): Promise<ApiResponse<any[]>>;
  
  updateRetentionPolicy(id: string, data: any): Promise<ApiResponse<any>>;
  
  scheduleDataDeletion(entityId: string, entityType: string, deleteAfter: string): Promise<ApiResponse<void>>;
  
  cancelDataDeletion(entityId: string): Promise<ApiResponse<void>>;
  
  getPendingDeletions(): Promise<ApiResponse<any[]>>;
}

// Case Intakes API Interface
export interface ICaseIntakesApi {
  getCaseIntakes(params?: {
    status?: string[];
    clientId?: string;
    assignedAgentId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<CaseIntake>>;
  
  getCaseIntake(id: string): Promise<ApiResponse<CaseIntake>>;
  
  createCaseIntake(data: CreateCaseIntakeRequest): Promise<ApiResponse<CaseIntake>>;
  
  updateCaseIntake(id: string, data: Partial<CaseIntake>): Promise<ApiResponse<CaseIntake>>;
  
  deleteCaseIntake(id: string): Promise<ApiResponse<void>>;
  
  submitForReview(id: string): Promise<ApiResponse<CaseIntake>>;
  
  reviewCaseIntake(id: string, review: AcceptanceReview): Promise<ApiResponse<CaseIntake>>;
  
  getCaseIntakeMessages(caseId: string): Promise<ApiResponse<any[]>>;
  
  addCaseIntakeMessage(caseId: string, message: any): Promise<ApiResponse<any>>;
}

// Admin Configuration API Interface
export interface IAdminConfigApi {
  // Service Levels
  getServiceLevels(): Promise<ApiResponse<ServiceLevel[]>>;
  createServiceLevel(data: Partial<ServiceLevel>): Promise<ApiResponse<ServiceLevel>>;
  updateServiceLevel(id: string, data: Partial<ServiceLevel>): Promise<ApiResponse<ServiceLevel>>;
  deleteServiceLevel(id: string): Promise<ApiResponse<void>>;
  
  // Debt Statuses
  getDebtStatuses(): Promise<ApiResponse<DebtStatus[]>>;
  createDebtStatus(data: Partial<DebtStatus>): Promise<ApiResponse<DebtStatus>>;
  updateDebtStatus(id: string, data: Partial<DebtStatus>): Promise<ApiResponse<DebtStatus>>;
  deleteDebtStatus(id: string): Promise<ApiResponse<void>>;
  
  // Lawful Bases
  getLawfulBases(): Promise<ApiResponse<LawfulBasis[]>>;
  createLawfulBasis(data: Partial<LawfulBasis>): Promise<ApiResponse<LawfulBasis>>;
  updateLawfulBasis(id: string, data: Partial<LawfulBasis>): Promise<ApiResponse<LawfulBasis>>;
  deleteLawfulBasis(id: string): Promise<ApiResponse<void>>;
}

// Analytics API Interface
export interface IAnalyticsApi {
  getDashboardStats(params?: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
  }): Promise<ApiResponse<DashboardStats>>;
  
  getCaseMetrics(params?: {
    period?: string;
    groupBy?: string;
  }): Promise<ApiResponse<any>>;
  
  getRecoveryMetrics(params?: {
    period?: string;
    currency?: string;
  }): Promise<ApiResponse<any>>;
  
  getPerformanceMetrics(params?: {
    agentId?: string;
    period?: string;
  }): Promise<ApiResponse<any>>;
}

// Main API Client Interface
export interface IApiClient {
  auth: IAuthApi;
  cases: ICasesApi;
  caseIntakes: ICaseIntakesApi;
  approvals: IApprovalsApi;
  invoices: IInvoicesApi;
  gdpr: IGdprApi;
  users: IUsersApi;
  tariffs: ITariffsApi;
  templates: ITemplatesApi;
  retention: IRetentionApi;
  analytics: IAnalyticsApi;
  adminConfig: IAdminConfigApi;
  
  // Client configuration
  setBaseUrl(url: string): void;
  setTimeout(timeout: number): void;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}

// Error types - moved to separate exports
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}