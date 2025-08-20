// Professional Approvals Management Page for B2B Debt Collection Platform
// Complete approval workflow with role-based access and decision tracking

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  FileText,
  AlertTriangle,
  MessageSquare,
  Eye,
  Check,
  X,
  ChevronDown,
  Calculator,
  Calendar,
  User,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { getApprovalsForUser } from '@/lib/mockData';
import type { Approval } from '@/types';

const statusConfig = {
  pending: { 
    label: 'Pending Review', 
    icon: Clock, 
    variant: 'warning' as const,
    description: 'Awaiting decision'
  },
  approved: { 
    label: 'Approved', 
    icon: CheckCircle, 
    variant: 'success' as const,
    description: 'Request approved'
  },
  rejected: { 
    label: 'Rejected', 
    icon: XCircle, 
    variant: 'destructive' as const,
    description: 'Request declined'
  }
};

const typeConfig = {
  legal_escalation: {
    label: 'Legal Escalation',
    icon: AlertTriangle,
    description: 'Request to escalate case to legal proceedings'
  },
  expense: {
    label: 'Expense Approval',
    icon: Calculator,
    description: 'Request for expense reimbursement'
  },
  settlement: {
    label: 'Settlement Agreement',
    icon: FileText,
    description: 'Proposed settlement terms'
  }
};

export default function Approvals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load approvals data
  useEffect(() => {
    if (user) {
      const userApprovals = getApprovalsForUser(user.id, user.role);
      setApprovals(userApprovals);
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...approvals];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(approval => approval.state === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(approval => approval.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(approval => 
        approval.caseName.toLowerCase().includes(query) ||
        approval.description.toLowerCase().includes(query) ||
        approval.requestedByName.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredApprovals(filtered);
  }, [approvals, statusFilter, typeFilter, searchQuery]);

  const handleDecision = async (approval: Approval, decision: 'approve' | 'reject') => {
    if (user?.role !== 'ADMIN') {
      toast({
        title: 'Unauthorized',
        description: 'Only administrators can make approval decisions.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedApproval(approval);
    setDecisionType(decision);
    setDecisionNotes('');
    setShowDecisionDialog(true);
  };

  const handleSubmitDecision = async () => {
    if (!selectedApproval) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const updatedApprovals = approvals.map(approval => 
        approval.id === selectedApproval.id 
          ? {
              ...approval,
              state: decisionType === 'approve' ? 'approved' : 'rejected' as any,
              decidedAt: new Date().toISOString(),
              decidedBy: user?.id,
              decisionNotes: decisionNotes || undefined
            }
          : approval
      );
      
      setApprovals(updatedApprovals);
      setShowDecisionDialog(false);
      
      toast({
        title: `Request ${decisionType === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `${selectedApproval.caseName} has been ${decisionType === 'approve' ? 'approved' : 'rejected'}.`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process decision. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.state === 'pending').length,
    approved: approvals.filter(a => a.state === 'approved').length,
    rejected: approvals.filter(a => a.state === 'rejected').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approvals Management</h1>
          <p className="text-muted-foreground">
            {user?.role === 'ADMIN' ? 'Review and approve requests' : 'Track your approval requests'}
          </p>
        </div>
        
        {stats.pending > 0 && user?.role === 'ADMIN' && (
          <Badge variant="outline" className="text-sm py-2 px-4 border-warning text-warning">
            {stats.pending} Pending Review{stats.pending > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case name, description, or requester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="legal_escalation">Legal Escalation</SelectItem>
                  <SelectItem value="expense">Expense Approval</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="grid gap-6">
        {filteredApprovals.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No approval requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Approval requests will appear here when submitted.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map((approval) => {
            const StatusIcon = statusConfig[approval.state].icon;
            const TypeIcon = typeConfig[approval.type as keyof typeof typeConfig]?.icon || FileText;
            
            return (
              <Card key={approval.id} className="card-professional hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{approval.caseName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {typeConfig[approval.type as keyof typeof typeConfig]?.label || approval.type}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusBadge status={approval.state} />
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4 line-clamp-2">{approval.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Requested by {approval.requestedByName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(approval.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          <span>£{approval.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {approval.feeBreakdown && (
                        <div className="bg-accent/50 rounded-lg p-3 mb-4">
                          <h4 className="font-medium text-sm mb-2">Fee Breakdown</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Base:</span>
                              <span className="ml-2">£{approval.feeBreakdown.baseAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fee ({approval.feeBreakdown.percentage}%):</span>
                              <span className="ml-2">£{(approval.feeBreakdown.baseAmount * approval.feeBreakdown.percentage / 100).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fixed:</span>
                              <span className="ml-2">£{approval.feeBreakdown.fixedFee.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-medium">Total:</span>
                              <span className="ml-2 font-medium">£{approval.feeBreakdown.totalFee.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/cases/${approval.caseId}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Case
                        </Button>
                        
                        {approval.state === 'pending' && user?.role === 'ADMIN' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecision(approval, 'reject')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDecision(approval, 'approve')}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {approval.decisionNotes && (
                        <div className="mt-4 p-3 bg-accent/30 rounded-lg border-l-4 border-l-primary">
                          <p className="text-sm font-medium mb-1">Decision Notes:</p>
                          <p className="text-sm text-muted-foreground">{approval.decisionNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decisionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval && (
                <>
                  You are about to {decisionType} the request for{' '}
                  <span className="font-medium">{selectedApproval.caseName}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Decision Notes {decisionType === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <Textarea
                placeholder={
                  decisionType === 'approve' 
                    ? 'Add any notes about this approval...'
                    : 'Please explain the reason for rejection...'
                }
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDecisionDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={decisionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitDecision}
              disabled={loading || (decisionType === 'reject' && !decisionNotes.trim())}
            >
              {loading ? 'Processing...' : `${decisionType === 'approve' ? 'Approve' : 'Reject'} Request`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}