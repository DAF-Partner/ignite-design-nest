// .NET API adapter implementation for API interfaces
import axios, { AxiosInstance, AxiosResponse } from 'axios';
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
import { DotNetCaseIntakesApi, DotNetAdminConfigApi } from './dotnetAdapters';

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

// Placeholder API implementations (stub classes)
class DotNetAuthApi implements IAuthApi {
  constructor(private http: HttpClient) {}
  async login(): Promise<ApiResponse<AuthTokens>> { throw new ApiError(501, 'Not implemented'); }
  async logout(): Promise<void> { throw new ApiError(501, 'Not implemented'); }
  async refreshToken(): Promise<ApiResponse<AuthTokens>> { throw new ApiError(501, 'Not implemented'); }
  async getCurrentUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  isAuthenticated(): boolean { return false; }
}

class DotNetCasesApi implements ICasesApi {
  constructor(private http: HttpClient) {}
  async getCases(): Promise<PaginatedResponse<Case>> { throw new ApiError(501, 'Not implemented'); }
  async getCase(): Promise<ApiResponse<Case>> { throw new ApiError(501, 'Not implemented'); }
  async createCase(): Promise<ApiResponse<Case>> { throw new ApiError(501, 'Not implemented'); }
  async updateCase(): Promise<ApiResponse<Case>> { throw new ApiError(501, 'Not implemented'); }
  async deleteCase(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async assignAgent(): Promise<ApiResponse<Case>> { throw new ApiError(501, 'Not implemented'); }
  async getCaseEvents(): Promise<ApiResponse<any[]>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetApprovalsApi implements IApprovalsApi {
  constructor(private http: HttpClient) {}
  async getApprovals(): Promise<PaginatedResponse<Approval>> { throw new ApiError(501, 'Not implemented'); }
  async getApproval(): Promise<ApiResponse<Approval>> { throw new ApiError(501, 'Not implemented'); }
  async createApproval(): Promise<ApiResponse<Approval>> { throw new ApiError(501, 'Not implemented'); }
  async updateApproval(): Promise<ApiResponse<Approval>> { throw new ApiError(501, 'Not implemented'); }
  async getPendingApprovals(): Promise<ApiResponse<Approval[]>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetInvoicesApi implements IInvoicesApi {
  constructor(private http: HttpClient) {}
  async getInvoices(): Promise<PaginatedResponse<Invoice>> { throw new ApiError(501, 'Not implemented'); }
  async getInvoice(): Promise<ApiResponse<Invoice>> { throw new ApiError(501, 'Not implemented'); }
  async createInvoice(): Promise<ApiResponse<Invoice>> { throw new ApiError(501, 'Not implemented'); }
  async updateInvoice(): Promise<ApiResponse<Invoice>> { throw new ApiError(501, 'Not implemented'); }
  async deleteInvoice(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async sendInvoice(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async markAsPaid(): Promise<ApiResponse<Invoice>> { throw new ApiError(501, 'Not implemented'); }
  async generatePdf(): Promise<ApiResponse<{ pdfUrl: string }>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetGdprApi implements IGdprApi {
  constructor(private http: HttpClient) {}
  async getRequests(): Promise<PaginatedResponse<GdprRequest>> { throw new ApiError(501, 'Not implemented'); }
  async getRequest(): Promise<ApiResponse<GdprRequest>> { throw new ApiError(501, 'Not implemented'); }
  async createRequest(): Promise<ApiResponse<GdprRequest>> { throw new ApiError(501, 'Not implemented'); }
  async updateRequest(): Promise<ApiResponse<GdprRequest>> { throw new ApiError(501, 'Not implemented'); }
  async exportData(): Promise<ApiResponse<{ downloadUrl: string }>> { throw new ApiError(501, 'Not implemented'); }
  async deleteData(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async processRequest(): Promise<ApiResponse<GdprRequest>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetUsersApi implements IUsersApi {
  constructor(private http: HttpClient) {}
  async getUsers(): Promise<PaginatedResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async getUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async createUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async updateUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async deleteUser(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async updateUserRole(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async activateUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
  async deactivateUser(): Promise<ApiResponse<User>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetTariffsApi implements ITariffsApi {
  constructor(private http: HttpClient) {}
  async getTariffs(): Promise<PaginatedResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
  async getTariff(): Promise<ApiResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
  async createTariff(): Promise<ApiResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
  async updateTariff(): Promise<ApiResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
  async deleteTariff(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async activateTariff(): Promise<ApiResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
  async deactivateTariff(): Promise<ApiResponse<Tariff>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetTemplatesApi implements ITemplatesApi {
  constructor(private http: HttpClient) {}
  async getTemplates(): Promise<PaginatedResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async getTemplate(): Promise<ApiResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async createTemplate(): Promise<ApiResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async updateTemplate(): Promise<ApiResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async deleteTemplate(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async activateTemplate(): Promise<ApiResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async deactivateTemplate(): Promise<ApiResponse<MessageTemplate>> { throw new ApiError(501, 'Not implemented'); }
  async renderTemplate(): Promise<ApiResponse<{ content: string }>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetRetentionApi implements IRetentionApi {
  constructor(private http: HttpClient) {}
  async getRetentionPolicies(): Promise<ApiResponse<any[]>> { throw new ApiError(501, 'Not implemented'); }
  async updateRetentionPolicy(): Promise<ApiResponse<any>> { throw new ApiError(501, 'Not implemented'); }
  async scheduleDataDeletion(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async cancelDataDeletion(): Promise<ApiResponse<void>> { throw new ApiError(501, 'Not implemented'); }
  async getPendingDeletions(): Promise<ApiResponse<any[]>> { throw new ApiError(501, 'Not implemented'); }
}

class DotNetAnalyticsApi implements IAnalyticsApi {
  constructor(private http: HttpClient) {}
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> { throw new ApiError(501, 'Not implemented'); }
  async getCaseMetrics(): Promise<ApiResponse<any>> { throw new ApiError(501, 'Not implemented'); }
  async getRecoveryMetrics(): Promise<ApiResponse<any>> { throw new ApiError(501, 'Not implemented'); }
  async getPerformanceMetrics(): Promise<ApiResponse<any>> { throw new ApiError(501, 'Not implemented'); }
}

// Main .NET API Client
export class DotNetApiClient implements IApiClient {
  private http: HttpClient;
  
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

  constructor(config: ApiConfig) {
    this.http = new HttpClient(config);
    
    this.auth = new DotNetAuthApi(this.http);
    this.cases = new DotNetCasesApi(this.http);
    this.caseIntakes = new DotNetCaseIntakesApi(this.http);
    this.approvals = new DotNetApprovalsApi(this.http);
    this.invoices = new DotNetInvoicesApi(this.http);
    this.gdpr = new DotNetGdprApi(this.http);
    this.users = new DotNetUsersApi(this.http);
    this.tariffs = new DotNetTariffsApi(this.http);
    this.templates = new DotNetTemplatesApi(this.http);
    this.retention = new DotNetRetentionApi(this.http);
    this.analytics = new DotNetAnalyticsApi(this.http);
    this.adminConfig = new DotNetAdminConfigApi(this.http);
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