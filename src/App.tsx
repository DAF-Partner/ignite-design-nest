import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
              <Route path="gdpr" element={
                <RoleGuard allowedRoles={['DPO', 'ADMIN']}>
                  <GdprRequests />
                </RoleGuard>
              } />
              
              {/* Admin Routes */}
              <Route path="admin/users" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">User Management</h2>
                    <p className="text-muted-foreground">User administration panel coming soon...</p>
                  </div>
                </RoleGuard>
              } />
              
              <Route path="admin/tariffs" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Tariff Management</h2>
                    <p className="text-muted-foreground">Tariff configuration system coming soon...</p>
                  </div>
                </RoleGuard>
              } />
              
              <Route path="admin/templates" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Message Templates</h2>
                    <p className="text-muted-foreground">Template management system coming soon...</p>
                  </div>
                </RoleGuard>
              } />
              
              <Route path="admin/retention" element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Retention Policy</h2>
                    <p className="text-muted-foreground">Data retention management coming soon...</p>
                  </div>
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
