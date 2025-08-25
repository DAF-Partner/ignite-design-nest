<<<<<<< HEAD

// Professional Case Creation Form for B2B Debt Collection Platform
// GDPR-compliant intake form with comprehensive validation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Country list for address validation
const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
];

interface FormData {
  reference: string;
  debtorName: string;
  debtorEmail: string;
  debtorPhone: string;
  debtorType: 'individual' | 'business';
  debtorVatId: string;
  debtorTaxId: string;
=======
// Professional Case Creation Wizard for B2B Debt Collection Platform
// Multi-step form with debtor details, amount, currency, and document upload

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { CreateCaseRequest, Document } from '@/types';
import { cn } from '@/lib/utils';

interface CaseFormData {
  // Debtor Details
  debtorName: string;
  debtorEmail: string;
  debtorPhone: string;
>>>>>>> f6345c3 (Initial project upload)
  debtorAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
<<<<<<< HEAD
  totalAmount: string;
  currencyCode: string;
  description: string;
  contractId: string;
  isGdprSubject: boolean;
}

export default function CaseNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    reference: '',
    debtorName: '',
    debtorEmail: '',
    debtorPhone: '',
    debtorType: 'individual',
    debtorVatId: '',
    debtorTaxId: '',
=======
  
  // Case Details
  amount: string;
  currency: string;
  description: string;
  reference: string;
  originalCreditor: string;
  
  // Documents
  documents: File[];
}

