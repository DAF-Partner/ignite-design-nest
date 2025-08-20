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
  debtorAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
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
    debtorAddress: {
      street: '',
      city: '',
      postalCode: '',
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
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Input
                    id="debtorEmail"
                    type="email"
                    value={formData.debtorEmail}
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