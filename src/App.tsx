import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Cases from "@/pages/Cases";
import CaseNew from "@/pages/CaseNew";
import CaseDetail from "@/pages/CaseDetail";
import Approvals from "@/pages/Approvals";
import Invoices from "@/pages/Invoices";
import GdprRequests from "@/pages/GdprRequests";
import Communications from '@/pages/Communications';
import NotFound from "./pages/NotFound";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Users from "@/pages/admin/Users";
import Tariffs from "@/pages/admin/Tariffs";
import Templates from "@/pages/admin/Templates";
import RetentionPolicy from "@/pages/admin/RetentionPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <TranslationProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                <AppLayout />
              </RoleGuard>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Case Management */}
              <Route path="cases" element={
                <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                  <Cases />
                </RoleGuard>
              } />
              <Route path="cases/new" element={
                <RoleGuard allowedRoles={['CLIENT', 'ADMIN']}>
                  <CaseNew />
                </RoleGuard>
              } />
              <Route path="cases/:id" element={
                <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                  <CaseDetail />
                </RoleGuard>
              } />
              
              {/* Approvals */}
              <Route path="approvals" element={
                <RoleGuard allowedRoles={['ADMIN', 'CLIENT']}>
                  <Approvals />
                </RoleGuard>
              } />
              
              {/* Invoices */}
              <Route path="invoices" element={
                <RoleGuard allowedRoles={['CLIENT', 'ADMIN']}>
                  <Invoices />
                </RoleGuard>
              } />
              
              {/* GDPR Requests */}
              <Route path="gdpr-requests" element={
                <RoleGuard allowedRoles={['DPO', 'ADMIN']}>
                  <GdprRequests />
                </RoleGuard>
              } />
              
              {/* Communications */}
              <Route path="communications" element={
                <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                  <Communications />
                </RoleGuard>
              } />
              
              {/* Profile & Settings */}
              <Route path="profile" element={
                <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                  <Profile />
                </RoleGuard>
              } />
              
              <Route path="settings" element={
                <RoleGuard allowedRoles={['CLIENT', 'AGENT', 'ADMIN', 'DPO']}>
                  <Settings />
                </RoleGuard>
              } />
              
              {/* Admin Routes */}
              <Route path="admin/users" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Users />
                </RoleGuard>
              } />
              
              <Route path="admin/tariffs" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Tariffs />
                </RoleGuard>
              } />
              
              <Route path="admin/templates" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <Templates />
                </RoleGuard>
              } />
              
              <Route path="admin/retention" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <RetentionPolicy />
                </RoleGuard>
              } />
              
              {/* DPO Routes */}
              <Route path="dpo" element={
                <RoleGuard allowedRoles={['DPO']}>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Data Protection Office</h2>
                    <p className="text-muted-foreground">DPO dashboard and tools coming soon...</p>
                  </div>
                </RoleGuard>
              } />
            </Route>
            
            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TranslationProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
