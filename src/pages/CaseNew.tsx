
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
  debtorAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
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
    debtorAddress: {
      street: '',
      city: '',
      postalCode: '',
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
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Input
                    id="debtorEmail"
                    type="email"
                    value={formData.debtorEmail}
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
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
