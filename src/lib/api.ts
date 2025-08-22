// Professional API Layer for B2B Debt Collection Platform
// Centralized API client with JWT authentication and error handling

import { ApiResponse, PaginatedResponse, ProblemDetails, AuthTokens, Case, CreateCaseRequest, CaseStatus } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to mock mode

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  get isAuthenticated() {
    return !!this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/v1${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/problem+json')) {
          const problem: ProblemDetails = await response.json();
          throw new ApiError(problem);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthTokens> {
    if (USE_MOCK) {
      const response = await mockLogin(email, password);
      this.setToken(response.access_token);
      return response;
    }
    
    try {
      const response = await this.request<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      // Fallback to mock if API is not available
      console.warn('API not available, falling back to mock mode');
      const response = await mockLogin(email, password);
      this.setToken(response.access_token);
      return response;
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    this.setToken(response.access_token);
    return response;
  }

  // Cases API
  async getCases(params?: {
    status?: string;
    q?: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<Case>> {
    if (USE_MOCK) {
      return mockGetCases(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    
    return this.get<PaginatedResponse<Case>>(`/cases?${searchParams.toString()}`);
  }

  async createCase(data: CreateCaseRequest): Promise<Case> {
    if (USE_MOCK) {
      return mockCreateCase(data);
    }
    
    return this.post<Case>('/cases', data);
  }

  async getCase(id: string): Promise<Case> {
    if (USE_MOCK) {
      return mockGetCase(id);
    }
    
    return this.get<Case>(`/cases/${id}`);
  }

  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    if (USE_MOCK) {
      return mockUpdateCase(id, data);
    }
    
    return this.patch<Case>(`/cases/${id}`, data);
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile(file: File): Promise<{ upload_url: string; doc_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/v1/docs/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export class ApiError extends Error {
  public problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.title);
    this.problem = problem;
    this.name = 'ApiError';
  }

  get status() {
    return this.problem.status;
  }

  get detail() {
    return this.problem.detail;
  }

  get errors() {
    return this.problem.errors;
  }
}

// Mock implementation for cases
async function mockGetCases(params?: any): Promise<PaginatedResponse<Case>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { mockCases } = await import('@/lib/mockData');
  let cases = [...mockCases];
  
  // Apply filtering
  if (params?.status && params.status !== 'all') {
    cases = cases.filter(c => c.status === params.status);
  }
  
  if (params?.q) {
    const query = params.q.toLowerCase();
    cases = cases.filter(c => 
      c.debtor.name.toLowerCase().includes(query) ||
      c.debtor.email.toLowerCase().includes(query) ||
      c.reference.toLowerCase().includes(query)
    );
  }
  
  const limit = params?.limit || 20;
  const total = cases.length;
  const data = cases.slice(0, limit);
  
  return {
    data,
    total,
    hasNext: total > limit,
    nextCursor: total > limit ? 'next_page' : undefined,
  };
}

async function mockCreateCase(data: CreateCaseRequest): Promise<Case> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newCase: Case = {
    id: crypto.randomUUID(),
    reference: data.reference,
    clientId: data.clientId,
    clientName: 'Mock Client', // Would be resolved from clientId
    assignedAgentId: undefined,
    assignedAgentName: undefined,
    debtor: data.debtor,
    amount: data.amount,
    currency: data.currency,
    status: 'new' as CaseStatus,
    description: data.description,
    originalCreditor: data.originalCreditor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return newCase;
}

async function mockGetCase(id: string): Promise<Case> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const { mockCases } = await import('@/lib/mockData');
  const case_ = mockCases.find(c => c.id === id);
  
  if (!case_) {
    throw new ApiError({
      title: 'Case Not Found',
      detail: `Case with ID ${id} not found`,
      status: 404,
    });
  }
  
  return case_;
}

async function mockUpdateCase(id: string, data: Partial<Case>): Promise<Case> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { mockCases } = await import('@/lib/mockData');
  const case_ = mockCases.find(c => c.id === id);
  
  if (!case_) {
    throw new ApiError({
      title: 'Case Not Found',
      detail: `Case with ID ${id} not found`,
      status: 404,
    });
  }
  
  return {
    ...case_,
    ...data,
    id: case_.id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };
}

// Mock implementation for development
async function mockLogin(email: string, password: string): Promise<AuthTokens> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Determine role from email
  let role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'DPO' = 'CLIENT';
  if (email.toLowerCase().includes('agent')) role = 'AGENT';
  if (email.toLowerCase().includes('admin')) role = 'ADMIN';
  if (email.toLowerCase().includes('dpo')) role = 'DPO';

  if (password !== 'password123') {
    throw new ApiError({
      title: 'Authentication Failed',
      detail: 'Invalid email or password',
      status: 401,
    });
  }

  // Align returned user with our mock dataset so role-scoped filters work
  const { mockUsers } = await import('@/lib/mockData');
  const roleUserIdMap: Record<typeof role, string> = {
    CLIENT: 'client_1',
    AGENT: 'agent_1',
    ADMIN: 'admin_1',
    DPO: 'dpo_1',
  };
  const base = mockUsers.find(u => u.id === roleUserIdMap[role]);

  const user = base
    ? { ...base, email } // keep provided email for demo, preserve ids/clientId/role
    : {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role,
        clientId: role === 'CLIENT' ? 'client_1' : undefined,
        createdAt: new Date().toISOString(),
      };

  return {
    access_token: 'mock_jwt_token_' + Date.now(),
    refresh_token: 'mock_refresh_token_' + Date.now(),
    expires_in: 3600,
    user,
  };
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Custom hook for API usage
export function useApi() {
  return {
    client: apiClient,
    isAuthenticated: () => apiClient.isAuthenticated,
    login: apiClient.login.bind(apiClient),
    logout: () => {
      apiClient.clearToken();
      window.location.href = '/login';
    },
  };
}