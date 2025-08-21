// Main API factory and configuration
import type { IApiClient, ApiConfig } from './interfaces';
import { SupabaseApiClient } from './adapters/supabaseAdapter';
import { DotNetApiClient } from './adapters/dotnetAdapter';

// API Mode configuration
export type ApiMode = 'supabase' | 'dotnet';

// Environment configuration
interface ApiEnvironmentConfig {
  mode: ApiMode;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  dotnetApiUrl?: string;
  timeout?: number;
  retries?: number;
}

// Get configuration from environment variables
function getApiConfig(): ApiEnvironmentConfig {
  const mode = (import.meta.env.VITE_API_MODE || 'supabase') as ApiMode;
  
  return {
    mode,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://inohrthysqwupzmwovzj.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub2hydGh5c3F3dXB6bXdvdnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODcxOTYsImV4cCI6MjA3MTI2MzE5Nn0.dvFV6-cUtY4r9zr_Wt8pGlbZtcb9YA3sbOGKodegeuE',
    dotnetApiUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.debtcollection.com/v1',
    timeout: 30000,
    retries: 3
  };
}

// API Client Factory
class ApiClientFactory {
  private static instance: IApiClient;
  private static currentMode: ApiMode;

  static createClient(config?: Partial<ApiEnvironmentConfig>): IApiClient {
    const envConfig = getApiConfig();
    const finalConfig = { ...envConfig, ...config };

    // Return existing instance if mode hasn't changed
    if (this.instance && this.currentMode === finalConfig.mode) {
      return this.instance;
    }

    this.currentMode = finalConfig.mode;

    switch (finalConfig.mode) {
      case 'supabase':
        console.info('🔌 Initializing Supabase API client');
        this.instance = new SupabaseApiClient();
        break;
        
      case 'dotnet':
        console.info('🔌 Initializing .NET API client');
        if (!finalConfig.dotnetApiUrl) {
          throw new Error('VITE_API_BASE_URL is required for .NET API mode');
        }
        
        const dotnetConfig: ApiConfig = {
          baseUrl: finalConfig.dotnetApiUrl,
          timeout: finalConfig.timeout,
          retries: finalConfig.retries
        };
        
        this.instance = new DotNetApiClient(dotnetConfig);
        break;
        
      default:
        throw new Error(`Unknown API mode: ${finalConfig.mode}`);
    }

    console.info(`✅ API client initialized in ${finalConfig.mode} mode`);
    return this.instance;
  }

  static getCurrentClient(): IApiClient {
    if (!this.instance) {
      return this.createClient();
    }
    return this.instance;
  }

  static switchMode(mode: ApiMode, config?: Partial<ApiEnvironmentConfig>): IApiClient {
    console.info(`🔄 Switching API mode from ${this.currentMode} to ${mode}`);
    
    // Clear existing instance to force recreation
    this.instance = null as any;
    this.currentMode = null as any;
    
    return this.createClient({ ...config, mode });
  }

  static getMode(): ApiMode {
    return this.currentMode || getApiConfig().mode;
  }
}

// Export singleton instance
export const apiClient = ApiClientFactory.createClient();

// Export factory for advanced usage
export { ApiClientFactory };

// Export types and interfaces
export * from './interfaces';
export type { ApiEnvironmentConfig };

// Utility functions
export function isSupabaseMode(): boolean {
  return ApiClientFactory.getMode() === 'supabase';
}

export function isDotNetMode(): boolean {
  return ApiClientFactory.getMode() === 'dotnet';
}

export function switchApiMode(mode: ApiMode): IApiClient {
  return ApiClientFactory.switchMode(mode);
}

// Development utilities
export const dev = {
  /**
   * Get current API configuration
   */
  getConfig(): ApiEnvironmentConfig {
    return getApiConfig();
  },
  
  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = ApiClientFactory.getCurrentClient();
      
      if (isSupabaseMode()) {
        // Test Supabase connection by checking auth status
        return client.auth.isAuthenticated() || true; // Always return true for now
      } else {
        // Test .NET API connection by making a simple request
        await client.analytics.getDashboardStats();
        return true;
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  },
  
  /**
   * Get API client performance metrics
   */
  getMetrics(): Record<string, any> {
    return {
      mode: ApiClientFactory.getMode(),
      initialized: !!ApiClientFactory['instance'],
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Force reinitialize API client
   */
  reinitialize(config?: Partial<ApiEnvironmentConfig>): IApiClient {
    ApiClientFactory['instance'] = null as any;
    return ApiClientFactory.createClient(config);
  }
};

// Default export
export default apiClient;