
// Professional Case Detail Page for B2B Debt Collection Platform
// Comprehensive case view with chat, actions, documents, and audit trail

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, FileText, History, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth/AuthProvider';
import { PermissionGate } from '@/components/auth/RoleGuard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Money } from '@/components/ui/money';
import { ActionLogger } from '@/components/case/ActionLogger';
import { ActionHistory } from '@/components/case/ActionHistory';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { caseApi } from '@/lib/api/caseApi';
import { Case } from '@/types';
import { toast } from 'sonner';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) {
      navigate('/cases');
      return;
    }

    loadCase();
  }, [id, navigate]);

  const loadCase = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const caseData = await caseApi.getCase(id);
      setCase(caseData);
    } catch (error) {
      console.error('Error loading case:', error);
      setError(error instanceof Error ? error.message : 'Failed to load case');
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const handleActionLogged = () => {
    // Refresh case data when a new action is logged
    loadCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'The requested case could not be found or you do not have permission to view it.'}
                </p>
                <Button onClick={() => navigate('/cases')}>
                  Return to Cases List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canLogActions = hasRole(['ADMIN', 'AGENT']);
  const isAssignedAgent = hasRole('AGENT') && case_.assignedAgentId === user?.id;
  const isOwnCase = hasRole('CLIENT') && case_.clientId === user?.clientId;
  const canViewFullDetails = hasRole(['ADMIN', 'DPO']) || isAssignedAgent || isOwnCase;

  if (!canViewFullDetails) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-warning" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground">
                  You do not have permission to view this case.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{case_.reference}</h1>
            <p className="text-muted-foreground">Case Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canLogActions && (
            <ActionLogger 
              caseId={case_.id} 
              onActionLogged={handleActionLogged}
            />
          )}
          <PermissionGate allowedRoles={['ADMIN']}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Case Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Case Information
              <StatusBadge status={case_.status} />
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Created {new Date(case_.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Debtor</h4>
              <div className="space-y-1">
                <p className="font-medium">{case_.debtor.name}</p>
                <p className="text-sm text-muted-foreground">{case_.debtor.email}</p>
                {case_.debtor.phone && (
                  <p className="text-sm text-muted-foreground">{case_.debtor.phone}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Amount</h4>
              <Money 
                amount={case_.amount} 
                currency={case_.currency}
                className="text-xl font-semibold"
              />
              {case_.originalAmount && case_.originalAmount !== case_.amount && (
                <p className="text-sm text-muted-foreground">
                  Original: <Money amount={case_.originalAmount} currency={case_.currency} />
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Assignment</h4>
              {case_.assignedAgentName ? (
                <div>
                  <p className="font-medium">{case_.assignedAgentName}</p>
                  <Badge variant="secondary">Assigned</Badge>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground">Unassigned</p>
                  <PermissionGate allowedRoles={['ADMIN']}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Assign Agent
                    </Button>
                  </PermissionGate>
                </div>
              )}
            </div>
          </div>

          {case_.description && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{case_.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Case Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(case_.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {case_.lastActionAt && (
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Last Action</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(case_.lastActionAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <ActionHistory caseId={case_.id} />
        </TabsContent>

        <TabsContent value="chat">
          <ChatInterface caseId={case_.id} />
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Document management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
