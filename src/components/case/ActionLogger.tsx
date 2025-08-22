import React, { useState } from 'react';
import { Plus, Save, X, Clock, User, FileText, Phone, Mail, MessageSquare, Scale, HandCoins, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface ActionLoggerProps {
  caseId: string;
  onActionLogged?: () => void;
}

const ACTION_CATEGORIES = {
  communication: {
    label: 'Communication',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    actions: [
      { value: 'phone_call', label: 'Phone Call', icon: Phone },
      { value: 'email_sent', label: 'Email Sent', icon: Mail },
      { value: 'letter_sent', label: 'Letter Sent', icon: FileText },
      { value: 'meeting', label: 'Meeting', icon: User },
    ]
  },
  case_management: {
    label: 'Case Management',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    actions: [
      { value: 'document_review', label: 'Document Review', icon: FileText },
      { value: 'case_analysis', label: 'Case Analysis', icon: FileText },
      { value: 'status_update', label: 'Status Update', icon: Clock },
      { value: 'client_communication', label: 'Client Communication', icon: MessageSquare },
    ]
  },
  negotiation: {
    label: 'Negotiation & Settlement',
    icon: HandCoins,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    actions: [
      { value: 'negotiation', label: 'Negotiation Session', icon: HandCoins },
      { value: 'settlement_offer', label: 'Settlement Offer', icon: HandCoins },
      { value: 'payment_plan', label: 'Payment Plan Setup', icon: Clock },
      { value: 'discount_approved', label: 'Discount Approved', icon: HandCoins },
    ]
  },
  legal: {
    label: 'Legal Actions',
    icon: Scale,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    actions: [
      { value: 'legal_notice', label: 'Legal Notice Sent', icon: AlertTriangle },
      { value: 'court_filing', label: 'Court Filing', icon: Scale },
      { value: 'legal_consultation', label: 'Legal Consultation', icon: Scale },
      { value: 'enforcement_action', label: 'enforcement Action', icon: AlertTriangle },
    ]
  }
};

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
];

export function ActionLogger({ caseId, onActionLogged }: ActionLoggerProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    action_type: '',
    description: '',
    priority: 'medium',
    outcome: '',
    next_action: '',
    duration_minutes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !formData.action_type || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const actionData: any = {
        case_id: caseId,
        agent_id: user.id,
        action_type: formData.action_type,
        description: formData.description.trim(),
        status: 'completed'
      };

      // Add optional metadata
      const metadata: any = {};
      if (formData.priority !== 'medium') metadata.priority = formData.priority;
      if (formData.outcome.trim()) metadata.outcome = formData.outcome.trim();
      if (formData.next_action.trim()) metadata.next_action = formData.next_action.trim();
      if (formData.duration_minutes) metadata.duration_minutes = parseInt(formData.duration_minutes);
      
      if (Object.keys(metadata).length > 0) {
        actionData.metadata = metadata;
      }

      const { error } = await supabase
        .from('actions')
        .insert(actionData);

      if (error) throw error;

      toast.success('Action logged successfully');
      handleReset();
      setIsOpen(false);
      onActionLogged?.();
    } catch (error) {
      console.error('Error logging action:', error);
      toast.error('Failed to log action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      action_type: '',
      description: '',
      priority: 'medium',
      outcome: '',
      next_action: '',
      duration_minutes: ''
    });
    setSelectedCategory('');
  };

  const handleCancel = () => {
    handleReset();
    setIsOpen(false);
  };

  const getAvailableActions = () => {
    if (!selectedCategory) return [];
    return ACTION_CATEGORIES[selectedCategory as keyof typeof ACTION_CATEGORIES]?.actions || [];
  };

  const getSelectedActionIcon = () => {
    if (!formData.action_type) return null;
    
    for (const category of Object.values(ACTION_CATEGORIES)) {
      const action = category.actions.find(a => a.value === formData.action_type);
      if (action) return action.icon;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Log New Action
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Log New Action
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Record actions taken on this case for audit trail and progress tracking
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Action Category</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ACTION_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(key);
                        setFormData(prev => ({ ...prev, action_type: '' }));
                      }}
                      disabled={isLoading}
                      className={`p-3 rounded-lg border-2 transition-all text-left hover-scale ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.actions.length} actions available
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Action Selection */}
            {selectedCategory && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-medium">Specific Action</Label>
                <div className="grid grid-cols-1 gap-2">
                  {getAvailableActions().map((action) => {
                    const ActionIcon = action.icon;
                    const isSelected = formData.action_type === action.value;
                    return (
                      <button
                        key={action.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, action_type: action.value }))}
                        disabled={isLoading}
                        className={`p-3 rounded-lg border text-left transition-all hover-scale ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ActionIcon className="h-4 w-4" />
                          <span className="font-medium text-sm">{action.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Priority and Duration */}
            {formData.action_type && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g. 15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    disabled={isLoading}
                    min="1"
                    max="480"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {formData.action_type && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the action taken, including any relevant context, outcomes, or next steps..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  disabled={isLoading}
                  className="resize-none"
                />
              </div>
            )}

            {/* Outcome and Next Action */}
            {formData.description && (
              <div className="space-y-4 animate-fade-in">
                <Separator />
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outcome" className="text-sm font-medium">Outcome/Result</Label>
                    <Textarea
                      id="outcome"
                      placeholder="What was achieved or discovered from this action?"
                      value={formData.outcome}
                      onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                      rows={2}
                      disabled={isLoading}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_action" className="text-sm font-medium">Recommended Next Action</Label>
                    <Textarea
                      id="next_action"
                      placeholder="What should be done next based on this action?"
                      value={formData.next_action}
                      onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
                      rows={2}
                      disabled={isLoading}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.action_type || !formData.description.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Logging...' : 'Log Action'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}