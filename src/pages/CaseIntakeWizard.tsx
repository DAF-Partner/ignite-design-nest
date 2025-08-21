// Enhanced GDPR-Aware Case Intake Wizard
// Multi-step form with admin-configurable options, GDPR compliance, and draft saving

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Upload, X, FileText, CheckCircle, 
  Save, Send, Shield, User, Building, Euro, AlertTriangle,
  Plus, Minus, Calendar, Hash, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { 
  CreateCaseIntakeRequest, 
  ServiceLevel, 
  DebtStatus, 
  LawfulBasis, 
  CaseInvoice,
  DebtorType,
  CaseIntakeValidation
} from '@/types';
import { cn } from '@/lib/utils';

interface CaseIntakeFormData {
  // Contract & Service Info
  contractId?: string;
  serviceLevelId: string;
  debtStatusId: string;
  
  // Debtor Info
  debtorName: string;
  debtorType: DebtorType;
  debtorTaxId: string;
  debtorVatId: string;
  debtorEmail: string;
  debtorPhone: string;
  debtorAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  isGdprSubject: boolean;
  lawfulBasisId: string;
  
  // Financials
  currencyCode: string;
  invoices: Array<Omit<CaseInvoice, 'id' | 'caseId' | 'createdAt' | 'updatedAt'>>;
  
  // Case Info
  notes: string;
  
  // Documents (for upload)
  documents: File[];
}

const WIZARD_STEPS = [
  { id: 1, title: 'Contract & Service', description: 'Select contract and service level' },
  { id: 2, title: 'Debtor Information', description: 'Enter debtor details and GDPR info' },
  { id: 3, title: 'Financial Details', description: 'Add invoices and amounts' },
  { id: 4, title: 'Documents', description: 'Upload supporting documents' },
  { id: 5, title: 'Review & Submit', description: 'Review all information' },
];

