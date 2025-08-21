// Professional Dashboard for B2B Debt Collection Platform
// Role-specific dashboards with key metrics and actions

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  CreditCard,
  Scale,
  Shield,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Money } from '@/components/ui/money';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  mockDashboardStats, 
  getCasesForUser, 
  getApprovalsForUser, 
  getInvoicesForUser 
} from '@/lib/mockData';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: number;
  className?: string;
  onClick?: () => void;
}

function DashboardCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  onClick 
}: DashboardCardProps) {
  return (
    <Card 
      className={cn(
        'card-professional hover:shadow-popover transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center pt-1">
            <TrendingUp className={cn(
              "h-3 w-3 mr-1",
              trend > 0 ? "text-success" : "text-destructive"
            )} />
            <span className={cn(
              "text-xs font-medium",
              trend > 0 ? "text-success" : "text-destructive"
            )}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) return null;

  const stats = mockDashboardStats;
  const userCases = getCasesForUser(user.id, user.role);
  const userApprovals = getApprovalsForUser(user.id, user.role);
  const userInvoices = getInvoicesForUser(user.id, user.role);

  const recentCases = userCases.slice(0, 5);
  const pendingApprovals = userApprovals.filter(a => a.state === 'pending');
  const overdueInvoices = userInvoices.filter(i => 
    i.status === 'overdue' || 
    (i.status === 'sent' && new Date(i.dueDate) < new Date())
  );

  // Role-specific dashboard configurations
  const getDashboardConfig = () => {
    switch (user.role) {
      case 'CLIENT':
        return {
          title: t('clientDashboard'),
          subtitle: t('clientDashboardSubtitle'),
          primaryActions: [
            {
              label: t('createNewCase'),
              icon: FileText,
              onClick: () => navigate('/cases/new'),
              variant: 'default' as const,
            },
            {
              label: t('viewAllCases'),
              icon: Users,
              onClick: () => navigate('/cases'),
              variant: 'outline' as const,
            },
          ],
        };
      case 'AGENT':
        return {
          title: t('agentDashboard'),
          subtitle: t('agentDashboardSubtitle'),
          primaryActions: [
            {
              label: t('myCases'),
              icon: FileText,
              onClick: () => navigate('/cases'),
              variant: 'default' as const,
            },
            {
              label: t('recentActivity'),
              icon: Activity,
              onClick: () => navigate('/cases?filter=recent'),
              variant: 'outline' as const,
            },
          ],
        };
      case 'ADMIN':
        return {
          title: t('adminDashboard'),
          subtitle: t('adminDashboardSubtitle'),
          primaryActions: [
            {
              label: t('manageUsers'),
              icon: Users,
              onClick: () => navigate('/admin/users'),
              variant: 'default' as const,
            },
            {
              label: t('reviewApprovals'),
              icon: CheckCircle,
              onClick: () => navigate('/approvals'),
              variant: 'outline' as const,
            },
          ],
        };
      case 'DPO':
        return {
          title: t('dataProtectionDashboard'),
          subtitle: t('dpoDashboardSubtitle'),
          primaryActions: [
            {
              label: t('gdprRequestsNav'),
              icon: Shield,
              onClick: () => navigate('/gdpr'),
              variant: 'default' as const,
            },
            {
              label: t('dpoTools'),
              icon: Scale,
              onClick: () => navigate('/dpo'),
              variant: 'outline' as const,
            },
          ],
        };
      default:
        return {
          title: t('dashboardTitle'),
          subtitle: `${t('welcomeBack')} CollectPro`,
          primaryActions: [],
        };
    }
  };

  const config = getDashboardConfig();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {config.primaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title={t('totalCases')}
          value={userCases.length}
          description={t('allCasesAccess')}
          icon={FileText}
          onClick={() => navigate('/cases')}
        />
        <DashboardCard
          title={t('activeCases')}
          value={userCases.filter(c => ['new', 'in_progress', 'awaiting_approval', 'legal_stage'].includes(c.status)).length}
          description={t('currentlyBeingProcessed')}
          icon={Clock}
          onClick={() => navigate('/cases?status=active')}
        />
        <DashboardCard
          title={t('pendingApprovals')}
          value={pendingApprovals.length}
          description={t('awaitingYourDecision')}
          icon={AlertTriangle}
          onClick={() => navigate('/approvals')}
        />
        <DashboardCard
          title={t('successRate')}
          value={`${stats.successRate}%`}
          description={t('casesSuccessfullyResolved')}
          icon={Target}
          trend={5.2}
        />
      </div>

      {/* Additional Role-Specific Metrics */}
      {(user.role === 'CLIENT' || user.role === 'ADMIN') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Total Recovered"
            value={`£${stats.totalRecovered.toLocaleString('en-GB')}`}
            description="Lifetime recovery amount"
            icon={TrendingUp}
            trend={12.3}
          />
          <DashboardCard
            title="This Month"
            value={`£${stats.monthlyRecovered.toLocaleString('en-GB')}`}
            description="Monthly recovery progress"
            icon={Calendar}
            trend={8.7}
          />
          <DashboardCard
            title="Outstanding Invoices"
            value={overdueInvoices.length}
            description="Require immediate attention"
            icon={CreditCard}
            onClick={() => navigate('/invoices?status=overdue')}
          />
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Cases */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-lg">Recent Cases</CardTitle>
            <CardDescription>Your most recently updated cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCases.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No cases found</p>
              </div>
            ) : (
              recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/cases/${case_.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{case_.debtor.name}</p>
                      <StatusBadge status={case_.status} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Money amount={case_.amount} currency={case_.currency} size="sm" />
                      {case_.assignedAgentName && (
                        <span className="ml-2">• {case_.assignedAgentName}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            {recentCases.length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => navigate('/cases')}
              >
                View All Cases
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-lg">Pending Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Approvals ({pendingApprovals.length})
                </h4>
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate('/approvals')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{approval.caseName}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {approval.type.replace('_', ' ')}
                        {approval.amount && (
                          <>
                            {' • '}
                            <Money amount={approval.amount} currency={approval.currency || 'GBP'} size="sm" />
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={approval.state} size="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Overdue Invoices ({overdueInvoices.length})
                </h4>
                {overdueInvoices.slice(0, 2).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate('/invoices')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        <Money amount={invoice.totalAmount} currency={invoice.currency} size="sm" />
                        {' • Due: '}
                        {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <StatusBadge status={invoice.status} size="sm" />
                  </div>
                ))}
              </div>
            )}

            {pendingApprovals.length === 0 && overdueInvoices.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All caught up!</p>
                <p className="text-sm">No pending actions at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      {user.role === 'ADMIN' && (
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-lg">System Performance</CardTitle>
            <CardDescription>Key performance indicators across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Collection Rate</span>
                  <span className="text-sm text-muted-foreground">{stats.successRate}%</span>
                </div>
                <Progress value={stats.successRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Recovery Time</span>
                  <span className="text-sm text-muted-foreground">{stats.averageRecoveryTime} days</span>
                </div>
                <Progress value={(90 - stats.averageRecoveryTime) / 90 * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Cases</span>
                  <span className="text-sm text-muted-foreground">{stats.activeCases}</span>
                </div>
                <Progress value={stats.activeCases / stats.totalCases * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Target</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}