// .NET API adapter implementation for API interfaces
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  type IApiClient,
  type IAuthApi,
  type ICasesApi,
  type IApprovalsApi,
  type IInvoicesApi,
  type IGdprApi,
  type IUsersApi,
  type ITariffsApi,
  type ITemplatesApi,
  type IRetentionApi,
  type IAnalyticsApi,
  type ApiConfig,
  ApiError,
  NetworkError,
  ValidationError
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
  DashboardStats
} from '@/types';

// Helper function to handle HTTP errors
function handleHttpError(error: any): never {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400 && data?.errors) {
      throw new ValidationError(data.title || 'Validation failed', data.errors);
    }
    
    throw new ApiError(
      status,
      data?.title || data?.message || 'HTTP Error',
      data
    );
  }
  
  if (error.request) {
    throw new NetworkError('Network error - no response received', error);
  }
  
  throw new NetworkError('Request configuration error', error);
}

// Base HTTP client configuration
class HttpClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        handleHttpError(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  setBaseUrl(url: string): void {
    this.client.defaults.baseURL = url;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }
}

// Auth API Implementation
class DotNetAuthApi implements IAuthApi {
  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.http.post<ApiResponse<AuthTokens>>('/auth/login', {
        email,
        password
      });
      
      // Store the auth token for future requests
      if (response.data.access_token) {
        this.http.setAuthToken(response.data.access_token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout');
      this.http.clearAuthToken();
    } catch (error) {
      // Clear token even if logout fails
      this.http.clearAuthToken();
      throw error;
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await this.http.post<ApiResponse<AuthTokens>>('/auth/refresh');
      
      if (response.data.access_token) {
        this.http.setAuthToken(response.data.access_token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>('/auth/me');
  }

  isAuthenticated(): boolean {
    return !!this.http['authToken'];
  }
}

// Cases API Implementation
class DotNetCasesApi implements ICasesApi {
  constructor(private http: HttpClient) {}

  async getCases(params?: {
    status?: string[];
    clientId?: string;
    assignedAgentId?: string;
    amountMin?: number;
    amountMax?: number;
    search?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Case>> {
    return this.http.get<PaginatedResponse<Case>>('/cases', params);
  }

  async getCase(id: string): Promise<ApiResponse<Case>> {
    return this.http.get<ApiResponse<Case>>(`/cases/${id}`);
  }

  async createCase(data: CreateCaseRequest): Promise<ApiResponse<Case>> {
    return this.http.post<ApiResponse<Case>>('/cases', data);
  }

  async updateCase(id: string, data: Partial<Case>): Promise<ApiResponse<Case>> {
    return this.http.patch<ApiResponse<Case>>(`/cases/${id}`, data);
  }

  async deleteCase(id: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/cases/${id}`);
  }

  async assignAgent(caseId: string, agentId: string): Promise<ApiResponse<Case>> {
    return this.http.patch<ApiResponse<Case>>(`/cases/${caseId}`, {
      assignedAgentId: agentId
    });
  }

  async getCaseEvents(caseId: string): Promise<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`/cases/${caseId}/events`);
  }
}

// Approvals API Implementation
class DotNetApprovalsApi implements IApprovalsApi {
  constructor(private http: HttpClient) {}

  async getApprovals(params?: {
    state?: string[];
    type?: string;
    caseId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Approval>> {
    return this.http.get<PaginatedResponse<Approval>>('/approvals', params);
  }

  async getApproval(id: string): Promise<ApiResponse<Approval>> {
    return this.http.get<ApiResponse<Approval>>(`/approvals/${id}`);
  }

  async createApproval(data: {
    caseId: string;
    type: string;
    amount?: number;
    currency?: string;
    description: string;
    clauseId?: string;
  }): Promise<ApiResponse<Approval>> {
    return this.http.post<ApiResponse<Approval>>('/approvals', data);
  }

  async updateApproval(id: string, data: {
    state: 'approved' | 'rejected';
    decisionNotes?: string;
  }): Promise<ApiResponse<Approval>> {
    return this.http.patch<ApiResponse<Approval>>(`/approvals/${id}`, data);
  }

  async getPendingApprovals(): Promise<ApiResponse<Approval[]>> {
    return this.http.get<ApiResponse<Approval[]>>('/approvals/pending');
  }
}

// Invoices API Implementation  
class DotNetInvoicesApi implements IInvoicesApi {
  constructor(private http: HttpClient) {}

  async getInvoices(params?: {
    status?: string[];
    clientId?: string;
    caseId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Invoice>> {
    return this.http.get<PaginatedResponse<Invoice>>('/invoices', params);
  }

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  }

  async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>('/invoices', data);
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/invoices/${id}`);
  }

  async sendInvoice(id: string): Promise<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`/invoices/${id}/send`);
  }

  async markAsPaid(id: string, paidAt?: string): Promise<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`/invoices/${id}/mark-paid`, {
      paidAt: paidAt || new Date().toISOString()
    });
  }