const STEPS = [
  { id: 1, title: 'Debtor Details', description: 'Enter debtor information' },
  { id: 2, title: 'Case Details', description: 'Amount and reference details' },
  { id: 3, title: 'Documents', description: 'Upload supporting documents' },
  { id: 4, title: 'Review', description: 'Confirm case details' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

const COUNTRIES = [
  'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 
  'Belgium', 'Austria', 'Switzerland', 'Poland', 'Czech Republic', 'Other'
];

export default function CaseNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CaseFormData>({
    debtorName: '',
    debtorEmail: '',
    debtorPhone: '',
>>>>>>> f6345c3 (Initial project upload)
    debtorAddress: {
      street: '',
      city: '',
      postalCode: '',
<<<<<<< HEAD
      country: 'DE',
    },
    totalAmount: '',
    currencyCode: 'EUR',
    description: '',
    contractId: '',
    isGdprSubject: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate reference number on mount
  useEffect(() => {
    const generateReference = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `CASE-${timestamp}-${random}`;
    };

    setFormData(prev => ({
      ...prev,
      reference: generateReference()
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.reference.trim()) newErrors.reference = 'Reference is required';
    if (!formData.debtorName.trim()) newErrors.debtorName = 'Debtor name is required';
    if (!formData.debtorEmail.trim()) newErrors.debtorEmail = 'Debtor email is required';
    if (!formData.totalAmount.trim()) newErrors.totalAmount = 'Amount is required';
    if (!formData.debtorAddress.city.trim()) newErrors['debtorAddress.city'] = 'City is required';
    if (!formData.debtorAddress.country.trim()) newErrors['debtorAddress.country'] = 'Country is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.debtorEmail && !emailRegex.test(formData.debtorEmail)) {
      newErrors.debtorEmail = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (formData.debtorPhone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.debtorPhone)) {
      newErrors.debtorPhone = 'Please enter a valid phone number';
    }

    // Amount validation
    if (formData.totalAmount) {
      const amount = parseFloat(formData.totalAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.totalAmount = 'Please enter a valid amount greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a case');
      return;
    }

    setIsSubmitting(true);

    try {
      const caseData = {
        reference: formData.reference,
        client_id: user.id,
        created_by: user.id,
        debtor_name: formData.debtorName,
        debtor_email: formData.debtorEmail,
        debtor_phone: formData.debtorPhone || null,
        debtor_type: formData.debtorType,
        debtor_vat_id: formData.debtorVatId || null,
        debtor_tax_id: formData.debtorTaxId || null,
        debtor_address: formData.debtorAddress,
        debtor_country: formData.debtorAddress.country,
        total_amount: parseFloat(formData.totalAmount),
        currency_code: formData.currencyCode,
        notes: formData.description || null,
        contract_id: formData.contractId || null,
        is_gdpr_subject: formData.isGdprSubject,
        status: 'draft',
      };

      const { data, error } = await supabase
        .from('case_intakes')
        .insert(caseData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      toast.success('Case created successfully');
      navigate(`/cases/${data.id}`);
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create case');
=======
      country: '',
    },
    amount: '',
    currency: 'EUR',
    description: '',
    reference: '',
    originalCreditor: '',
    documents: [],
  });

  const updateFormData = (updates: Partial<CaseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateAddress = (field: keyof CaseFormData['debtorAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      debtorAddress: {
        ...prev.debtorAddress,
        [field]: value,
      },
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
          description: `${file.name} is not a supported file type. Please use PDF, JPEG, PNG, or DOCX files.`,
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.debtorName && formData.debtorEmail && formData.debtorAddress.city && formData.debtorAddress.country);
      case 2:
        return !!(formData.amount && formData.currency && formData.reference);
      case 3:
        return true; // Documents are optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Create case request
      const caseRequest: CreateCaseRequest = {
        debtor: {
          name: formData.debtorName,
          email: formData.debtorEmail,
          phone: formData.debtorPhone,
          address: formData.debtorAddress,
        },
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        reference: formData.reference,
        originalCreditor: formData.originalCreditor,
        clientId: user?.clientId || user?.id!,
      };

      // Create the case
      const newCase = await apiClient.post<{ id: string }>('/cases', caseRequest);

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
        title: 'Case Created Successfully',
        description: `Case ${formData.reference} has been created and is now being processed.`,
      });

      navigate(`/cases/${newCase.id}`);
    } catch (error) {
      console.error('Case creation failed:', error);
      toast({
        title: 'Case Creation Failed',
        description: 'There was an error creating the case. Please try again.',
        variant: 'destructive',
      });
>>>>>>> f6345c3 (Initial project upload)
    } finally {
      setIsSubmitting(false);
    }
  };

<<<<<<< HEAD
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <RoleGuard allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Create New Case</h1>
            <p className="text-muted-foreground">Enter case details for debt collection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Information */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference">Case Reference <span className="text-destructive">*</span></Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="CASE-123456-ABC"
                    className={errors.reference ? 'border-destructive' : ''}
                  />
                  {errors.reference && (
                    <p className="text-sm text-destructive mt-1">{errors.reference}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contractId">Contract ID</Label>
                  <Input
                    id="contractId"
                    value={formData.contractId}
                    onChange={(e) => handleInputChange('contractId', e.target.value)}
                    placeholder="Optional contract reference"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional case details or context"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Debtor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Debtor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debtorName">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="debtorName"
                    value={formData.debtorName}
                    onChange={(e) => handleInputChange('debtorName', e.target.value)}
                    placeholder="John Doe"
                    className={errors.debtorName ? 'border-destructive' : ''}
                  />
                  {errors.debtorName && (
                    <p className="text-sm text-destructive mt-1">{errors.debtorName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="debtorType">Debtor Type</Label>
                  <Select
                    value={formData.debtorType}
                    onValueChange={(value: 'individual' | 'business') => handleInputChange('debtorType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debtorEmail">Email Address <span className="text-destructive">*</span></Label>
=======
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-foreground">Create New Case</h1>
          <p className="text-muted-foreground mt-1">
            Follow the steps to create a new debt collection case
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center text-center",
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
                <div className="max-w-24">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Debtor Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field">
                  <Label htmlFor="debtorName" className="form-label required">
                    Debtor Name
                  </Label>
                  <Input
                    id="debtorName"
                    value={formData.debtorName}
                    onChange={(e) => updateFormData({ debtorName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="debtorEmail" className="form-label required">
                    Email Address
                  </Label>
>>>>>>> f6345c3 (Initial project upload)
                  <Input
                    id="debtorEmail"
                    type="email"
                    value={formData.debtorEmail}
<<<<<<< HEAD
                    onChange={(e) => handleInputChange('debtorEmail', e.target.value)}
                    placeholder="john.doe@example.com"
                    className={errors.debtorEmail ? 'border-destructive' : ''}
                  />
                  {errors.debtorEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.debtorEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="debtorPhone">Phone Number</Label>
                  <Input
                    id="debtorPhone"
                    value={formData.debtorPhone}
                    onChange={(e) => handleInputChange('debtorPhone', e.target.value)}
                    placeholder="+49 123 456 7890"
                    className={errors.debtorPhone ? 'border-destructive' : ''}
                  />
                  {errors.debtorPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.debtorPhone}</p>
                  )}
                </div>
              </div>

              {formData.debtorType === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debtorVatId">VAT ID</Label>
                    <Input
                      id="debtorVatId"
                      value={formData.debtorVatId}
                      onChange={(e) => handleInputChange('debtorVatId', e.target.value)}
                      placeholder="DE123456789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="debtorTaxId">Tax ID</Label>
                    <Input
                      id="debtorTaxId"
                      value={formData.debtorTaxId}
                      onChange={(e) => handleInputChange('debtorTaxId', e.target.value)}
                      placeholder="123/456/78910"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.debtorAddress.street}
                  onChange={(e) => handleInputChange('debtorAddress.street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input
                    id="city"
                    value={formData.debtorAddress.city}
                    onChange={(e) => handleInputChange('debtorAddress.city', e.target.value)}
                    placeholder="Berlin"
                    className={errors['debtorAddress.city'] ? 'border-destructive' : ''}
                  />
                  {errors['debtorAddress.city'] && (
                    <p className="text-sm text-destructive mt-1">{errors['debtorAddress.city']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.debtorAddress.postalCode}
                    onChange={(e) => handleInputChange('debtorAddress.postalCode', e.target.value)}
                    placeholder="10115"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.debtorAddress.country}
                    onValueChange={(value) => handleInputChange('debtorAddress.country', value)}
                  >
                    <SelectTrigger className={errors['debtorAddress.country'] ? 'border-destructive' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['debtorAddress.country'] && (
                    <p className="text-sm text-destructive mt-1">{errors['debtorAddress.country']}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount <span className="text-destructive">*</span></Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    placeholder="1000.00"
                    className={errors.totalAmount ? 'border-destructive' : ''}
                  />
                  {errors.totalAmount && (
                    <p className="text-sm text-destructive mt-1">{errors.totalAmount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currencyCode">Currency</Label>
                  <Select
                    value={formData.currencyCode}
                    onValueChange={(value) => handleInputChange('currencyCode', value)}
=======
                    onChange={(e) => updateFormData({ debtorEmail: e.target.value })}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <Label htmlFor="debtorPhone" className="form-label">
                  Phone Number
                </Label>
                <Input
                  id="debtorPhone"
                  value={formData.debtorPhone}
                  onChange={(e) => updateFormData({ debtorPhone: e.target.value })}
                  placeholder="+49 123 456 7890"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Address Information</h3>
                <div className="form-field">
                  <Label htmlFor="street" className="form-label">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    value={formData.debtorAddress.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-field">
                    <Label htmlFor="city" className="form-label required">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.debtorAddress.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      placeholder="Berlin"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="postalCode" className="form-label">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.debtorAddress.postalCode}
                      onChange={(e) => updateAddress('postalCode', e.target.value)}
                      placeholder="10115"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="country" className="form-label required">
                      Country
                    </Label>
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

          {/* Step 2: Case Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-field">
                  <Label htmlFor="amount" className="form-label required">
                    Debt Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => updateFormData({ amount: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="currency" className="form-label required">
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => updateFormData({ currency: value })}
>>>>>>> f6345c3 (Initial project upload)
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
<<<<<<< HEAD
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name}
=======
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name}
>>>>>>> f6345c3 (Initial project upload)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
<<<<<<< HEAD
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="isGdprSubject"
                  checked={formData.isGdprSubject}
                  onCheckedChange={(checked) => handleInputChange('isGdprSubject', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="isGdprSubject"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    GDPR Subject
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Check this if the debtor is subject to GDPR regulations (EU residents).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cases')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Case
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
=======

              <div className="form-field">
                <Label htmlFor="reference" className="form-label required">
                  Case Reference
                </Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => updateFormData({ reference: e.target.value })}
                  placeholder="INV-2024-001"
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="originalCreditor" className="form-label">
                  Original Creditor
                </Label>
                <Input
                  id="originalCreditor"
                  value={formData.originalCreditor}
                  onChange={(e) => updateFormData({ originalCreditor: e.target.value })}
                  placeholder="ABC Company Ltd."
                />
              </div>

              <div className="form-field">
                <Label htmlFor="description" className="form-label">
                  Case Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Brief description of the debt and circumstances..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-4">
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
                  className="hidden"
                  id="fileUpload"
                />
                <Label htmlFor="fileUpload" className="cursor-pointer">
                  <Button type="button" variant="outline">
                    Choose Files
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF, JPEG, PNG, DOCX (max 10MB each)
                </p>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Documents</h4>
                  {formData.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="font-medium">Review Case Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">DEBTOR INFORMATION</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {formData.debtorName}</div>
                      <div><strong>Email:</strong> {formData.debtorEmail}</div>
                      {formData.debtorPhone && <div><strong>Phone:</strong> {formData.debtorPhone}</div>}
                      <div><strong>Address:</strong> {[
                        formData.debtorAddress.street,
                        formData.debtorAddress.city,
                        formData.debtorAddress.postalCode,
                        formData.debtorAddress.country
                      ].filter(Boolean).join(', ')}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">CASE INFORMATION</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Amount:</strong> {CURRENCIES.find(c => c.code === formData.currency)?.symbol}{formData.amount}</div>
                      <div><strong>Reference:</strong> {formData.reference}</div>
                      {formData.originalCreditor && <div><strong>Original Creditor:</strong> {formData.originalCreditor}</div>}
                      {formData.description && <div><strong>Description:</strong> {formData.description}</div>}
                    </div>
                  </div>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">DOCUMENTS ({formData.documents.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.documents.map((file, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  <strong>Note:</strong> Once created, this case will be assigned to an available agent and collection activities will begin according to your service agreement.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? 'Creating Case...' : 'Create Case'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
>>>>>>> f6345c3 (Initial project upload)
