import React, { useEffect, useState } from 'react';
import { Clock, User, Phone, Mail, FileText, MessageSquare, Scale, HandCoins, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  metadata?: {
    priority?: string;
    outcome?: string;
    next_action?: string;
    duration_minutes?: number;
  } | null;
}

interface ActionHistoryProps {
  caseId: string;
  refreshTrigger?: number;
}

const ACTION_TYPE_LABELS: Record<string, { label: string; icon: any; category: string }> = {
  // Communication
  phone_call: { label: 'Phone Call', icon: Phone, category: 'Communication' },
  email_sent: { label: 'Email Sent', icon: Mail, category: 'Communication' },
  letter_sent: { label: 'Letter Sent', icon: FileText, category: 'Communication' },
  meeting: { label: 'Meeting', icon: User, category: 'Communication' },
  
  // Case Management
  document_review: { label: 'Document Review', icon: FileText, category: 'Case Management' },
  case_analysis: { label: 'Case Analysis', icon: FileText, category: 'Case Management' },
  status_update: { label: 'Status Update', icon: Clock, category: 'Case Management' },
  client_communication: { label: 'Client Communication', icon: MessageSquare, category: 'Case Management' },
  
  // Negotiation & Settlement
  negotiation: { label: 'Negotiation Session', icon: HandCoins, category: 'Negotiation' },
  settlement_offer: { label: 'Settlement Offer', icon: HandCoins, category: 'Negotiation' },
  payment_plan: { label: 'Payment Plan Setup', icon: Clock, category: 'Negotiation' },
  discount_approved: { label: 'Discount Approved', icon: HandCoins, category: 'Negotiation' },
  
  // Legal Actions
  legal_notice: { label: 'Legal Notice Sent', icon: AlertTriangle, category: 'Legal' },
  court_filing: { label: 'Court Filing', icon: Scale, category: 'Legal' },
  legal_consultation: { label: 'Legal Consultation', icon: Scale, category: 'Legal' },
  enforcement_action: { label: 'Enforcement Action', icon: AlertTriangle, category: 'Legal' },
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  // Communication - Blue theme
  phone_call: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  email_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  letter_sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  
  // Case Management - Purple theme
  document_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  case_analysis: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  status_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  client_communication: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  
  // Negotiation & Settlement - Green theme
  negotiation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  settlement_offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  payment_plan: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  discount_approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  
  // Legal Actions - Red theme
  legal_notice: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  court_filing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  legal_consultation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enforcement_action: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  
  // Fallback
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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

      setActions((data || []).map(action => ({
        ...action,
        metadata: action.metadata && typeof action.metadata === 'object' 
          ? action.metadata as Action['metadata'] 
          : null
      })));
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
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          Action History ({actions.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete log of all actions taken on this case
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {actions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Actions Logged</h3>
              <p className="text-sm">Actions taken on this case will appear here</p>
            </div>
          ) : (
            actions.map((action, index) => {
              const actionInfo = ACTION_TYPE_LABELS[action.action_type] || {
                label: action.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                icon: Clock,
                category: 'Other'
              };
              const ActionIcon = actionInfo.icon;
              const hasMetadata = action.metadata && Object.keys(action.metadata).length > 0;

              return (
                <div key={action.id} className="relative">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2.5 bg-primary/10 rounded-full">
                        <ActionIcon className="h-4 w-4 text-primary" />
                      </div>
                      {index < actions.length - 1 && (
                        <div className="h-full w-0.5 bg-border mt-3"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={ACTION_TYPE_COLORS[action.action_type] || ACTION_TYPE_COLORS.other}
                          >
                            {actionInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {actionInfo.category}
                          </Badge>
                          {action.metadata?.priority && action.metadata.priority !== 'medium' && (
                            <Badge 
                              variant="secondary"
                              className={PRIORITY_COLORS[action.metadata.priority]}
                            >
                              {action.metadata.priority.charAt(0).toUpperCase() + action.metadata.priority.slice(1)} Priority
                            </Badge>
                          )}
                          {action.metadata?.duration_minutes && (
                            <Badge variant="outline" className="text-xs">
                              {action.metadata.duration_minutes}min
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(action.created_at).toLocaleString('en-GB')}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="space-y-3">
                        <p className="text-sm leading-relaxed">{action.description}</p>
                        
                        {/* Additional Details */}
                        {hasMetadata && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              {action.metadata?.outcome && (
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Outcome
                                  </h5>
                                  <p className="text-sm text-foreground">{action.metadata.outcome}</p>
                                </div>
                              )}
                              
                              {action.metadata?.next_action && (
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Next Action Recommended
                                  </h5>
                                  <p className="text-sm text-foreground">{action.metadata.next_action}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}