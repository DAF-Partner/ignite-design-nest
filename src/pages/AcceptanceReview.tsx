// Case Acceptance Review Screen for Agents/Managers/Admins
// Provides validation checklist and acceptance workflow

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, 
  FileText, User, Euro, Calendar, MessageSquare,
  Send, Shield, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CaseIntake, AcceptanceReview as AcceptanceReviewType, User as UserType } from '@/types';
import { cn } from '@/lib/utils';

interface ValidationCheckItem {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isValid: boolean;
}

interface AcceptanceReviewFormData {
  action: 'accept' | 'reject' | 'request_fixes';
  reviewNotes: string;
  rejectionReason: string;
  fixesRequired: string[];
  assignedAgentId: string;
}

export default function AcceptanceReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  
  const [caseIntake, setCaseIntake] = useState<CaseIntake | null>(null);
  const [agents, setAgents] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AcceptanceReviewFormData>({
    action: 'accept',
    reviewNotes: '',
    rejectionReason: '',
    fixesRequired: [],
    assignedAgentId: '',
  });

  // Validation checklist
  const [validationChecks, setValidationChecks] = useState<ValidationCheckItem[]>([
    { id: 'service_level', title: 'Service Level Selected', description: 'Valid service level is chosen', isRequired: true, isValid: false },
    { id: 'debt_status', title: 'Debt Status Selected', description: 'Debt status is specified', isRequired: true, isValid: false },
    { id: 'debtor_info', title: 'Debtor Information Complete', description: 'Name, email, and address provided', isRequired: true, isValid: false },
    { id: 'gdpr_compliance', title: 'GDPR Compliance', description: 'GDPR status and lawful basis if required', isRequired: true, isValid: false },
    { id: 'invoices_present', title: 'Invoices Present', description: 'At least one invoice with valid data', isRequired: true, isValid: false },
    { id: 'financial_data', title: 'Financial Data Valid', description: 'Amounts are positive and dates are valid', isRequired: true, isValid: false },
    { id: 'documents_uploaded', title: 'Supporting Documents', description: 'Relevant documents are uploaded', isRequired: false, isValid: false },
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Load case intake and agents in parallel
        const [caseResponse, agentsResponse] = await Promise.all([
          apiClient.get<CaseIntake>(`/case-intakes/${id}`),
          apiClient.get<UserType[]>('/users?role=AGENT&isActive=true'),
        ]);

        setCaseIntake(caseResponse);
        setAgents(agentsResponse);
        
        // Perform validation checks
        performValidationChecks(caseResponse);
        
      } catch (error) {
        console.error('Failed to load case intake:', error);
        toast({
          title: 'Error',
          description: 'Failed to load case intake details.',
          variant: 'destructive',
        });
        navigate('/case-intakes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const performValidationChecks = (intake: CaseIntake) => {
    const updatedChecks = validationChecks.map(check => {
      let isValid = false;
      
      switch (check.id) {
        case 'service_level':
          isValid = !!intake.serviceLevelId;
          break;
        case 'debt_status':
          isValid = !!intake.debtStatusId;
          break;
        case 'debtor_info':
          isValid = !!(intake.debtorName && intake.debtorEmail && intake.debtorAddress?.city && intake.debtorAddress?.country);
          break;
        case 'gdpr_compliance':
          isValid = !intake.isGdprSubject || !!intake.lawfulBasisId;
          break;
        case 'invoices_present':
          isValid = (intake.invoices?.length || 0) > 0;
          break;
        case 'financial_data':
          isValid = intake.invoices?.every(inv => 
            inv.amount > 0 && 
            inv.invoiceNumber && 
            inv.issueDate && 
            inv.dueDate
          ) || false;
          break;
        case 'documents_uploaded':
          isValid = true; // Optional check, always passes
          break;
      }
      
      return { ...check, isValid };
    });
    
    setValidationChecks(updatedChecks);
  };

  const updateFormData = (updates: Partial<AcceptanceReviewFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleFixRequired = (fix: string) => {
    setFormData(prev => ({
      ...prev,
      fixesRequired: prev.fixesRequired.includes(fix)
        ? prev.fixesRequired.filter(f => f !== fix)
        : [...prev.fixesRequired, fix],
    }));
  };

  const canSubmit = () => {
    const requiredChecksPass = validationChecks.filter(c => c.isRequired).every(c => c.isValid);
    
    switch (formData.action) {
      case 'accept':
        return requiredChecksPass && !!formData.assignedAgentId;
      case 'reject':
        return !!formData.rejectionReason.trim();
      case 'request_fixes':
        return formData.fixesRequired.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !caseIntake) return;

    setIsSubmitting(true);
    try {
      const reviewData: AcceptanceReviewType = {
        caseId: caseIntake.id,
        action: formData.action,
        reviewNotes: formData.reviewNotes || undefined,
        rejectionReason: formData.rejectionReason || undefined,
        fixesRequired: formData.fixesRequired.length > 0 ? formData.fixesRequired : undefined,
        assignedAgentId: formData.assignedAgentId || undefined,
      };

      await apiClient.post(`/case-intakes/${caseIntake.id}/review`, reviewData);

      const actionMessages = {
        accept: 'Case has been accepted and assigned to an agent.',
        reject: 'Case has been rejected and the client will be notified.',
        request_fixes: 'Fix requests have been sent to the client.',
      };

      toast({
        title: 'Review Completed',
        description: actionMessages[formData.action],
      });

      navigate('/case-intakes');
    } catch (error) {
      console.error('Review submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!caseIntake) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Case Not Found</h2>
          <p className="text-muted-foreground">
            The case intake you're looking for doesn't exist or you don't have permission to review it.
          </p>
          <Button onClick={() => navigate('/case-intakes')}>
            Back to Case Intakes
          </Button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!hasRole(['AGENT', 'ADMIN'])) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to review case intakes.
          </p>
          <Button onClick={() => navigate('/case-intakes')}>
            Back to Case Intakes
          </Button>
        </div>
      </div>
    );
  }

  const failedRequiredChecks = validationChecks.filter(c => c.isRequired && !c.isValid);
  const totalAmount = caseIntake.invoices?.reduce((sum, inv) => 
    sum + inv.amount + inv.vatAmount + inv.penalties + inv.interest + inv.fees, 0
  ) || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'under_review': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case-intakes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Case Intakes
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{caseIntake.reference}</h1>
              <Badge 
                variant={caseIntake.status === 'submitted' ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                {getStatusIcon(caseIntake.status)}
                {caseIntake.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Acceptance Review - Submitted {new Date(caseIntake.submittedAt!).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Overview */}
        <div className="space-y-6">
          {/* Case Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service Level</p>
                  <p className="font-medium">{caseIntake.serviceLevel?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Debt Status</p>
                  <p className="font-medium">{caseIntake.debtStatus?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{caseIntake.currencyCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg">
                    {new Intl.NumberFormat('en-DE', {
                      style: 'currency',
                      currency: caseIntake.currencyCode,
                    }).format(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debtor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {caseIntake.debtorType === 'individual' ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Building className="h-5 w-5" />
                )}
                Debtor Information
                {caseIntake.isGdprSubject && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    GDPR Protected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{caseIntake.debtorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{caseIntake.debtorType}</span>
              </div>
              {caseIntake.debtorEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{caseIntake.debtorEmail}</span>
                </div>
              )}
              {caseIntake.debtorPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{caseIntake.debtorPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium text-right max-w-xs">
                  {[
                    caseIntake.debtorAddress?.street,
                    caseIntake.debtorAddress?.city,
                    caseIntake.debtorAddress?.postalCode,
                    caseIntake.debtorAddress?.country
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
              {caseIntake.isGdprSubject && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lawful Basis:</span>
                  <span className="font-medium">{caseIntake.lawfulBasis?.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Invoices ({caseIntake.invoices?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {caseIntake.invoices?.map((invoice, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('en-DE', {
                          style: 'currency',
                          currency: invoice.currencyCode,
                        }).format(
                          invoice.amount + invoice.vatAmount + invoice.penalties + 
                          invoice.interest + invoice.fees
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Issue: {new Date(invoice.issueDate).toLocaleDateString()} • 
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                    {invoice.description && (
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    )}
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Validation Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Validation Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationChecks.map((check) => (
                  <div
                    key={check.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      check.isValid 
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                        : check.isRequired
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        : "bg-muted/50"
                    )}
                  >
                    <div className="mt-0.5">
                      {check.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : check.isRequired ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{check.title}</span>
                        {check.isRequired && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{check.description}</p>
                    </div>
                  </div>
                ))}
                
                {failedRequiredChecks.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {failedRequiredChecks.length} required check{failedRequiredChecks.length > 1 ? 's' : ''} failed. 
                      Case cannot be accepted until all required checks pass.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Action */}
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Selection */}
              <div className="space-y-3">
                <Label>Review Action</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value: 'accept' | 'reject' | 'request_fixes') => 
                    updateFormData({ action: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      value="accept" 
                      disabled={failedRequiredChecks.length > 0}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Accept Case
                      </div>
                    </SelectItem>
                    <SelectItem value="request_fixes">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Request Fixes
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Reject Case
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Agent Assignment for Accept */}
              {formData.action === 'accept' && (
                <div className="space-y-2">
                  <Label htmlFor="assignedAgentId" className="required">Assign to Agent *</Label>
                  <Select
                    value={formData.assignedAgentId}
                    onValueChange={(value) => updateFormData({ assignedAgentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Rejection Reason */}
              {formData.action === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason" className="required">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={formData.rejectionReason}
                    onChange={(e) => updateFormData({ rejectionReason: e.target.value })}
                    placeholder="Explain why this case is being rejected..."
                    rows={3}
                  />
                </div>
              )}

              {/* Fixes Required */}
              {formData.action === 'request_fixes' && (
                <div className="space-y-3">
                  <Label>Issues to Fix</Label>
                  <div className="space-y-2">
                    {failedRequiredChecks.map((check) => (
                      <div key={check.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fix-${check.id}`}
                          checked={formData.fixesRequired.includes(check.title)}
                          onCheckedChange={() => toggleFixRequired(check.title)}
                        />
                        <label
                          htmlFor={`fix-${check.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {check.title}
                        </label>
                      </div>
                    ))}
                    
                    {/* Custom fixes */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fix-documents"
                        checked={formData.fixesRequired.includes('Upload supporting documents')}
                        onCheckedChange={() => toggleFixRequired('Upload supporting documents')}
                      />
                      <label htmlFor="fix-documents" className="text-sm font-medium">
                        Upload supporting documents
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fix-clarify"
                        checked={formData.fixesRequired.includes('Clarify case details')}
                        onCheckedChange={() => toggleFixRequired('Clarify case details')}
                      />
                      <label htmlFor="fix-clarify" className="text-sm font-medium">
                        Clarify case details
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Additional Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={formData.reviewNotes}
                  onChange={(e) => updateFormData({ reviewNotes: e.target.value })}
                  placeholder="Add any additional comments for the client or internal team..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="w-full flex items-center gap-2"
                variant={formData.action === 'reject' ? 'destructive' : 'default'}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : `${
                  formData.action === 'accept' ? 'Accept & Assign' :
                  formData.action === 'reject' ? 'Reject Case' :
                  'Request Fixes'
                }`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}