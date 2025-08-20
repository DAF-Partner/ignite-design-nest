import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Shield,
  Download,
  Eye,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Database,
  Trash2,
  FileDown,
  Plus,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { mockGdprRequests } from '@/lib/mockData';
import type { GdprRequest } from '@/types';

const statusConfig = {
  pending: { 
    label: 'Pending Review', 
    icon: Clock, 
    description: 'Request received, awaiting processing'
  },
  processing: { 
    label: 'Processing', 
    icon: AlertCircle, 
    description: 'Request being processed'
  },
  completed: { 
    label: 'Completed', 
    icon: CheckCircle, 
    description: 'Request fulfilled'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: AlertTriangle, 
    description: 'Request cancelled'
  },
  rejected: { 
    label: 'Rejected', 
    icon: AlertTriangle, 
    description: 'Request declined'
  }
};

const typeConfig = {
  SAR: {
    label: 'Subject Access Request',
    icon: FileDown,
    description: 'Request for personal data held by the organization'
  },
  ERASURE: {
    label: 'Right to Erasure',
    icon: Trash2,
    description: 'Request to delete personal data'
  },
  RECTIFICATION: {
    label: 'Right to Rectification',
    icon: FileText,
    description: 'Request to correct inaccurate personal data'
  },
  PORTABILITY: {
    label: 'Data Portability',
    icon: Download,
    description: 'Request for data in machine-readable format'
  },
  OBJECTION: {
    label: 'Right to Object',
    icon: Shield,
    description: 'Objection to processing of personal data'
  }
};

