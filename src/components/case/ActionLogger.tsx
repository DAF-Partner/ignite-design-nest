import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface ActionLoggerProps {
  caseId: string;
  onActionLogged?: () => void;
}

const ACTION_TYPES = [
  { value: 'contact_attempt', label: 'Contact Attempt' },
  { value: 'document_review', label: 'Document Review' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'payment_plan', label: 'Payment Plan Setup' },
  { value: 'legal_action', label: 'Legal Action' },
  { value: 'settlement', label: 'Settlement Discussion' },
  { value: 'case_update', label: 'Case Update' },
  { value: 'client_communication', label: 'Client Communication' },
  { value: 'other', label: 'Other' }
];

export function ActionLogger({ caseId, onActionLogged }: ActionLoggerProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    action_type: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !formData.action_type || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('actions')
        .insert({
          case_id: caseId,
          agent_id: user.id,
          action_type: formData.action_type,
          description: formData.description.trim(),
          status: 'completed'
        });

      if (error) throw error;

      toast.success('Action logged successfully');
      setFormData({ action_type: '', description: '' });
      setIsOpen(false);
      onActionLogged?.();
    } catch (error) {
      console.error('Error logging action:', error);
      toast.error('Failed to log action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ action_type: '', description: '' });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Log Action
      </Button>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log New Action
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action_type">Action Type</Label>
            <Select
              value={formData.action_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, action_type: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the action taken..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
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
      </CardContent>
    </Card>
  );
}