// Professional Authentication Provider for B2B Debt Collection Platform
// JWT-based authentication with role-based access control

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User, AuthTokens } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string | string[]) => boolean;
  canAccess: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          apiClient.setToken(token);
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const authResponse: AuthTokens = await apiClient.login(email, password);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      localStorage.setItem('refresh_token', authResponse.refresh_token);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    localStorage.removeItem('user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(state.user.role);
  };

  const canAccess = (resource: string): boolean => {
    if (!state.user) return false;

    const permissions = {
      'cases.create': ['CLIENT', 'ADMIN'],
      'cases.view.all': ['ADMIN', 'DPO'],
      'cases.assign': ['ADMIN'],
      'approvals.decide': ['ADMIN'],
      'invoices.view.all': ['ADMIN'],
      'admin.users': ['ADMIN'],
      'admin.tariffs': ['ADMIN'],
      'admin.templates': ['ADMIN'],
      'admin.retention': ['ADMIN'],
      'gdpr.manage': ['DPO', 'ADMIN'],
      'gdpr.requests': ['CLIENT', 'DPO', 'ADMIN'],
    };

    const allowedRoles = permissions[resource as keyof typeof permissions];
    return allowedRoles ? allowedRoles.includes(state.user.role) : false;
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}