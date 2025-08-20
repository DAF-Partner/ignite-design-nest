// Professional Data Retention Policy Management Page for B2B Debt Collection Platform
// Complete GDPR compliance with automated data lifecycle management

import { useState, useEffect } from 'react';
import { format, addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import { 
  Shield,
  Calendar,
  Database,
  Trash2,
  AlertTriangle,
  Clock,
  Archive,
  Search,
  Settings,
  Download,
  FileText,
  Users,
  Briefcase,
  CreditCard,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  BarChart3
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface RetentionRule {
  id: string;
  name: string;
  dataType: 'cases' | 'documents' | 'communications' | 'invoices' | 'users' | 'gdpr_requests';
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  description: string;
  isActive: boolean;
  autoDelete: boolean;
  legalBasis: string;
  createdAt: string;
  updatedAt: string;
}

interface RetentionSchedule {
  id: string;
  ruleId: string;
  ruleName: string;
  dataType: string;
  scheduledDate: string;
  recordCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

const dataTypeConfig = {
  cases: {
    label: 'Cases',
    icon: Briefcase,
    description: 'Case records and associated data',
    defaultRetention: { value: 7, unit: 'years' }
  },
  documents: {
    label: 'Documents',
    icon: FileText,
    description: 'Uploaded documents and attachments',
    defaultRetention: { value: 6, unit: 'years' }
  },
  communications: {
    label: 'Communications',
    icon: Mail,
    description: 'Messages, emails, and call logs',
    defaultRetention: { value: 3, unit: 'years' }
  },
  invoices: {
    label: 'Invoices',
    icon: CreditCard,
    description: 'Billing and invoice records',
    defaultRetention: { value: 7, unit: 'years' }
  },
  users: {
    label: 'User Data',
    icon: Users,
    description: 'User accounts and personal data',
    defaultRetention: { value: 2, unit: 'years' }
  },
  gdpr_requests: {
    label: 'GDPR Requests',
    icon: Shield,
    description: 'Privacy request records',
    defaultRetention: { value: 3, unit: 'years' }
  }
};

const mockRetentionRules: RetentionRule[] = [
  {
    id: 'rule_1',
    name: 'Closed Cases',
    dataType: 'cases',
    retentionPeriod: 7,
    retentionUnit: 'years',
    description: 'Retain closed case records for 7 years as per legal requirements',
    isActive: true,
    autoDelete: false,
    legalBasis: 'Legal obligation - limitation period',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'rule_2',
    name: 'Communication Records',
    dataType: 'communications',
    retentionPeriod: 3,
    retentionUnit: 'years',
    description: 'Email and phone communication records',
    isActive: true,
    autoDelete: true,
    legalBasis: 'Legitimate interest - evidence of collection activities',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z'
  },
  {
    id: 'rule_3',
    name: 'Inactive User Accounts',
    dataType: 'users',
    retentionPeriod: 2,
    retentionUnit: 'years',
    description: 'Personal data of inactive user accounts',
    isActive: true,
    autoDelete: true,
    legalBasis: 'Data minimization principle',
    createdAt: '2024-03-10T11:30:00Z',
    updatedAt: '2024-09-15T13:20:00Z'
  }
];

const mockSchedules: RetentionSchedule[] = [
  {
    id: 'schedule_1',
    ruleId: 'rule_2',
    ruleName: 'Communication Records',
    dataType: 'communications',
    scheduledDate: '2024-12-31T23:59:59Z',
    recordCount: 1250,
    status: 'pending',
    createdAt: '2024-12-19T00:00:00Z'
  },
  {
    id: 'schedule_2',
    ruleId: 'rule_3',
    ruleName: 'Inactive User Accounts',
    dataType: 'users',
    scheduledDate: '2024-12-25T00:00:00Z',
    recordCount: 45,
    status: 'completed',
    createdAt: '2024-12-18T00:00:00Z',
    completedAt: '2024-12-25T02:15:00Z'
  }
];

export default function RetentionPolicy() {
  const [retentionRules, setRetentionRules] = useState<RetentionRule[]>([]);
  const [schedules, setSchedules] = useState<RetentionSchedule[]>([]);
  const [filteredRules, setFilteredRules] = useState<RetentionRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<RetentionRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filters
  const [dataTypeFilter, setDataTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dataType: 'cases' as keyof typeof dataTypeConfig,
    retentionPeriod: 7,
    retentionUnit: 'years' as 'days' | 'months' | 'years',
    description: '',
    isActive: true,
    autoDelete: false,
    legalBasis: ''
  });

  // Load data
  useEffect(() => {
    setRetentionRules(mockRetentionRules);
    setSchedules(mockSchedules);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...retentionRules];

    if (dataTypeFilter !== 'all') {
      filtered = filtered.filter(rule => rule.dataType === dataTypeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(rule => rule.isActive === isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.legalBasis.toLowerCase().includes(query)
      );
    }

    setFilteredRules(filtered);
  }, [retentionRules, dataTypeFilter, statusFilter, searchQuery]);

  const handleCreateRule = () => {
    setSelectedRule(null);
    setIsEditing(false);
    setFormData({
      name: '',
      dataType: 'cases',
      retentionPeriod: 7,
      retentionUnit: 'years',
      description: '',
      isActive: true,
      autoDelete: false,
      legalBasis: ''
    });
    setShowRuleDialog(true);
  };

  const handleEditRule = (rule: RetentionRule) => {
    setSelectedRule(rule);
    setIsEditing(true);
    setFormData({
      name: rule.name,
      dataType: rule.dataType as keyof typeof dataTypeConfig,
      retentionPeriod: rule.retentionPeriod,
      retentionUnit: rule.retentionUnit,
      description: rule.description,
      isActive: rule.isActive,
      autoDelete: rule.autoDelete,
      legalBasis: rule.legalBasis
    });
    setShowRuleDialog(true);
  };

  const handleSaveRule = async () => {
    if (!formData.name || !formData.description || !formData.legalBasis) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const ruleData = {
      ...formData,
      id: selectedRule?.id || `rule_${Date.now()}`,
      createdAt: selectedRule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      setRetentionRules(retentionRules.map(rule => 
        rule.id === selectedRule?.id 
          ? { ...rule, ...ruleData }
          : rule
      ));
      
      toast({
        title: 'Rule Updated',
        description: `${ruleData.name} has been updated successfully.`
      });
    } else {
      setRetentionRules([ruleData as RetentionRule, ...retentionRules]);
      
      toast({
        title: 'Rule Created',
        description: `${ruleData.name} has been created successfully.`
      });
    }

    setShowRuleDialog(false);
  };

  const handleDeleteRule = async () => {
    if (selectedRule) {
      setRetentionRules(retentionRules.filter(rule => rule.id !== selectedRule.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: 'Rule Deleted',
        description: `${selectedRule.name} has been permanently deleted.`
      });
    }
  };

  const handleToggleRule = (rule: RetentionRule) => {
    const updatedRules = retentionRules.map(r => 
      r.id === rule.id 
        ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() }
        : r
    );
    
    setRetentionRules(updatedRules);
    
    toast({
      title: `Rule ${!rule.isActive ? 'Activated' : 'Deactivated'}`,
      description: `${rule.name} has been ${!rule.isActive ? 'activated' : 'deactivated'}.`
    });
  };

  const handleRunSchedule = (schedule: RetentionSchedule) => {
    const updatedSchedules = schedules.map(s => 
      s.id === schedule.id 
        ? { ...s, status: 'processing' as const }
        : s
    );
    
    setSchedules(updatedSchedules);
    
    // Simulate processing
    setTimeout(() => {
      setSchedules(prev => prev.map(s => 
        s.id === schedule.id 
          ? { 
              ...s, 
              status: 'completed' as const, 
              completedAt: new Date().toISOString() 
            }
          : s
      ));
      
      toast({
        title: 'Deletion Completed',
        description: `${schedule.recordCount} records have been deleted.`
      });
    }, 3000);
    
    toast({
      title: 'Deletion Started',
      description: `Processing ${schedule.recordCount} records for deletion.`
    });
  };

  const calculateRetentionDate = (rule: RetentionRule, fromDate = new Date()) => {
    switch (rule.retentionUnit) {
      case 'days':
        return addDays(fromDate, rule.retentionPeriod);
      case 'months':
        return addMonths(fromDate, rule.retentionPeriod);
      case 'years':
        return addYears(fromDate, rule.retentionPeriod);
      default:
        return fromDate;
    }
  };

  const getDaysUntilDeletion = (scheduledDate: string) => {
    return differenceInDays(new Date(scheduledDate), new Date());
  };

  // Calculate statistics
  const stats = {
    totalRules: retentionRules.length,
    activeRules: retentionRules.filter(r => r.isActive).length,
    autoDeleteRules: retentionRules.filter(r => r.autoDelete).length,
    pendingSchedules: schedules.filter(s => s.status === 'pending').length,
    totalRecordsScheduled: schedules
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.recordCount, 0)
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Retention Policy</h1>
          <p className="text-muted-foreground">
            Manage data lifecycle and ensure GDPR compliance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleCreateRule}>
            <Settings className="h-4 w-4 mr-2" />
            New Rule
          </Button>
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
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{stats.totalRules}</p>
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
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{stats.activeRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Archive className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Delete</p>
                <p className="text-2xl font-bold">{stats.autoDeleteRules}</p>
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
                <p className="text-2xl font-bold">{stats.pendingSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Database className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records to Delete</p>
                <p className="text-2xl font-bold">{stats.totalRecordsScheduled.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Retention Rules</TabsTrigger>
          <TabsTrigger value="schedules">Deletion Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-6">
          {/* Filters and Search */}
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search retention rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Data Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="cases">Cases</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="communications">Communications</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="gdpr_requests">GDPR Requests</SelectItem>
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

          {/* Rules List */}
          <div className="grid gap-6">
            {filteredRules.length === 0 ? (
              <Card className="card-professional">
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No retention rules found</h3>
                  <p className="text-muted-foreground">
                    Create retention rules to manage data lifecycle automatically.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRules.map((rule) => {
                const DataTypeIcon = dataTypeConfig[rule.dataType].icon;
                const retentionDate = calculateRetentionDate(rule);
                
                return (
                  <Card key={rule.id} className="card-professional">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <DataTypeIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">
                                {dataTypeConfig[rule.dataType].label}
                              </Badge>
                              {rule.autoDelete && (
                                <Badge variant="outline" className="border-destructive text-destructive">
                                  Auto-Delete
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleRule(rule)}
                          >
                            {rule.isActive ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedRule(rule);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {/* Rule Details */}
                      <div className="bg-accent/50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Retention Period:</span>
                            <span className="ml-2 font-medium">
                              {rule.retentionPeriod} {rule.retentionUnit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Legal Basis:</span>
                            <span className="ml-2 font-medium">{rule.legalBasis}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Review:</span>
                            <span className="ml-2 font-medium">
                              {format(retentionDate, 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created {format(new Date(rule.createdAt), 'MMM dd, yyyy')}</span>
                        <span>Updated {format(new Date(rule.updatedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="schedules" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle>Upcoming Deletions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No scheduled deletions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => {
                      const daysUntil = getDaysUntilDeletion(schedule.scheduledDate);
                      const isOverdue = daysUntil < 0;
                      
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.ruleName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {schedule.dataType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{schedule.recordCount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}</span>
                              <span className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days remaining`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                schedule.status === 'completed' ? 'default' :
                                schedule.status === 'failed' ? 'destructive' :
                                schedule.status === 'processing' ? 'secondary' : 'outline'
                              }
                            >
                              {schedule.status === 'processing' && (
                                <div className="flex items-center">
                                  <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-2" />
                                  Processing
                                </div>
                              )}
                              {schedule.status !== 'processing' && schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {schedule.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRunSchedule(schedule)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Run Now
                              </Button>
                            )}
                            {schedule.status === 'completed' && schedule.completedAt && (
                              <span className="text-xs text-muted-foreground">
                                Completed {format(new Date(schedule.completedAt), 'MMM dd')}
                              </span>
                            )}
                            {schedule.status === 'failed' && (
                              <Button variant="outline" size="sm" className="text-destructive">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Retry
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Retention Rule' : 'Create New Retention Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure data retention periods and deletion policies to ensure GDPR compliance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div>
                <Label htmlFor="dataType">Data Type</Label>
                <Select 
                  value={formData.dataType} 
                  onValueChange={(value: keyof typeof dataTypeConfig) => 
                    setFormData({ ...formData, dataType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dataTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this rule applies to"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retentionPeriod">Retention Period</Label>
                <Input
                  id="retentionPeriod"
                  type="number"
                  min="1"
                  value={formData.retentionPeriod}
                  onChange={(e) => setFormData({ ...formData, retentionPeriod: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div>
                <Label htmlFor="retentionUnit">Unit</Label>
                <Select 
                  value={formData.retentionUnit} 
                  onValueChange={(value: 'days' | 'months' | 'years') => 
                    setFormData({ ...formData, retentionUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="legalBasis">Legal Basis</Label>
              <Textarea
                id="legalBasis"
                value={formData.legalBasis}
                onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
                placeholder="Legal justification for this retention period"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">Active Rule</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoDelete"
                  checked={formData.autoDelete}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoDelete: checked })}
                />
                <Label htmlFor="autoDelete">Auto-Delete</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRuleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Retention Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedRule?.name}"? This action cannot be undone.
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
              onClick={handleDeleteRule}
            >
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}