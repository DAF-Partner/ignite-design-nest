// Professional Case Detail Page with Tabs for B2B Debt Collection Platform
// Overview, Timeline, Documents, Messages, and Approvals

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Clock, MessageSquare, CheckCircle, 
  AlertCircle, Upload, Download, Eye, MoreHorizontal,
  User, Calendar, Euro, Building, Phone, Mail, MapPin, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/status-badge';
import { Money } from '@/components/ui/money';
import { useAuth } from '@/components/auth/AuthProvider';
import { ActionLogger } from '@/components/case/ActionLogger';
import { ActionHistory } from '@/components/case/ActionHistory';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { CreateConversationDialog } from '@/components/chat/CreateConversationDialog';
import { useChat } from '@/hooks/useChat';
import { mockDocuments, mockEvents, mockMessages } from '@/lib/mockData';
import { Case, Document, CaseEvent, Message, Conversation } from '@/types';
import { caseApi } from '@/lib/api/caseApi';
import { cn } from '@/lib/utils';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [actionRefreshTrigger, setActionRefreshTrigger] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat functionality
  const { conversations, loading: chatLoading, createConversation } = useChat();

  // Fetch the case with privacy protection
  useEffect(() => {
    if (!id) return;
    
    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const caseData = await caseApi.getCase(id);
        setCase(caseData);
      } catch (err) {
        console.error('Error fetching case:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch case');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  // Get related data
  const documents = useMemo(() => {
    return mockDocuments.filter(d => d.caseId === id);
  }, [id]);

  const events = useMemo(() => {
    return mockEvents.filter(e => e.caseId === id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [id]);

  const messages = useMemo(() => {
    return mockMessages.filter(m => m.caseId === id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [id]);

  // Filter conversations for this case
  const caseConversations = useMemo(() => {
    return conversations.filter(conv => conv.type === 'case' && conv.caseId === id);
  }, [conversations, id]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">Loading Case...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch the case details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">
            {error ? 'Error Loading Case' : 'Case Not Found'}
          </h2>
          <p className="text-muted-foreground">
            {error || "The case you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => navigate('/cases')}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  // Check if user can view this case
  const canViewCase = hasRole(['ADMIN', 'DPO']) || 
    (hasRole('CLIENT') && case_.clientId === user?.clientId) ||
    (hasRole('AGENT') && case_.assignedAgentId === user?.id);

  // Check if user is the assigned agent
  const isAssignedAgent = hasRole('AGENT') && case_.assignedAgentId === user?.id;

  const handleActionLogged = () => {
    setActionRefreshTrigger(prev => prev + 1);
  };

  if (!canViewCase) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to view this case.
          </p>
          <Button onClick={() => navigate('/cases')}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided';
    return [address.street, address.city, address.postalCode, address.country]
      .filter(Boolean)
      .join(', ') || 'Incomplete address';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'awaiting_approval': return 'bg-orange-500';
      case 'legal_stage': return 'bg-red-500';
      case 'closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      case 'document_upload': return <FileText className="h-4 w-4" />;
      case 'message_sent': return <MessageSquare className="h-4 w-4" />;
      case 'approval_request': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{case_.reference}</h1>
            <p className="text-muted-foreground mt-1">
              Case created on {new Date(case_.createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={case_.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Full History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Case Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Case Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Debt Amount</p>
                <p className="font-bold">
                  <Money value={case_.amount} currency={case_.currency} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-bold">{case_.clientName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Agent</p>
                <p className="font-bold">
                  {case_.assignedAgentName || (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-bold">
                  {new Date(case_.updatedAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 text-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debtor Information */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Debtor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{case_.debtor.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {case_.debtor.email}
                    </div>
                    {case_.debtor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {case_.debtor.phone}
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <span>{formatAddress(case_.debtor.address)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Details */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-medium">{case_.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      <Money value={case_.amount} currency={case_.currency} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <StatusBadge status={case_.status} />
                  </div>
                  {case_.originalCreditor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Creditor:</span>
                      <span className="font-medium">{case_.originalCreditor}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(case_.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
                {case_.description && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium mb-2">Description</h5>
                      <p className="text-sm text-muted-foreground">{case_.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Visualization */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle>Case Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {['new', 'in_progress', 'awaiting_approval', 'legal_stage', 'closed'].map((status, index) => {
                  const isActive = status === case_.status;
                  const isPassed = ['new', 'in_progress', 'awaiting_approval', 'legal_stage', 'closed'].indexOf(case_.status) > index;
                  
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isPassed
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isPassed ? '✓' : index + 1}
                      </div>
                      <span className="text-xs mt-1 text-center max-w-16">
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted"></div>
                <div 
                  className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                  style={{ 
                    width: `${(['new', 'in_progress', 'awaiting_approval', 'legal_stage', 'closed'].indexOf(case_.status) / 4) * 100}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No events recorded yet</p>
                  </div>
                ) : (
                  events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-primary/10 rounded-full">
                          {getEventIcon(event.type)}
                        </div>
                        {index < events.length - 1 && (
                          <div className="h-8 w-0.5 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        {event.metadata && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          {isAssignedAgent && (
            <div className="flex justify-end">
              <ActionLogger caseId={id!} onActionLogged={handleActionLogged} />
            </div>
          )}
          <ActionHistory caseId={id!} refreshTrigger={actionRefreshTrigger} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="card-professional">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents ({documents.length})
              </CardTitle>
              <Button size="sm" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.category} • Uploaded {new Date(doc.createdAt).toLocaleDateString('en-GB')}
                            {doc.retentionDate && (
                              <> • Retention until {new Date(doc.retentionDate).toLocaleDateString('en-GB')}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          v{doc.version}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={message.direction === 'inbound' ? 'default' : 'secondary'}>
                            {message.direction === 'inbound' ? 'From' : 'To'} {message.direction === 'inbound' ? 'Debtor' : 'Debtor'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {message.channel}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.templateId && (
                        <div className="text-xs text-muted-foreground">
                          Template: {message.templateId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Case Conversations List */}
            <div className="lg:col-span-1">
              <ConversationsList
                conversations={caseConversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={(conv) => setSelectedConversation(conv)}
                onCreateConversation={() => {}} // Handled by dialog
                loading={chatLoading}
                className="h-full"
              />
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <ChatInterface
                  conversation={selectedConversation}
                  currentUserId={user?.id || ''}
                  className="h-full"
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium">Case Communication</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a conversation or create a new one for this case
                      </p>
                      <CreateConversationDialog 
                        onCreateConversation={createConversation}
                        caseId={id}
                        trigger={
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Start Case Discussion
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approvals & Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No approvals required yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}