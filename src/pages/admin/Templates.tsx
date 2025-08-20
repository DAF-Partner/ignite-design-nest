// Professional Message Templates Management Page for B2B Debt Collection Platform
// Complete template system with variables, preview, and multi-channel support

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  FileText,
  Search,
  Copy,
  Eye,
  Send,
  Variable,
  Settings,
  Download,
  Upload,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

import type { MessageTemplate, TemplateVariable } from '@/types';

const mockTemplates: MessageTemplate[] = [
  {
    id: 'template_1',
    name: 'Initial Payment Request',
    type: 'initial_contact',
    locale: 'en-GB',
    version: 1,
    channel: 'email',
    subject: 'Payment Required - Invoice #{invoiceNumber}',
    content: `Dear {debtorName},

We hope this message finds you well. We are writing to inform you that payment for invoice #{invoiceNumber} in the amount of {amount} {currency} is now overdue.

Original due date: {dueDate}
Days overdue: {daysOverdue}

Please arrange payment immediately to avoid any further collection action. If you have already made this payment, please disregard this notice.

If you have any questions or would like to discuss payment arrangements, please contact us at {contactPhone} or reply to this email.

Thank you for your prompt attention to this matter.

Best regards,
{agentName}
{companyName}`,
    variables: [
      { name: 'debtorName', description: 'Name of the debtor', required: true },
      { name: 'invoiceNumber', description: 'Invoice number', required: true },
      { name: 'amount', description: 'Outstanding amount', required: true },
      { name: 'currency', description: 'Currency code', required: true },
      { name: 'dueDate', description: 'Original due date', required: true },
      { name: 'daysOverdue', description: 'Number of days overdue', required: true },
      { name: 'contactPhone', description: 'Contact phone number', required: false },
      { name: 'agentName', description: 'Collection agent name', required: true },
      { name: 'companyName', description: 'Company name', required: true }
    ],
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z'
  },
  {
    id: 'template_2',
    name: 'Final Notice Before Legal Action',
    type: 'legal_notice',
    locale: 'en-GB',
    version: 1,
    channel: 'letter',
    subject: 'FINAL NOTICE - Legal Action Pending',
    content: `FINAL NOTICE

Account: {accountNumber}
Debtor: {debtorName}
Amount Due: {amount} {currency}

This is our FINAL NOTICE before we commence legal proceedings to recover the above debt.

Unless payment is received within 7 days from the date of this letter, we will have no alternative but to:

1. Issue legal proceedings against you
2. Seek to recover legal costs
3. Register a County Court Judgment against you

This may affect your credit rating and ability to obtain credit in the future.

If you dispute this debt, you must contact us immediately.

Payment can be made by:
- Bank transfer to: {bankDetails}
- Cheque payable to: {companyName}
- Online at: {paymentUrl}

Yours sincerely,

{agentName}
Senior Collection Agent
{companyName}`,
    variables: [
      { name: 'accountNumber', description: 'Account number', required: true },
      { name: 'debtorName', description: 'Name of the debtor', required: true },
      { name: 'amount', description: 'Outstanding amount', required: true },
      { name: 'currency', description: 'Currency code', required: true },
      { name: 'bankDetails', description: 'Bank transfer details', required: true },
      { name: 'companyName', description: 'Company name', required: true },
      { name: 'paymentUrl', description: 'Online payment URL', required: false },
      { name: 'agentName', description: 'Collection agent name', required: true }
    ],
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-10-20T16:45:00Z'
  },
  {
    id: 'template_3',
    name: 'SMS Payment Reminder',
    type: 'reminder',
    locale: 'en-GB',
    version: 1,
    channel: 'sms',
    subject: '',
    content: 'URGENT: Payment of {amount} {currency} is overdue. Contact us on {contactPhone} to avoid further action. Ref: {caseReference}',
    variables: [
      { name: 'amount', description: 'Outstanding amount', required: true },
      { name: 'currency', description: 'Currency code', required: true },
      { name: 'contactPhone', description: 'Contact phone number', required: true },
      { name: 'caseReference', description: 'Case reference number', required: true }
    ],
    isActive: true,
    createdAt: '2024-03-10T11:30:00Z',
    updatedAt: '2024-09-15T13:20:00Z'
  }
];