  async generatePdf(id: string): Promise<ApiResponse<{ pdfUrl: string }>> {
    return this.http.post<ApiResponse<{ pdfUrl: string }>>(`/invoices/${id}/pdf`);
  }
}

// GDPR API Implementation
class DotNetGdprApi implements IGdprApi {
  constructor(private http: HttpClient) {}

  async getRequests(params?: {
    type?: string[];
    status?: string[];
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<GdprRequest>> {
    return this.http.get<PaginatedResponse<GdprRequest>>('/gdpr/requests', params);
  }

  async getRequest(id: string): Promise<ApiResponse<GdprRequest>> {
    return this.http.get<ApiResponse<GdprRequest>>(`/gdpr/requests/${id}`);
  }

  async createRequest(data: {
    type: string;
    dataSubject: string;
    description: string;
  }): Promise<ApiResponse<GdprRequest>> {
    return this.http.post<ApiResponse<GdprRequest>>('/gdpr/requests', data);
  }

  async updateRequest(id: string, data: Partial<GdprRequest>): Promise<ApiResponse<GdprRequest>> {
    return this.http.patch<ApiResponse<GdprRequest>>(`/gdpr/requests/${id}`, data);
  }

  async exportData(subjectId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.http.post<ApiResponse<{ downloadUrl: string }>>('/gdpr/export', {
      subjectId
    });
  }

  async deleteData(subjectId: string, reason?: string): Promise<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>('/gdpr/delete', {
      subjectId,
      reason
    });
  }

  async processRequest(id: string): Promise<ApiResponse<GdprRequest>> {
    return this.http.post<ApiResponse<GdprRequest>>(`/gdpr/requests/${id}/process`);
  }
}

// Users API Implementation
class DotNetUsersApi implements IUsersApi {
  constructor(private http: HttpClient) {}

  async getUsers(params?: {
    role?: string[];
    isActive?: boolean;
    clientId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>('/users', params);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/users/${id}`);
  }

  async updateUserRole(id: string, role: string): Promise<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`/users/${id}`, { role });
  }

  async activateUser(id: string): Promise<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`/users/${id}/activate`);
  }

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`/users/${id}/deactivate`);
  }
}

// Tariffs API Implementation
class DotNetTariffsApi implements ITariffsApi {
  constructor(private http: HttpClient) {}

  async getTariffs(params?: {
    isActive?: boolean;
    type?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Tariff>> {
    return this.http.get<PaginatedResponse<Tariff>>('/tariffs', params);
  }

  async getTariff(id: string): Promise<ApiResponse<Tariff>> {
    return this.http.get<ApiResponse<Tariff>>(`/tariffs/${id}`);
  }

  async createTariff(data: Partial<Tariff>): Promise<ApiResponse<Tariff>> {
    return this.http.post<ApiResponse<Tariff>>('/tariffs', data);
  }

  async updateTariff(id: string, data: Partial<Tariff>): Promise<ApiResponse<Tariff>> {
    return this.http.patch<ApiResponse<Tariff>>(`/tariffs/${id}`, data);
  }

  async deleteTariff(id: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/tariffs/${id}`);
  }

  async activateTariff(id: string): Promise<ApiResponse<Tariff>> {
    return this.http.post<ApiResponse<Tariff>>(`/tariffs/${id}/activate`);
  }

  async deactivateTariff(id: string): Promise<ApiResponse<Tariff>> {
    return this.http.post<ApiResponse<Tariff>>(`/tariffs/${id}/deactivate`);
  }
}

// Templates API Implementation
class DotNetTemplatesApi implements ITemplatesApi {
  constructor(private http: HttpClient) {}

