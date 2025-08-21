import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import type { CaseIntake } from '@/types';

export default function CaseIntakes() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [caseIntakes, setCaseIntakes] = useState<CaseIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadCaseIntakes();
  }, [statusFilter]);

  const loadCaseIntakes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter) {
        params.status = [statusFilter];
      }
      
      if (hasRole('CLIENT') && user?.id) {
        params.clientId = user.id;
      }
      
      if (hasRole('AGENT') && user?.id) {
        params.assignedAgentId = user.id;
      }

      const response = await apiClient.caseIntakes.getCaseIntakes(params);
      setCaseIntakes(response.data);
    } catch (error) {
      console.error('Failed to load case intakes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case intakes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCaseIntakes = caseIntakes.filter(intake =>
    search === '' || 
    intake.reference.toLowerCase().includes(search.toLowerCase()) ||
    intake.debtorName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Case Intakes</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading case intakes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Case Intakes</h1>
        {(hasRole('CLIENT') || hasRole('ADMIN')) && (
          <Button onClick={() => navigate('/case-intakes/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Case Intake
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or debtor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Case Intakes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Case Intakes ({filteredCaseIntakes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCaseIntakes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No case intakes found</p>
              {(hasRole('CLIENT') || hasRole('ADMIN')) && (
                <Button onClick={() => navigate('/case-intakes/new')}>
                  Create your first case intake
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Debtor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCaseIntakes.map((intake) => (
                  <TableRow key={intake.id}>
                    <TableCell className="font-medium">{intake.reference}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{intake.debtorName}</div>
                        <div className="text-sm text-muted-foreground">{intake.debtorType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(intake.status) === 'destructive' ? 'destructive' : 'default'}>
                        {intake.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(intake.totalAmount, intake.currencyCode)}
                    </TableCell>
                    <TableCell>
                      {new Date(intake.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/case-intakes/${intake.id}`)}
                        >
                          View
                        </Button>
                        {intake.status === 'submitted' && hasRole('ADMIN') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/case-intakes/${intake.id}/review`)}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}