export default function GdprRequests() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<GdprRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GdprRequest | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  
  // New request form
  const [newRequestType, setNewRequestType] = useState<string>('');
  const [newRequestSubject, setNewRequestSubject] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load GDPR requests data
  useEffect(() => {
    setRequests(mockGdprRequests);
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(request => request.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.dataSubject.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.requestedByName.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredRequests(filtered);
  }, [requests, statusFilter, typeFilter, searchQuery]);

  const handleViewRequest = (request: GdprRequest) => {
    setSelectedRequest(request);
    setShowRequestDialog(true);
  };

  const handleDownloadCertificate = (request: GdprRequest) => {
    if (request.downloadUrl) {
      toast({
        title: 'Download Started',
        description: `Downloading completion certificate for request ${request.id}`
      });
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequestType || !newRequestSubject || !newRequestDescription) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newRequest: GdprRequest = {
      id: `gdpr_${Date.now()}`,
      type: newRequestType as any,
      status: 'pending',
      requestedBy: user?.id || 'current_user',
      requestedByName: user?.name || 'Current User',
      dataSubject: newRequestSubject,
      description: newRequestDescription,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      affectedCases: []
    };

    setRequests([newRequest, ...requests]);
    setShowNewRequestDialog(false);
    
    // Reset form
    setNewRequestType('');
    setNewRequestSubject('');
    setNewRequestDescription('');
    
    toast({
      title: 'Request Created',
      description: `GDPR request ${newRequest.id} has been submitted for processing.`
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (request: GdprRequest) => {
    const created = new Date(request.createdAt);
    const due = new Date(request.dueDate);
    const now = new Date();
    
    const totalTime = due.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    
    const percentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    
    if (request.status === 'completed') return 100;
    if (request.status === 'rejected' || request.status === 'cancelled') return 0;
    
    return percentage;
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    overdue: requests.filter(r => {
      const daysRemaining = getDaysRemaining(r.dueDate);
      return daysRemaining < 0 && r.status !== 'completed';
    }).length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">GDPR Requests</h1>
          <p className="text-muted-foreground">
            Manage data privacy requests and ensure GDPR compliance
          </p>
        </div>
        
        <div className="flex gap-2">
          {user?.role === 'DPO' && (
            <Button onClick={() => setShowNewRequestDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
          
          {stats.overdue > 0 && (
            <Badge variant="outline" className="text-sm py-2 px-4 border-destructive text-destructive">
              {stats.overdue} Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
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
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
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
                  placeholder="Search by data subject, description, or requester..."
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
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SAR">Subject Access Request</SelectItem>
                  <SelectItem value="ERASURE">Right to Erasure</SelectItem>
                  <SelectItem value="RECTIFICATION">Rectification</SelectItem>
                  <SelectItem value="PORTABILITY">Data Portability</SelectItem>
                  <SelectItem value="OBJECTION">Right to Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Requests List */}
      <div className="grid gap-6">
        {filteredRequests.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No GDPR requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'GDPR requests will appear here when submitted.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = statusConfig[request.status].icon;
            const TypeIcon = typeConfig[request.type as keyof typeof typeConfig]?.icon || Shield;
            const daysRemaining = getDaysRemaining(request.dueDate);
            const isOverdue = daysRemaining < 0 && request.status !== 'completed';
            const progress = getProgressPercentage(request);
            
            return (
              <Card key={request.id} className="card-professional hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      <TypeIcon className={`h-6 w-6 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {typeConfig[request.type as keyof typeof typeConfig]?.label || request.type}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Request ID: {request.id}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusBadge status={request.status} />
                          {isOverdue && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4 line-clamp-2">{request.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span>Subject: {request.dataSubject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Requested by {request.requestedByName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Due {format(new Date(request.dueDate), 'MMM dd, yyyy')}
                            {daysRemaining >= 0 && ` (${daysRemaining} days)`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {request.status !== 'completed' && request.status !== 'rejected' && request.status !== 'cancelled' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress 
                            value={progress} 
                            className={`h-2 ${isOverdue ? 'bg-destructive/20' : ''}`}
                          />
                        </div>
                      )}
                      
                      {/* Affected Cases */}
                      {request.affectedCases && request.affectedCases.length > 0 && (
                        <div className="bg-accent/50 rounded-lg p-3 mb-4">
                          <h4 className="font-medium text-sm mb-2">Affected Cases</h4>
                          <div className="flex flex-wrap gap-1">
                            {request.affectedCases.map((caseId, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {caseId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created {format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                          {request.completedAt && (
                            <span>Completed {format(new Date(request.completedAt), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          
                          {request.downloadUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCertificate(request)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>GDPR Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && `${typeConfig[selectedRequest.type as keyof typeof typeConfig]?.label} - ${selectedRequest.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-96">
              <div className="space-y-6">
                {/* Request Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {typeConfig[selectedRequest.type as keyof typeof typeConfig]?.label}
                    </h3>
                    <p className="text-muted-foreground">{selectedRequest.id}</p>
                  </div>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                
                <Separator />
                
                {/* Request Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Subject</p>
                    <p className="font-semibold">{selectedRequest.dataSubject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="font-semibold">{selectedRequest.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{format(new Date(selectedRequest.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p>{format(new Date(selectedRequest.dueDate), 'PPP')}</p>
                  </div>
                  {selectedRequest.completedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p>{format(new Date(selectedRequest.completedAt), 'PPP')}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Request Description</h4>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
                
                {/* Affected Cases */}
                {selectedRequest.affectedCases && selectedRequest.affectedCases.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Affected Cases</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.affectedCases.map((caseId, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer" 
                                 onClick={() => navigate(`/cases/${caseId}`)}>
                            {caseId}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New GDPR Request</DialogTitle>
            <DialogDescription>
              Submit a new data privacy request for processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Request Type</label>
              <Select value={newRequestType} onValueChange={setNewRequestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">Subject Access Request</SelectItem>
                  <SelectItem value="ERASURE">Right to Erasure</SelectItem>
                  <SelectItem value="RECTIFICATION">Right to Rectification</SelectItem>
                  <SelectItem value="PORTABILITY">Data Portability</SelectItem>
                  <SelectItem value="OBJECTION">Right to Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Data Subject</label>
              <Input
                placeholder="Name or identifier of the data subject"
                value={newRequestSubject}
                onChange={(e) => setNewRequestSubject(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Provide details about this GDPR request..."
                value={newRequestDescription}
                onChange={(e) => setNewRequestDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewRequestDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}