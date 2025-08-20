// Professional Tariff Management Page for B2B Debt Collection Platform
// Complete pricing structure management with flexible rate configurations

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calculator,
  Plus,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Search,
  FileText,
  BarChart3,
  TrendingUp,
  Settings,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Money } from '@/components/ui/money';

import type { Tariff, TariffTier } from '@/types';

const mockTariffs: Tariff[] = [
  {
    id: 'tariff_1',
    name: 'Standard Collection',
    description: 'Basic debt collection service for standard commercial debts',
    type: 'percentage',
    percentage: 25.0,
    fixedFee: 0,
    minimumFee: 50.00,
    maximumFee: 5000.00,
    currency: 'GBP',
    clauseText: 'Collection fee of 25% of the outstanding amount, minimum £50, maximum £5000.',
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'tariff_2', 
    name: 'Premium Recovery',
    description: 'Enhanced collection service with legal escalation support',
    type: 'tiered',
    tiers: [
      { minAmount: 0, maxAmount: 1000, percentage: 30.0 },
      { minAmount: 1000, maxAmount: 5000, percentage: 25.0 },
      { minAmount: 5000, maxAmount: null, percentage: 20.0 }
    ],
    fixedFee: 100.00,
    minimumFee: 150.00,
    maximumFee: 10000.00,
    currency: 'GBP',
    clauseText: 'Tiered collection fee: 30% for first £1000, 25% for £1000-£5000, 20% above £5000. Fixed fee £100.',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z'
  },
  {
    id: 'tariff_3',
    name: 'Fixed Rate Service',
    description: 'Fixed fee structure for predictable costs',
    type: 'fixed',
    percentage: 0,
    fixedFee: 500.00,
    minimumFee: 500.00,
    maximumFee: 500.00,
    currency: 'GBP',
    clauseText: 'Fixed collection fee of £500 regardless of claim amount.',
    isActive: false,
    createdAt: '2024-03-10T11:30:00Z',
    updatedAt: '2024-09-15T13:20:00Z'
  }
];

interface TariffFormData {
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  percentage: number;
  fixedFee: number;
  minimumFee: number;
  maximumFee: number;
  currency: string;
  isActive: boolean;
  tiers?: TariffTier[];
}

