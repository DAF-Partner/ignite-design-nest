// Professional API Layer for B2B Debt Collection Platform
// Centralized API client with JWT authentication and error handling

import { ApiResponse, PaginatedResponse, ProblemDetails, AuthTokens } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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
      return mockLogin(email, password);
    }
    
    const response = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.access_token);
    return response;
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

// Mock implementation for development
async function mockLogin(email: string, password: string): Promise<AuthTokens> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock user roles based on email
  let role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'DPO' = 'CLIENT';
  if (email.includes('agent')) role = 'AGENT';
  if (email.includes('admin')) role = 'ADMIN';  
  if (email.includes('dpo')) role = 'DPO';

  if (password !== 'password123') {
    throw new ApiError({
      title: 'Authentication Failed',
      detail: 'Invalid email or password',
      status: 401,
    });
  }

  return {
    access_token: 'mock_jwt_token_' + Date.now(),
    refresh_token: 'mock_refresh_token_' + Date.now(),
    expires_in: 3600,
    user: {
      id: 'user_' + Date.now(),
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role,
      clientId: role === 'CLIENT' ? 'client_1' : undefined,
      createdAt: new Date().toISOString(),
    },
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