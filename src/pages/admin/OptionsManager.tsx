// Admin Options Manager - Configure dropdowns and system options
// Manage Service Levels, Debt Statuses, Lawful Bases, and other configurable options

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Check, Settings, 
  Shield, Scale, Building2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { ServiceLevel, DebtStatus, LawfulBasis } from '@/types';
import { cn } from '@/lib/utils';

interface OptionFormData<T> {
  isEdit: boolean;
  item: Partial<T>;
  isOpen: boolean;
}

const emptyServiceLevel: Partial<ServiceLevel> = {
  name: '',
  code: '',
  description: '',
  slaHours: 24,
  isActive: true,
  isSystemDefault: false,
};

const emptyDebtStatus: Partial<DebtStatus> = {
  name: '',
  code: '',
  description: '',
  isActive: true,
  isSystemDefault: false,
};

const emptyLawfulBasis: Partial<LawfulBasis> = {
  name: '',
  code: '',
  description: '',
  articleReference: '',
  isActive: true,
  isSystemDefault: false,
};

export default function OptionsManager() {
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Data states
  const [serviceLevels, setServiceLevels] = useState<ServiceLevel[]>([]);
  const [debtStatuses, setDebtStatuses] = useState<DebtStatus[]>([]);
  const [lawfulBases, setLawfulBases] = useState<LawfulBasis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [serviceLevelForm, setServiceLevelForm] = useState<OptionFormData<ServiceLevel>>({
    isEdit: false,
    item: emptyServiceLevel,
    isOpen: false,
  });
  
  const [debtStatusForm, setDebtStatusForm] = useState<OptionFormData<DebtStatus>>({
    isEdit: false,
    item: emptyDebtStatus,
    isOpen: false,
  });
  
  const [lawfulBasisForm, setLawfulBasisForm] = useState<OptionFormData<LawfulBasis>>({
    isEdit: false,
    item: emptyLawfulBasis,
    isOpen: false,
  });

  // Check admin permissions
  if (!hasRole('ADMIN')) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You need admin privileges to manage system options.
          </p>
        </div>
      </div>
    );
  }

  // Load all options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true);
        const [serviceLevelsResponse, debtStatusesResponse, lawfulBasesResponse] = await Promise.all([
          apiClient.get<ServiceLevel[]>('/admin/service-levels'),
          apiClient.get<DebtStatus[]>('/admin/debt-statuses'),
          apiClient.get<LawfulBasis[]>('/admin/lawful-bases'),
        ]);

        setServiceLevels(serviceLevelsResponse);
        setDebtStatuses(debtStatusesResponse);
        setLawfulBases(lawfulBasesResponse);
      } catch (error) {
        console.error('Failed to load options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load configuration options.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [toast]);

  // Generic handlers for CRUD operations
  const handleCreate = async <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    endpoint: string,
    item: Partial<T>,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    formSetter: React.Dispatch<React.SetStateAction<OptionFormData<T>>>,
    emptyItem: Partial<T>
  ) => {
    try {
      const result = await apiClient.post<T>(endpoint, item);
      setter(prev => [...prev, result]);
      formSetter({ isEdit: false, item: emptyItem, isOpen: false });
      
      toast({
        title: 'Success',
        description: 'Item created successfully.',
      });
    } catch (error) {
      console.error('Create failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to create item.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    endpoint: string,
    item: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    formSetter: React.Dispatch<React.SetStateAction<OptionFormData<T>>>,
    emptyItem: Partial<T>
  ) => {
    try {
      const result = await apiClient.patch<T>(`${endpoint}/${item.id}`, item);
      setter(prev => prev.map(existing => existing.id === item.id ? result : existing));
      formSetter({ isEdit: false, item: emptyItem, isOpen: false });
      
      toast({
        title: 'Success',
        description: 'Item updated successfully.',
      });
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    endpoint: string,
    id: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await apiClient.delete(`${endpoint}/${id}`);
      setter(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully.',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    endpoint: string,
    item: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    try {
      const updated = { ...item, isActive: !item.isActive };
      const result = await apiClient.put<T>(`${endpoint}/${item.id}`, updated);
      setter(prev => prev.map(existing => existing.id === item.id ? result : existing));
    } catch (error) {
      console.error('Toggle active failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const openCreateForm = <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    formSetter: React.Dispatch<React.SetStateAction<OptionFormData<T>>>,
    emptyItem: Partial<T>
  ) => {
    formSetter({ isEdit: false, item: emptyItem, isOpen: true });
  };

  const openEditForm = <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    item: T,
    formSetter: React.Dispatch<React.SetStateAction<OptionFormData<T>>>
  ) => {
    formSetter({ isEdit: true, item, isOpen: true });
  };

  const closeForm = <T extends ServiceLevel | DebtStatus | LawfulBasis>(
    formSetter: React.Dispatch<React.SetStateAction<OptionFormData<T>>>,
    emptyItem: Partial<T>
  ) => {
    formSetter({ isEdit: false, item: emptyItem, isOpen: false });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Options Manager
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure system-wide dropdowns and options used throughout the application
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes to these options will affect all new case intakes. Exercise caution when modifying or deleting items that may be in use.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="service-levels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="service-levels" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Service Levels
          </TabsTrigger>
          <TabsTrigger value="debt-statuses" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Debt Statuses
          </TabsTrigger>
          <TabsTrigger value="lawful-bases" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Lawful Bases
          </TabsTrigger>
        </TabsList>

        {/* Service Levels Tab */}
        <TabsContent value="service-levels" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Levels</CardTitle>
              <Dialog 
                open={serviceLevelForm.isOpen} 
                onOpenChange={(open) => !open && closeForm(setServiceLevelForm, emptyServiceLevel)}
              >
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => openCreateForm(setServiceLevelForm, emptyServiceLevel)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service Level
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {serviceLevelForm.isEdit ? 'Edit Service Level' : 'Create Service Level'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sl-name">Name *</Label>
                        <Input
                          id="sl-name"
                          value={serviceLevelForm.item.name || ''}
                          onChange={(e) => setServiceLevelForm(prev => ({
                            ...prev,
                            item: { ...prev.item, name: e.target.value }
                          }))}
                          placeholder="Soft Collection"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sl-code">Code *</Label>
                        <Input
                          id="sl-code"
                          value={serviceLevelForm.item.code || ''}
                          onChange={(e) => setServiceLevelForm(prev => ({
                            ...prev,
                            item: { ...prev.item, code: e.target.value }
                          }))}
                          placeholder="SOFT"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sl-description">Description</Label>
                      <Textarea
                        id="sl-description"
                        value={serviceLevelForm.item.description || ''}
                        onChange={(e) => setServiceLevelForm(prev => ({
                          ...prev,
                          item: { ...prev.item, description: e.target.value }
                        }))}
                        placeholder="Description of the service level"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sl-sla">SLA Hours</Label>
                      <Input
                        id="sl-sla"
                        type="number"
                        min="1"
                        value={serviceLevelForm.item.slaHours || 24}
                        onChange={(e) => setServiceLevelForm(prev => ({
                          ...prev,
                          item: { ...prev.item, slaHours: parseInt(e.target.value) || 24 }
                        }))}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={serviceLevelForm.item.isActive || false}
                          onCheckedChange={(checked) => setServiceLevelForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isActive: checked }
                          }))}
                        />
                        <Label>Active</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={serviceLevelForm.item.isSystemDefault || false}
                          onCheckedChange={(checked) => setServiceLevelForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isSystemDefault: checked }
                          }))}
                        />
                        <Label>System Default</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (serviceLevelForm.isEdit) {
                            handleUpdate('/admin/service-levels', serviceLevelForm.item as ServiceLevel, 
                              setServiceLevels, setServiceLevelForm, emptyServiceLevel);
                          } else {
                            handleCreate('/admin/service-levels', serviceLevelForm.item, 
                              setServiceLevels, setServiceLevelForm, emptyServiceLevel);
                          }
                        }}
                        disabled={!serviceLevelForm.item.name || !serviceLevelForm.item.code}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {serviceLevelForm.isEdit ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => closeForm(setServiceLevelForm, emptyServiceLevel)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>SLA Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceLevels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{level.code}</Badge>
                      </TableCell>
                      <TableCell>{level.slaHours}h</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={level.isActive}
                            onCheckedChange={() => handleToggleActive('/admin/service-levels', level, setServiceLevels)}
                          />
                          <span className="text-sm">{level.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {level.isSystemDefault && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(level, setServiceLevelForm)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete('/admin/service-levels', level.id, setServiceLevels)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debt Statuses Tab - Similar structure */}
        <TabsContent value="debt-statuses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Debt Statuses</CardTitle>
              <Dialog 
                open={debtStatusForm.isOpen} 
                onOpenChange={(open) => !open && closeForm(setDebtStatusForm, emptyDebtStatus)}
              >
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => openCreateForm(setDebtStatusForm, emptyDebtStatus)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Debt Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {debtStatusForm.isEdit ? 'Edit Debt Status' : 'Create Debt Status'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ds-name">Name *</Label>
                        <Input
                          id="ds-name"
                          value={debtStatusForm.item.name || ''}
                          onChange={(e) => setDebtStatusForm(prev => ({
                            ...prev,
                            item: { ...prev.item, name: e.target.value }
                          }))}
                          placeholder="Pre-legal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ds-code">Code *</Label>
                        <Input
                          id="ds-code"
                          value={debtStatusForm.item.code || ''}
                          onChange={(e) => setDebtStatusForm(prev => ({
                            ...prev,
                            item: { ...prev.item, code: e.target.value }
                          }))}
                          placeholder="PRE_LEGAL"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ds-description">Description</Label>
                      <Textarea
                        id="ds-description"
                        value={debtStatusForm.item.description || ''}
                        onChange={(e) => setDebtStatusForm(prev => ({
                          ...prev,
                          item: { ...prev.item, description: e.target.value }
                        }))}
                        placeholder="Description of the debt status"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={debtStatusForm.item.isActive || false}
                          onCheckedChange={(checked) => setDebtStatusForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isActive: checked }
                          }))}
                        />
                        <Label>Active</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={debtStatusForm.item.isSystemDefault || false}
                          onCheckedChange={(checked) => setDebtStatusForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isSystemDefault: checked }
                          }))}
                        />
                        <Label>System Default</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (debtStatusForm.isEdit) {
                            handleUpdate('/admin/debt-statuses', debtStatusForm.item as DebtStatus, 
                              setDebtStatuses, setDebtStatusForm, emptyDebtStatus);
                          } else {
                            handleCreate('/admin/debt-statuses', debtStatusForm.item, 
                              setDebtStatuses, setDebtStatusForm, emptyDebtStatus);
                          }
                        }}
                        disabled={!debtStatusForm.item.name || !debtStatusForm.item.code}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {debtStatusForm.isEdit ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => closeForm(setDebtStatusForm, emptyDebtStatus)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtStatuses.map((status) => (
                    <TableRow key={status.id}>
                      <TableCell className="font-medium">{status.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{status.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{status.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={status.isActive}
                            onCheckedChange={() => handleToggleActive('/admin/debt-statuses', status, setDebtStatuses)}
                            size="sm"
                          />
                          <span className="text-sm">{status.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {status.isSystemDefault && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(status, setDebtStatusForm)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete('/admin/debt-statuses', status.id, setDebtStatuses)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lawful Bases Tab - Similar structure */}
        <TabsContent value="lawful-bases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>GDPR Lawful Bases</CardTitle>
              <Dialog 
                open={lawfulBasisForm.isOpen} 
                onOpenChange={(open) => !open && closeForm(setLawfulBasisForm, emptyLawfulBasis)}
              >
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => openCreateForm(setLawfulBasisForm, emptyLawfulBasis)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lawful Basis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {lawfulBasisForm.isEdit ? 'Edit Lawful Basis' : 'Create Lawful Basis'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lb-name">Name *</Label>
                        <Input
                          id="lb-name"
                          value={lawfulBasisForm.item.name || ''}
                          onChange={(e) => setLawfulBasisForm(prev => ({
                            ...prev,
                            item: { ...prev.item, name: e.target.value }
                          }))}
                          placeholder="Contract"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lb-code">Code *</Label>
                        <Input
                          id="lb-code"
                          value={lawfulBasisForm.item.code || ''}
                          onChange={(e) => setLawfulBasisForm(prev => ({
                            ...prev,
                            item: { ...prev.item, code: e.target.value }
                          }))}
                          placeholder="CONTRACT"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lb-article">Article Reference</Label>
                      <Input
                        id="lb-article"
                        value={lawfulBasisForm.item.articleReference || ''}
                        onChange={(e) => setLawfulBasisForm(prev => ({
                          ...prev,
                          item: { ...prev.item, articleReference: e.target.value }
                        }))}
                        placeholder="Art. 6(1)(b) GDPR"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lb-description">Description</Label>
                      <Textarea
                        id="lb-description"
                        value={lawfulBasisForm.item.description || ''}
                        onChange={(e) => setLawfulBasisForm(prev => ({
                          ...prev,
                          item: { ...prev.item, description: e.target.value }
                        }))}
                        placeholder="Description of the lawful basis"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={lawfulBasisForm.item.isActive || false}
                          onCheckedChange={(checked) => setLawfulBasisForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isActive: checked }
                          }))}
                        />
                        <Label>Active</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={lawfulBasisForm.item.isSystemDefault || false}
                          onCheckedChange={(checked) => setLawfulBasisForm(prev => ({
                            ...prev,
                            item: { ...prev.item, isSystemDefault: checked }
                          }))}
                        />
                        <Label>System Default</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (lawfulBasisForm.isEdit) {
                            handleUpdate('/admin/lawful-bases', lawfulBasisForm.item as LawfulBasis, 
                              setLawfulBases, setLawfulBasisForm, emptyLawfulBasis);
                          } else {
                            handleCreate('/admin/lawful-bases', lawfulBasisForm.item, 
                              setLawfulBases, setLawfulBasisForm, emptyLawfulBasis);
                          }
                        }}
                        disabled={!lawfulBasisForm.item.name || !lawfulBasisForm.item.code}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {lawfulBasisForm.isEdit ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => closeForm(setLawfulBasisForm, emptyLawfulBasis)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Article Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lawfulBases.map((basis) => (
                    <TableRow key={basis.id}>
                      <TableCell className="font-medium">{basis.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{basis.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {basis.articleReference}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={basis.isActive}
                            onCheckedChange={() => handleToggleActive('/admin/lawful-bases', basis, setLawfulBases)}
                            size="sm"
                          />
                          <span className="text-sm">{basis.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {basis.isSystemDefault && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(basis, setLawfulBasisForm)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete('/admin/lawful-bases', basis.id, setLawfulBases)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}