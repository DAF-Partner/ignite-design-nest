import React, { useEffect, useState } from 'react';
import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Action {
  id: string;
  case_id: string;
  agent_id: string;
  action_type: string;
  description: string;
  status: string;
  created_at: string;
}

interface ActionHistoryProps {
  caseId: string;
  refreshTrigger?: number;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  contact_attempt: 'Contact Attempt',
  document_review: 'Document Review',
  negotiation: 'Negotiation',
  payment_plan: 'Payment Plan Setup',
  legal_action: 'Legal Action',
  settlement: 'Settlement Discussion',
  case_update: 'Case Update',
  client_communication: 'Client Communication',
  other: 'Other'
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  contact_attempt: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  document_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  payment_plan: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  legal_action: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  settlement: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  case_update: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  client_communication: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
};

export function ActionHistory({ caseId, refreshTrigger }: ActionHistoryProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActions(data || []);
    } catch (error) {
      console.error('Error fetching actions:', error);
      toast.error('Failed to load action history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [caseId, refreshTrigger]);

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading actions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Action History ({actions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No actions logged yet</p>
            </div>
          ) : (
            actions.map((action, index) => (
              <div key={action.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  {index < actions.length - 1 && (
                    <div className="h-8 w-0.5 bg-border mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={ACTION_TYPE_COLORS[action.action_type] || ACTION_TYPE_COLORS.other}
                      >
                        {ACTION_TYPE_LABELS[action.action_type] || 'Other'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}