export default function Tariffs() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [filteredTariffs, setFilteredTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [showTariffDialog, setShowTariffDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<TariffFormData>({
    name: '',
    description: '',
    type: 'percentage',
    percentage: 0,
    fixedFee: 0,
    minimumFee: 0,
    maximumFee: 0,
    currency: 'GBP',
    isActive: true,
    tiers: []
  });
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load tariffs data
  useEffect(() => {
    setTariffs(mockTariffs);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...tariffs];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tariff => tariff.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(tariff => tariff.isActive === isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tariff => 
        tariff.name.toLowerCase().includes(query) ||
        tariff.description.toLowerCase().includes(query)
      );
    }

    // Sort by last updated (newest first)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    setFilteredTariffs(filtered);
  }, [tariffs, typeFilter, statusFilter, searchQuery]);

  const handleCreateTariff = () => {
    setSelectedTariff(null);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      percentage: 25,
      fixedFee: 0,
      minimumFee: 50,
      maximumFee: 5000,
      currency: 'GBP',
      isActive: true,
      tiers: []
    });
    setShowTariffDialog(true);
  };

  const handleEditTariff = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setIsEditing(true);
    setFormData({
      name: tariff.name,
      description: tariff.description,
      type: tariff.type,
      percentage: tariff.percentage || 0,
      fixedFee: tariff.fixedFee || 0,
      minimumFee: tariff.minimumFee || 0,
      maximumFee: tariff.maximumFee || 0,
      currency: tariff.currency,
      isActive: tariff.isActive,
      tiers: tariff.tiers || []
    });
    setShowTariffDialog(true);
  };

  const handleSaveTariff = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const tariffData = {
      ...formData,
      id: selectedTariff?.id || `tariff_${Date.now()}`,
      createdAt: selectedTariff?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      setTariffs(tariffs.map(tariff => 
        tariff.id === selectedTariff?.id 
          ? { ...tariff, ...tariffData }
          : tariff
      ));
      
      toast({
        title: 'Tariff Updated',
        description: `${tariffData.name} has been updated successfully.`
      });
    } else {
      setTariffs([tariffData as Tariff, ...tariffs]);
      
      toast({
        title: 'Tariff Created',
        description: `${tariffData.name} has been created successfully.`
      });
    }

    setShowTariffDialog(false);
  };

  const handleDeleteTariff = async () => {
    if (selectedTariff) {
      setTariffs(tariffs.filter(tariff => tariff.id !== selectedTariff.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: 'Tariff Deleted',
        description: `${selectedTariff.name} has been permanently deleted.`
      });
    }
  };

  const handleDuplicateTariff = (tariff: Tariff) => {
    const duplicatedTariff = {
      ...tariff,
      id: `tariff_${Date.now()}`,
      name: `${tariff.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTariffs([duplicatedTariff, ...tariffs]);
    
    toast({
      title: 'Tariff Duplicated',
      description: `${duplicatedTariff.name} has been created.`
    });
  };

  const addTier = () => {
    setFormData({
      ...formData,
      tiers: [...(formData.tiers || []), { minAmount: 0, maxAmount: null, percentage: 25 }]
    });
  };

  const removeTier = (index: number) => {
    setFormData({
      ...formData,
      tiers: formData.tiers?.filter((_, i) => i !== index)
    });
  };

  const updateTier = (index: number, field: string, value: any) => {
    const updatedTiers = [...(formData.tiers || [])];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setFormData({ ...formData, tiers: updatedTiers });
  };

  const calculateFee = (amount: number, tariff: Tariff) => {
    let calculatedFee = 0;
    
    switch (tariff.type) {
      case 'fixed':
        calculatedFee = tariff.fixedFee || 0;
        break;
      case 'percentage':
        calculatedFee = (amount * (tariff.percentage || 0)) / 100;
        break;
      case 'tiered':
        if (tariff.tiers) {
          for (const tier of tariff.tiers) {
            if (amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)) {
              calculatedFee = (amount * tier.percentage) / 100;
              break;
            }
          }
        }
        break;
    }
    
    calculatedFee += tariff.fixedFee || 0;
    
    // Apply min/max limits
    if (tariff.minimumFee && calculatedFee < tariff.minimumFee) {
      calculatedFee = tariff.minimumFee;
    }
    if (tariff.maximumFee && calculatedFee > tariff.maximumFee) {
      calculatedFee = tariff.maximumFee;
    }
    
    return calculatedFee;
  };

  // Calculate statistics
  const stats = {
    total: tariffs.length,
    active: tariffs.filter(t => t.isActive).length,
    percentage: tariffs.filter(t => t.type === 'percentage').length,
    fixed: tariffs.filter(t => t.type === 'fixed').length,
    tiered: tariffs.filter(t => t.type === 'tiered').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tariff Management</h1>
          <p className="text-muted-foreground">
            Configure pricing structures and collection fees
          </p>
        </div>
        
        <Button onClick={handleCreateTariff}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tariff
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tariffs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Percent className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="text-2xl font-bold">{stats.percentage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fixed Rate</p>
                <p className="text-2xl font-bold">{stats.fixed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiered</p>
                <p className="text-2xl font-bold">{stats.tiered}</p>
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
                  placeholder="Search tariffs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Rate</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tariffs List */}
      <div className="grid gap-6">
        {filteredTariffs.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No tariffs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first tariff to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTariffs.map((tariff) => (
            <Card key={tariff.id} className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{tariff.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{tariff.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={tariff.isActive ? 'default' : 'secondary'}>
                          {tariff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {tariff.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDuplicateTariff(tariff)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditTariff(tariff)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedTariff(tariff);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                {/* Pricing Structure */}
                <div className="bg-accent/50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-sm mb-3">Pricing Structure</h4>
                  
                  {tariff.type === 'percentage' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="ml-2 font-medium">{tariff.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fixed Fee:</span>
                        <span className="ml-2 font-medium">
                          <Money amount={tariff.fixedFee || 0} currency={tariff.currency} />
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min Fee:</span>
                        <span className="ml-2 font-medium">
                          <Money amount={tariff.minimumFee || 0} currency={tariff.currency} />
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Fee:</span>
                        <span className="ml-2 font-medium">
                          <Money amount={tariff.maximumFee || 0} currency={tariff.currency} />
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {tariff.type === 'fixed' && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Fixed Rate:</span>
                      <span className="ml-2 font-medium text-lg">
                        <Money amount={tariff.fixedFee || 0} currency={tariff.currency} />
                      </span>
                    </div>
                  )}
                  
                  {tariff.type === 'tiered' && tariff.tiers && (
                    <div className="space-y-2">
                      {tariff.tiers.map((tier, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Money amount={tier.minAmount} currency={tariff.currency} />
                            {tier.maxAmount ? (
                              <> - <Money amount={tier.maxAmount} currency={tariff.currency} /></>
                            ) : (
                              ' and above'
                            )}
                          </span>
                          <span className="font-medium">{tier.percentage}%</span>
                        </div>
                      ))}
                      {tariff.fixedFee && tariff.fixedFee > 0 && (
                        <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
                          <span className="text-muted-foreground">Plus fixed fee:</span>
                          <span className="font-medium">
                            <Money amount={tariff.fixedFee} currency={tariff.currency} />
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Example Calculations */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[1000, 5000, 10000].map(amount => (
                    <div key={amount} className="text-center p-2 bg-accent/30 rounded">
                      <p className="text-muted-foreground text-xs">
                        On <Money amount={amount} currency={tariff.currency} />
                      </p>
                      <p className="font-medium">
                        <Money amount={calculateFee(amount, tariff)} currency={tariff.currency} />
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <span>Created {format(new Date(tariff.createdAt), 'MMM dd, yyyy')}</span>
                  <span>Updated {format(new Date(tariff.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tariff Dialog */}
      <Dialog open={showTariffDialog} onOpenChange={setShowTariffDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Tariff' : 'Create New Tariff'}
            </DialogTitle>
            <DialogDescription>
              Configure pricing structure and fee calculations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tariff Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tariff name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this tariff structure"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Pricing Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'percentage' | 'fixed' | 'tiered') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Pricing Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium">Pricing Configuration</h4>
              
              {formData.type === 'percentage' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="percentage">Percentage Rate (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.1"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fixedFee">Additional Fixed Fee</Label>
                    <Input
                      id="fixedFee"
                      type="number"
                      step="0.01"
                      value={formData.fixedFee}
                      onChange={(e) => setFormData({ ...formData, fixedFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}
              
              {formData.type === 'fixed' && (
                <div>
                  <Label htmlFor="fixedFee">Fixed Fee</Label>
                  <Input
                    id="fixedFee"
                    type="number"
                    step="0.01"
                    value={formData.fixedFee}
                    onChange={(e) => setFormData({ ...formData, fixedFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
              
              {formData.type === 'tiered' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tier Structure</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTier}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                  
                  {formData.tiers?.map((tier, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-end">
                      <div>
                        <Label>Min Amount</Label>
                        <Input
                          type="number"
                          value={tier.minAmount}
                          onChange={(e) => updateTier(index, 'minAmount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Max Amount</Label>
                        <Input
                          type="number"
                          value={tier.maxAmount || ''}
                          onChange={(e) => updateTier(index, 'maxAmount', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="No limit"
                        />
                      </div>
                      <div>
                        <Label>Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={tier.percentage}
                          onChange={(e) => updateTier(index, 'percentage', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeTier(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div>
                    <Label htmlFor="fixedFee">Additional Fixed Fee</Label>
                    <Input
                      id="fixedFee"
                      type="number"
                      step="0.01"
                      value={formData.fixedFee}
                      onChange={(e) => setFormData({ ...formData, fixedFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}
              
              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumFee">Minimum Fee</Label>
                  <Input
                    id="minimumFee"
                    type="number"
                    step="0.01"
                    value={formData.minimumFee}
                    onChange={(e) => setFormData({ ...formData, minimumFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maximumFee">Maximum Fee</Label>
                  <Input
                    id="maximumFee"
                    type="number"
                    step="0.01"
                    value={formData.maximumFee}
                    onChange={(e) => setFormData({ ...formData, maximumFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">Active Tariff</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTariffDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTariff}>
              {isEditing ? 'Update Tariff' : 'Create Tariff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tariff</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedTariff?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTariff}
            >
              Delete Tariff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}