  async getTemplates(params?: {
    type?: string;
    locale?: string;
    isActive?: boolean;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<MessageTemplate>> {
    return this.http.get<PaginatedResponse<MessageTemplate>>('/templates', params);
  }

  async getTemplate(id: string): Promise<ApiResponse<MessageTemplate>> {
    return this.http.get<ApiResponse<MessageTemplate>>(`/templates/${id}`);
  }

  async createTemplate(data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>> {
    return this.http.post<ApiResponse<MessageTemplate>>('/templates', data);
  }

  async updateTemplate(id: string, data: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>> {
    return this.http.patch<ApiResponse<MessageTemplate>>(`/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/templates/${id}`);
  }

  async activateTemplate(id: string): Promise<ApiResponse<MessageTemplate>> {
    return this.http.post<ApiResponse<MessageTemplate>>(`/templates/${id}/activate`);
  }

  async deactivateTemplate(id: string): Promise<ApiResponse<MessageTemplate>> {
    return this.http.post<ApiResponse<MessageTemplate>>(`/templates/${id}/deactivate`);
  }

  async renderTemplate(id: string, variables: Record<string, any>): Promise<ApiResponse<{ content: string }>> {
    return this.http.post<ApiResponse<{ content: string }>>(`/templates/${id}/render`, variables);
  }
}

// Retention API Implementation
class DotNetRetentionApi implements IRetentionApi {
  constructor(private http: HttpClient) {}

  async getRetentionPolicies(): Promise<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>('/retention/policies');
  }

  async updateRetentionPolicy(id: string, data: any): Promise<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`/retention/policies/${id}`, data);
  }

  async scheduleDataDeletion(entityId: string, entityType: string, deleteAfter: string): Promise<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>('/retention/schedule-deletion', {
      entityId,
      entityType,
      deleteAfter
    });
  }

  async cancelDataDeletion(entityId: string): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/retention/scheduled/${entityId}`);
  }

  async getPendingDeletions(): Promise<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>('/retention/pending');
  }
}

// Analytics API Implementation
class DotNetAnalyticsApi implements IAnalyticsApi {
  constructor(private http: HttpClient) {}

  async getDashboardStats(params?: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
  }): Promise<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>('/analytics/dashboard', params);
  }

  async getCaseMetrics(params?: {
    period?: string;
    groupBy?: string;
  }): Promise<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('/analytics/cases', params);
  }

  async getRecoveryMetrics(params?: {
    period?: string;
    currency?: string;
  }): Promise<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('/analytics/recovery', params);
  }

  async getPerformanceMetrics(params?: {
    agentId?: string;
    period?: string;
  }): Promise<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('/analytics/performance', params);
  }
}

// Main .NET API Client
export class DotNetApiClient implements IApiClient {
  private http: HttpClient;
  
  public auth: IAuthApi;
  public cases: ICasesApi;
  public approvals: IApprovalsApi;
  public invoices: IInvoicesApi;
  public gdpr: IGdprApi;
  public users: IUsersApi;
  public tariffs: ITariffsApi;
  public templates: ITemplatesApi;
  public retention: IRetentionApi;
  public analytics: IAnalyticsApi;

  constructor(config: ApiConfig) {
    this.http = new HttpClient(config);

    // Initialize all API modules
    this.auth = new DotNetAuthApi(this.http);
    this.cases = new DotNetCasesApi(this.http);
    this.approvals = new DotNetApprovalsApi(this.http);
    this.invoices = new DotNetInvoicesApi(this.http);
    this.gdpr = new DotNetGdprApi(this.http);
    this.users = new DotNetUsersApi(this.http);
    this.tariffs = new DotNetTariffsApi(this.http);
    this.templates = new DotNetTemplatesApi(this.http);
    this.retention = new DotNetRetentionApi(this.http);
    this.analytics = new DotNetAnalyticsApi(this.http);
  }

  setBaseUrl(url: string): void {
    this.http.setBaseUrl(url);
  }

  setTimeout(timeout: number): void {
    this.http.setTimeout(timeout);
  }

  setAuthToken(token: string): void {
    this.http.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.http.clearAuthToken();
  }
}