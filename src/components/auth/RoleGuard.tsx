// Professional Role-Based Access Control Guard
// Protects routes and components based on user roles and permissions

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
  fallbackUrl?: string;
  showAccessDenied?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallbackUrl = '/dashboard',
  showAccessDenied = true,
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole, canAccess } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    if (showAccessDenied) {
      return <AccessDeniedMessage />;
    }
    return <Navigate to={fallbackUrl} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !canAccess(requiredPermission)) {
    if (showAccessDenied) {
      return <AccessDeniedMessage />;
    }
    return <Navigate to={fallbackUrl} replace />;
  }

  return <>{children}</>;
}

function AccessDeniedMessage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Your current role ({user?.role}) does not have permission to access this resource.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your system administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for protecting UI elements
interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}: PermissionGateProps) {
  const { hasRole, canAccess } = useAuth();

  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission && !canAccess(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}