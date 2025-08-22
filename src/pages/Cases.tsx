// Professional Cases List Page for B2B Debt Collection Platform
// Advanced filtering, search, pagination, and role-based data scoping

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, FileText, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { Money } from '@/components/ui/money';
import { useAuth } from '@/components/auth/AuthProvider';
import { caseApi } from '@/lib/api/caseApi';
import { Case, CaseStatus } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function Cases() {
  const { user, hasRole } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [caseList, setCaseList] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load cases from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await caseApi.getCases();
        if (isMounted) setCaseList(data);
      } catch (e: any) {
        console.error('Failed to load cases', e);
        if (isMounted) setError(e.message || 'Failed to load cases');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Filter cases based on user role and permissions
  const filteredCases = useMemo(() => {
    let data = caseList;

    // Role-based filtering
    if (hasRole('CLIENT') && user?.clientId) {
      data = data.filter(c => c.clientId === user.clientId);
    } else if (hasRole('AGENT') && user?.id) {
      data = data.filter(c => c.assignedAgentId === user.id);
    }
    // ADMIN and DPO see all cases

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(c => 
        c.debtor.name.toLowerCase().includes(query) ||
        c.debtor.email.toLowerCase().includes(query) ||
        c.reference.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      data = data.filter(c => c.status === statusFilter);
    }

    // Sort
    data = [...data].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return data;
  }, [caseList, user, hasRole, searchQuery, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCases = () => {
    // Convert to CSV and download
    const csvContent = [
      ['Reference', 'Debtor', 'Amount', 'Status', 'Created', 'Updated'].join(','),
      ...filteredCases.map(c => [
        c.reference,
        `"${c.debtor.name}"`,
        c.amount,
        c.status,
        new Date(c.createdAt).toLocaleDateString('en-GB'),
        new Date(c.updatedAt).toLocaleDateString('en-GB')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('casesTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('casesDescription')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCases}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {(hasRole(['CLIENT', 'ADMIN'])) && (
            <Button asChild>
              <Link to="/cases/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Case
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by debtor name, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: CaseStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                <SelectItem value="legal_stage">Legal Stage</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('_');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">Newest First</SelectItem>
                <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                <SelectItem value="updatedAt_desc">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedCases.length} of {filteredCases.length} cases
        </span>
        {filteredCases.length > ITEMS_PER_PAGE && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <Card className="card-professional">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('createdAt')}
              >
                Reference
                {sortBy === 'createdAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Debtor</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortBy === 'amount' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('updatedAt')}
              >
                Last Updated
                {sortBy === 'updatedAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-muted-foreground">Loading cases...</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-destructive">Failed to load cases: {error}</div>
                </TableCell>
              </TableRow>
            ) : paginatedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'No cases match your filters' 
                        : 'No cases found'
                      }
                    </p>
                    {hasRole(['CLIENT', 'ADMIN']) && !searchQuery && statusFilter === 'all' && (
                      <Button asChild variant="outline" className="mt-2">
                        <Link to="/cases/new">Create First Case</Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCases.map((case_) => (
                <TableRow key={case_.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <Link 
                      to={`/cases/${case_.id}`}
                      className="text-primary hover:underline"
                    >
                      {case_.reference}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{case_.debtor.name}</div>
                      <div className="text-sm text-muted-foreground">{case_.debtor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={case_.amount} currency={case_.currency} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={case_.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {case_.clientName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {case_.assignedAgentName || (
                      <span className="italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(case_.updatedAt).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/cases/${case_.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}