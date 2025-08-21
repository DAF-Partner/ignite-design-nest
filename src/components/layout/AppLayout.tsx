// Professional Application Layout for B2B Debt Collection Platform
// Main layout with sidebar navigation and header

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { NotificationsBell } from '@/components/layout/NotificationsBell';
import { useAuth } from '@/components/auth/AuthProvider';

export function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-surface">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <AppHeader />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;