interface TemplateFormData {
  name: string;
  channel: 'email' | 'sms' | 'letter' | 'phone';
  subject: string;
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
}

const availableVariables = [
  'debtorName', 'debtorEmail', 'debtorPhone', 'debtorAddress',
  'amount', 'currency', 'dueDate', 'daysOverdue',
  'invoiceNumber', 'accountNumber', 'caseReference',
  'agentName', 'agentPhone', 'agentEmail',
  'companyName', 'companyAddress', 'companyPhone',
  'contactPhone', 'bankDetails', 'paymentUrl'
];

const channelConfig = {
  email: {
    label: 'Email',
    icon: Mail,
    description: 'Email messages with subject lines',
    hasSubject: true,
    maxLength: 5000
  },
  sms: {
    label: 'SMS',
    icon: Phone,
    description: 'Text messages (160 character limit)',
    hasSubject: false,
    maxLength: 160
  },
  letter: {
    label: 'Letter',
    icon: FileText,
    description: 'Printed correspondence',
    hasSubject: true,
    maxLength: 10000
  },
  phone: {
    label: 'Phone Script',
    icon: Phone,
    description: 'Call scripts and talking points',
    hasSubject: false,
    maxLength: 2000
  }
};

export default function Templates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    channel: 'email',
    subject: '',
    content: '',
    variables: [],
    isActive: true
  });
  
  // Preview data
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  
  // Filters
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load templates data
  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...templates];

    if (channelFilter !== 'all') {
      filtered = filtered.filter(template => template.channel === channelFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(template => template.isActive === isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        (template.subject && template.subject.toLowerCase().includes(query))
      );
    }

    // Sort by last updated (newest first)
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    setFilteredTemplates(filtered);
  }, [templates, channelFilter, statusFilter, searchQuery]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setFormData({
      name: '',
      channel: 'email',
      subject: '',
      content: '',
      variables: [],
      isActive: true
    });
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setFormData({
      name: template.name,
      channel: template.channel,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables || [],
      isActive: template.isActive
    });
    setShowTemplateDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.content) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in the template name and content.',
        variant: 'destructive'
      });
      return;
    }

    // Extract variables from content
    const variableMatches = formData.content.match(/{(\w+)}/g) || [];
    const extractedVariables = variableMatches.map(match => match.slice(1, -1));
    
    if (formData.subject) {
      const subjectMatches = formData.subject.match(/{(\w+)}/g) || [];
      const subjectVariables = subjectMatches.map(match => match.slice(1, -1));
      extractedVariables.push(...subjectVariables);
    }
    
    const uniqueVariables = [...new Set(extractedVariables)];

    const templateData = {
      ...formData,
      variables: uniqueVariables,
      id: selectedTemplate?.id || `template_${Date.now()}`,
      createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      setTemplates(templates.map(template => 
        template.id === selectedTemplate?.id 
          ? { ...template, ...templateData }
          : template
      ));
      
      toast({
        title: 'Template Updated',
        description: `${templateData.name} has been updated successfully.`
      });
    } else {
      setTemplates([templateData as MessageTemplate, ...templates]);
      
      toast({
        title: 'Template Created',
        description: `${templateData.name} has been created successfully.`
      });
    }

    setShowTemplateDialog(false);
  };

  const handleDeleteTemplate = async () => {
    if (selectedTemplate) {
      setTemplates(templates.filter(template => template.id !== selectedTemplate.id));
      setShowDeleteConfirm(false);
      
      toast({
        title: 'Template Deleted',
        description: `${selectedTemplate.name} has been permanently deleted.`
      });
    }
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTemplates([duplicatedTemplate, ...templates]);
    
    toast({
      title: 'Template Duplicated',
      description: `${duplicatedTemplate.name} has been created.`
    });
  };

  const handlePreviewTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize preview data with sample values
    const sampleData: Record<string, string> = {
      debtorName: 'John Smith',
      debtorEmail: 'john.smith@example.com',
      debtorPhone: '+44 20 7123 4567',
      amount: '2,500.00',
      currency: 'GBP',
      invoiceNumber: 'INV-2024-001',
      dueDate: '15th November 2024',
      daysOverdue: '14',
      agentName: 'Sarah Johnson',
      companyName: 'CollectPro Ltd',
      contactPhone: '+44 20 7000 0000',
      caseReference: 'REF-2024-001'
    };
    
    setPreviewData(sampleData);
    setShowPreviewDialog(true);
  };

  const renderPreview = (content: string, data: Record<string, string>) => {
    let preview = content;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + `{${variable}}` + after;
      
      setFormData({ ...formData, content: newContent });
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  // Calculate statistics
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    email: templates.filter(t => t.channel === 'email').length,
    sms: templates.filter(t => t.channel === 'sms').length,
    letter: templates.filter(t => t.channel === 'letter').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="text-muted-foreground">
            Manage communication templates for debt collection
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
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
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-2xl font-bold">{stats.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SMS</p>
                <p className="text-2xl font-bold">{stats.sms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Letters</p>
                <p className="text-2xl font-bold">{stats.letter}</p>
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
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
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

      {/* Templates List */}
      <div className="grid gap-6">
        {filteredTemplates.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery || channelFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first template to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => {
            const ChannelIcon = channelConfig[template.channel].icon;
            
            return (
              <Card key={template.id} className="card-professional">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <ChannelIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Subject: {template.subject}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {channelConfig[template.channel].label}
                          </Badge>
                          {template.variables && template.variables.length > 0 && (
                            <Badge variant="outline">
                              <Variable className="h-3 w-3 mr-1" />
                              {template.variables.length} variables
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="bg-accent/50 rounded-lg p-4 mb-4">
                    <p className="text-sm line-clamp-3">{template.content}</p>
                  </div>
                  
                  {/* Variables */}
                  {template.variables && template.variables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Variables Used:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {format(new Date(template.createdAt), 'MMM dd, yyyy')}</span>
                    <span>Updated {format(new Date(template.updatedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Design message templates with dynamic variables for debt collection communications.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="channel">Channel</Label>
                    <Select 
                      value={formData.channel} 
                      onValueChange={(value: 'email' | 'sms' | 'letter' | 'phone') => 
                        setFormData({ ...formData, channel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="phone">Phone Script</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {channelConfig[formData.channel].description}
                    </p>
                  </div>
                </div>
                
                {channelConfig[formData.channel].hasSubject && (
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject line"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your message content. Use {variableName} for dynamic content."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      Use curly braces to insert variables: {'{debtorName}'}
                    </span>
                    <span>
                      {formData.content.length} / {channelConfig[formData.channel].maxLength} characters
                    </span>
                  </div>
                  {formData.content.length > channelConfig[formData.channel].maxLength && (
                    <p className="text-xs text-destructive mt-1">
                      Content exceeds maximum length for {channelConfig[formData.channel].label.toLowerCase()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="active">Active Template</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variables" className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Available Variables</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on any variable to insert it into your template content.
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  {availableVariables.map((variable) => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                      className="justify-start text-left font-mono text-xs"
                    >
                      {`{${variable}}`}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Variable Descriptions</h4>
                <div className="space-y-2 text-sm">
                  <div><code>{'{debtorName}'}</code> - Full name of the debtor</div>
                  <div><code>{'{amount}'}</code> - Outstanding debt amount</div>
                  <div><code>{'{currency}'}</code> - Currency code (GBP, USD, EUR)</div>
                  <div><code>{'{dueDate}'}</code> - Original payment due date</div>
                  <div><code>{'{daysOverdue}'}</code> - Number of days past due</div>
                  <div><code>{'{agentName}'}</code> - Name of assigned collection agent</div>
                  <div><code>{'{companyName}'}</code> - Your company name</div>
                  <div><code>{'{contactPhone}'}</code> - Contact phone number</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {selectedTemplate && `Preview of "${selectedTemplate.name}" with sample data`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              {selectedTemplate.subject && (
                <div>
                  <Label className="text-sm font-medium">Subject:</Label>
                  <div className="p-3 bg-accent/50 rounded-lg mt-1">
                    <p className="font-medium">
                      {renderPreview(selectedTemplate.subject, previewData)}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Content:</Label>
                <ScrollArea className="h-64 p-3 bg-accent/50 rounded-lg mt-1">
                  <pre className="whitespace-pre-wrap text-sm">
                    {renderPreview(selectedTemplate.content, previewData)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedTemplate?.name}"? This action cannot be undone.
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
              onClick={handleDeleteTemplate}
            >
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}