const COUNTRIES = [
  'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 
  'Belgium', 'Austria', 'Switzerland', 'Poland', 'Czech Republic', 'Other'
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

export default function CaseIntakeWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [validation, setValidation] = useState<CaseIntakeValidation>({ isValid: false, errors: [], warnings: [] });
  
  // Admin-configurable options
  const [serviceLevels, setServiceLevels] = useState<ServiceLevel[]>([]);
  const [debtStatuses, setDebtStatuses] = useState<DebtStatus[]>([]);
  const [lawfulBases, setLawfulBases] = useState<LawfulBasis[]>([]);
  
  const [formData, setFormData] = useState<CaseIntakeFormData>({
    contractId: '',
    serviceLevelId: '',
    debtStatusId: '',
    debtorName: '',
    debtorType: 'individual',
    debtorTaxId: '',
    debtorVatId: '',
    debtorEmail: '',
    debtorPhone: '',
    debtorAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    isGdprSubject: true,
    lawfulBasisId: '',
    currencyCode: 'EUR',
    invoices: [{
      invoiceNumber: '',
      issueDate: '',
      dueDate: '',
      amount: 0,
      vatAmount: 0,
      penalties: 0,
      interest: 0,
      fees: 0,
      currencyCode: 'EUR',
      description: '',
    }],
    notes: '',
    documents: [],
  });

  // Load admin-configurable options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [serviceLevelsResponse, debtStatusesResponse, lawfulBasesResponse] = await Promise.all([
          apiClient.get<ServiceLevel[]>('/admin/service-levels'),
          apiClient.get<DebtStatus[]>('/admin/debt-statuses'),
          apiClient.get<LawfulBasis[]>('/admin/lawful-bases'),
        ]);

        setServiceLevels(serviceLevelsResponse);
        setDebtStatuses(debtStatusesResponse);
        setLawfulBases(lawfulBasesResponse);

        // Set defaults
        const defaultServiceLevel = serviceLevelsResponse.find(sl => sl.isSystemDefault);
        const defaultDebtStatus = debtStatusesResponse.find(ds => ds.isSystemDefault);
        const defaultLawfulBasis = lawfulBasesResponse.find(lb => lb.isSystemDefault);

        setFormData(prev => ({
          ...prev,
          serviceLevelId: defaultServiceLevel?.id || '',
          debtStatusId: defaultDebtStatus?.id || '',
          lawfulBasisId: defaultLawfulBasis?.id || '',
        }));
      } catch (error) {
        console.error('Failed to load configuration options:', error);
        toast({
          title: 'Configuration Error',
          description: 'Failed to load configuration options. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    loadOptions();
  }, [toast]);

  // Auto-set GDPR subject based on debtor type
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isGdprSubject: prev.debtorType === 'individual',
    }));
  }, [formData.debtorType]);

  const updateFormData = (updates: Partial<CaseIntakeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateAddress = (field: keyof CaseIntakeFormData['debtorAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      debtorAddress: {
        ...prev.debtorAddress,
        [field]: value,
      },
    }));
  };

  const addInvoice = () => {
    setFormData(prev => ({
      ...prev,
      invoices: [
        ...prev.invoices,
        {
          invoiceNumber: '',
          issueDate: '',
          dueDate: '',
          amount: 0,
          vatAmount: 0,
          penalties: 0,
          interest: 0,
          fees: 0,
          currencyCode: prev.currencyCode,
          description: '',
        },
      ],
    }));
  };

  const removeInvoice = (index: number) => {
    if (formData.invoices.length > 1) {
      setFormData(prev => ({
        ...prev,
        invoices: prev.invoices.filter((_, i) => i !== index),
      }));
    }
  };

  const updateInvoice = (index: number, field: keyof CaseInvoice, value: any) => {
    setFormData(prev => ({
      ...prev,
      invoices: prev.invoices.map((invoice, i) => 
        i === index ? { ...invoice, [field]: value } : invoice
      ),
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not supported. Use PDF, JPEG, PNG, or DOCX files.`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds 10MB limit.`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1: // Contract & Service
        if (!formData.serviceLevelId) errors.push('Service Level is required');
        if (!formData.debtStatusId) errors.push('Debt Status is required');
        break;
      case 2: // Debtor Information
        if (!formData.debtorName) errors.push('Debtor Name is required');
        if (!formData.debtorEmail) errors.push('Debtor Email is required');
        if (!formData.debtorAddress.city) errors.push('City is required');
        if (!formData.debtorAddress.country) errors.push('Country is required');
        if (formData.isGdprSubject && !formData.lawfulBasisId) {
          errors.push('Lawful Basis is required for GDPR subjects');
        }
        break;
      case 3: // Financial Details
        if (formData.invoices.length === 0) errors.push('At least one invoice is required');
        formData.invoices.forEach((invoice, index) => {
          if (!invoice.invoiceNumber) errors.push(`Invoice ${index + 1}: Invoice Number is required`);
          if (!invoice.issueDate) errors.push(`Invoice ${index + 1}: Issue Date is required`);
          if (!invoice.dueDate) errors.push(`Invoice ${index + 1}: Due Date is required`);
          if (invoice.amount <= 0) errors.push(`Invoice ${index + 1}: Amount must be greater than 0`);
        });
        break;
      case 4: // Documents (optional)
        break;
      case 5: // Review
        break;
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings: [],
    });

    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(5, prev + 1));
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted errors before continuing.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const saveDraft = async () => {
    setIsDraftSaving(true);
    try {
      const request: CreateCaseIntakeRequest = {
        contractId: formData.contractId,
        serviceLevelId: formData.serviceLevelId,
        debtStatusId: formData.debtStatusId,
        debtorName: formData.debtorName,
        debtorType: formData.debtorType,
        debtorTaxId: formData.debtorTaxId || undefined,
        debtorVatId: formData.debtorVatId || undefined,
        debtorEmail: formData.debtorEmail || undefined,
        debtorPhone: formData.debtorPhone || undefined,
        debtorAddress: formData.debtorAddress,
        debtorCountry: formData.debtorAddress.country,
        isGdprSubject: formData.isGdprSubject,
        lawfulBasisId: formData.lawfulBasisId || undefined,
        currencyCode: formData.currencyCode,
        invoices: formData.invoices,
        notes: formData.notes || undefined,
        clientId: user?.clientId || user?.id!,
      };

      await apiClient.post('/case-intakes/draft', request);
      
      toast({
        title: 'Draft Saved',
        description: 'Your case draft has been saved successfully.',
      });
    } catch (error) {
      console.error('Draft save failed:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const request: CreateCaseIntakeRequest = {
        contractId: formData.contractId,
        serviceLevelId: formData.serviceLevelId,
        debtStatusId: formData.debtStatusId,
        debtorName: formData.debtorName,
        debtorType: formData.debtorType,
        debtorTaxId: formData.debtorTaxId || undefined,
        debtorVatId: formData.debtorVatId || undefined,
        debtorEmail: formData.debtorEmail || undefined,
        debtorPhone: formData.debtorPhone || undefined,
        debtorAddress: formData.debtorAddress,
        debtorCountry: formData.debtorAddress.country,
        isGdprSubject: formData.isGdprSubject,
        lawfulBasisId: formData.lawfulBasisId || undefined,
        currencyCode: formData.currencyCode,
        invoices: formData.invoices,
        notes: formData.notes || undefined,
        clientId: user?.clientId || user?.id!,
      };

      const result = await apiClient.post<{ id: string }>('/case-intakes', request);

      // Upload documents if any
      if (formData.documents.length > 0) {
        for (const file of formData.documents) {
          try {
            await apiClient.uploadFile(file);
          } catch (error) {
            console.warn('Document upload failed:', error);
          }
        }
      }

      toast({
        title: 'Case Submitted Successfully',
        description: 'Your case has been submitted for review.',
      });

      navigate(`/case-intakes/${result.id}`);
    } catch (error) {
      console.error('Case submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit case. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = formData.invoices.reduce((sum, invoice) => sum + invoice.amount + invoice.vatAmount + invoice.penalties + invoice.interest + invoice.fees, 0);
  const progress = (currentStep / WIZARD_STEPS.length) * 100;

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
            <h1 className="text-3xl font-bold text-foreground">Create New Case Intake</h1>
            <p className="text-muted-foreground mt-1">
              GDPR-compliant case creation wizard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={isDraftSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isDraftSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {WIZARD_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center text-center min-w-0",
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="max-w-28">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {WIZARD_STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Contract & Service */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contractId">Contract Reference (Optional)</Label>
                  <Input
                    id="contractId"
                    value={formData.contractId}
                    onChange={(e) => updateFormData({ contractId: e.target.value })}
                    placeholder="CONTRACT-2024-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceLevelId" className="required">Service Level *</Label>
                  <Select
                    value={formData.serviceLevelId}
                    onValueChange={(value) => updateFormData({ serviceLevelId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service level" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          <div className="flex flex-col">
                            <span>{level.name}</span>
                            {level.description && (
                              <span className="text-xs text-muted-foreground">{level.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="debtStatusId" className="required">Debt Status *</Label>
                  <Select
                    value={formData.debtStatusId}
                    onValueChange={(value) => updateFormData({ debtStatusId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select debt status" />
                    </SelectTrigger>
                    <SelectContent>
                      {debtStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex flex-col">
                            <span>{status.name}</span>
                            {status.description && (
                              <span className="text-xs text-muted-foreground">{status.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency *</Label>
                  <Select
                    value={formData.currencyCode}
                    onValueChange={(value) => updateFormData({ currencyCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Debtor Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Debtor Type & GDPR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debtorType">Debtor Type *</Label>
                  <Select
                    value={formData.debtorType}
                    onValueChange={(value: DebtorType) => updateFormData({ debtorType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Individual Person
                        </div>
                      </SelectItem>
                      <SelectItem value="company">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Company/Organization
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    GDPR Data Subject
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isGdprSubject}
                      onCheckedChange={(checked) => updateFormData({ isGdprSubject: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.isGdprSubject ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {formData.isGdprSubject && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" />
                      GDPR Protected
                    </Badge>
                  )}
                </div>

                {formData.isGdprSubject && (
                  <div className="space-y-2">
                    <Label htmlFor="lawfulBasisId" className="required">Lawful Basis *</Label>
                    <Select
                      value={formData.lawfulBasisId}
                      onValueChange={(value) => updateFormData({ lawfulBasisId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lawful basis" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawfulBases.map((basis) => (
                          <SelectItem key={basis.id} value={basis.id}>
                            <div className="flex flex-col">
                              <span>{basis.name}</span>
                              {basis.articleReference && (
                                <span className="text-xs text-muted-foreground">{basis.articleReference}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debtorName" className="required">
                    {formData.debtorType === 'individual' ? 'Full Name' : 'Company Name'} *
                  </Label>
                  <Input
                    id="debtorName"
                    value={formData.debtorName}
                    onChange={(e) => updateFormData({ debtorName: e.target.value })}
                    placeholder={formData.debtorType === 'individual' ? 'John Doe' : 'ABC Company Ltd.'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debtorEmail" className="required">Email Address *</Label>
                  <Input
                    id="debtorEmail"
                    type="email"
                    value={formData.debtorEmail}
                    onChange={(e) => updateFormData({ debtorEmail: e.target.value })}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debtorPhone">Phone Number</Label>
                  <Input
                    id="debtorPhone"
                    value={formData.debtorPhone}
                    onChange={(e) => updateFormData({ debtorPhone: e.target.value })}
                    placeholder="+49 123 456 7890"
                  />
                </div>

                {formData.debtorType === 'individual' ? (
                  <div className="space-y-2">
                    <Label htmlFor="debtorTaxId">Tax ID / Social Security</Label>
                    <Input
                      id="debtorTaxId"
                      value={formData.debtorTaxId}
                      onChange={(e) => updateFormData({ debtorTaxId: e.target.value })}
                      placeholder="Tax identification number"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="debtorTaxId">Tax Number</Label>
                      <Input
                        id="debtorTaxId"
                        value={formData.debtorTaxId}
                        onChange={(e) => updateFormData({ debtorTaxId: e.target.value })}
                        placeholder="Tax number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debtorVatId">VAT ID</Label>
                      <Input
                        id="debtorVatId"
                        value={formData.debtorVatId}
                        onChange={(e) => updateFormData({ debtorVatId: e.target.value })}
                        placeholder="VAT identification number"
                      />
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-medium">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.debtorAddress.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="required">City *</Label>
                    <Input
                      id="city"
                      value={formData.debtorAddress.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      placeholder="Berlin"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.debtorAddress.postalCode}
                      onChange={(e) => updateAddress('postalCode', e.target.value)}
                      placeholder="10115"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="required">Country *</Label>
                    <Select
                      value={formData.debtorAddress.country}
                      onValueChange={(value) => updateAddress('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Invoice Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInvoice}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Invoice
                </Button>
              </div>

              {formData.invoices.map((invoice, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Invoice #{index + 1}</h4>
                    {formData.invoices.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoice(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`invoiceNumber-${index}`} className="required">Invoice Number *</Label>
                      <Input
                        id={`invoiceNumber-${index}`}
                        value={invoice.invoiceNumber}
                        onChange={(e) => updateInvoice(index, 'invoiceNumber', e.target.value)}
                        placeholder="INV-2024-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`issueDate-${index}`} className="required">Issue Date *</Label>
                      <Input
                        id={`issueDate-${index}`}
                        type="date"
                        value={invoice.issueDate}
                        onChange={(e) => updateInvoice(index, 'issueDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`dueDate-${index}`} className="required">Due Date *</Label>
                      <Input
                        id={`dueDate-${index}`}
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) => updateInvoice(index, 'dueDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${index}`} className="required">Amount *</Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoice.amount}
                        onChange={(e) => updateInvoice(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="1000.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`vatAmount-${index}`}>VAT Amount</Label>
                      <Input
                        id={`vatAmount-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoice.vatAmount}
                        onChange={(e) => updateInvoice(index, 'vatAmount', parseFloat(e.target.value) || 0)}
                        placeholder="190.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`penalties-${index}`}>Penalties</Label>
                      <Input
                        id={`penalties-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoice.penalties}
                        onChange={(e) => updateInvoice(index, 'penalties', parseFloat(e.target.value) || 0)}
                        placeholder="50.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`interest-${index}`}>Interest</Label>
                      <Input
                        id={`interest-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoice.interest}
                        onChange={(e) => updateInvoice(index, 'interest', parseFloat(e.target.value) || 0)}
                        placeholder="25.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`fees-${index}`}>Fees</Label>
                      <Input
                        id={`fees-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoice.fees}
                        onChange={(e) => updateInvoice(index, 'fees', parseFloat(e.target.value) || 0)}
                        placeholder="75.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={invoice.description}
                      onChange={(e) => updateInvoice(index, 'description', e.target.value)}
                      placeholder="Invoice description..."
                      rows={2}
                    />
                  </div>

                  {/* Invoice Total */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>Invoice Total:</span>
                      <span className="text-lg">
                        {new Intl.NumberFormat('en-DE', {
                          style: 'currency',
                          currency: formData.currencyCode,
                        }).format(
                          invoice.amount + invoice.vatAmount + invoice.penalties + invoice.interest + invoice.fees
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Grand Total */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      <span className="font-medium text-lg">Total Case Amount:</span>
                    </div>
                    <span className="font-bold text-2xl">
                      {new Intl.NumberFormat('en-DE', {
                        style: 'currency',
                        currency: formData.currencyCode,
                      }).format(totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Upload Supporting Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload invoices, contracts, correspondence, or other evidence
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="max-w-xs mx-auto"
                />
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Uploaded Documents</h4>
                  {formData.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Service & Contract Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service & Contract Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.contractId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-medium">{formData.contractId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Level:</span>
                    <span className="font-medium">
                      {serviceLevels.find(sl => sl.id === formData.serviceLevelId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Debt Status:</span>
                    <span className="font-medium">
                      {debtStatuses.find(ds => ds.id === formData.debtStatusId)?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Debtor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Debtor Information
                    {formData.isGdprSubject && (
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
                    <span className="font-medium">{formData.debtorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{formData.debtorType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{formData.debtorEmail}</span>
                  </div>
                  {formData.debtorPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{formData.debtorPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right">
                      {[
                        formData.debtorAddress.street,
                        formData.debtorAddress.city,
                        formData.debtorAddress.postalCode,
                        formData.debtorAddress.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  {formData.isGdprSubject && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lawful Basis:</span>
                      <span className="font-medium">
                        {lawfulBases.find(lb => lb.id === formData.lawfulBasisId)?.name}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{formData.currencyCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Invoices:</span>
                      <span className="font-medium">{formData.invoices.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>
                        {new Intl.NumberFormat('en-DE', {
                          style: 'currency',
                          currency: formData.currencyCode,
                        }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              {formData.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents ({formData.documents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {formData.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formData.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Case Notes Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    placeholder="Add any additional notes or comments about this case..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {currentStep === 5 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !validation.isValid}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}