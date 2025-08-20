// Professional Invoice Management Page for B2B Debt Collection Platform
// Complete invoice tracking with status management and financial reporting

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CreditCard,
  Download,
  Eye,
  Filter,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Calculator,
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  Receipt,
  Mail
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Money } from '@/components/ui/money';

import { useAuth } from '@/components/auth/AuthProvider';
import { getInvoicesForUser } from '@/lib/mockData';
import type { Invoice } from '@/types';

const statusConfig = {
  draft: { 
    label: 'Draft', 
    icon: FileText, 
    variant: 'secondary' as const,
    description: 'Invoice being prepared'
  },
  sent: { 
    label: 'Sent', 
    icon: Send, 
    variant: 'default' as const,
    description: 'Invoice sent to client'
  },
  viewed: { 
    label: 'Viewed', 
    icon: Eye, 
    variant: 'default' as const,
    description: 'Client has viewed invoice'
  },
  paid: { 
    label: 'Paid', 
    icon: CheckCircle, 
    variant: 'success' as const,
    description: 'Payment received'
  },
  overdue: { 
    label: 'Overdue', 
    icon: AlertTriangle, 
    variant: 'destructive' as const,
    description: 'Payment past due date'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: FileText, 
    variant: 'secondary' as const,
    description: 'Invoice cancelled'
  }
};

export default function Invoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Load invoices data
  useEffect(() => {
    if (user) {
      const userInvoices = getInvoicesForUser(user.id, user.role);
      setInvoices(userInvoices);
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.clientName.toLowerCase().includes(query) ||
        invoice.caseName.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'this_month':
          filterDate.setMonth(now.getMonth());
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getMonth() === filterDate.getMonth() &&
            new Date(invoice.createdAt).getFullYear() === filterDate.getFullYear()
          );
          break;
        case 'last_month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getMonth() === filterDate.getMonth() &&
            new Date(invoice.createdAt).getFullYear() === filterDate.getFullYear()
          );
          break;
        case 'this_year':
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getFullYear() === now.getFullYear()
          );
          break;
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, searchQuery, dateFilter]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate download
    toast({
      title: 'Download Started',
      description: `Downloading invoice ${invoice.invoiceNumber}`
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast({
      title: 'Reminder Sent',
      description: `Payment reminder sent for invoice ${invoice.invoiceNumber}`
    });
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    paidValue: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').length,
    overdueValue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
    sent: invoices.filter(i => i.status === 'sent').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">
            Track and manage your collection service invoices
          </p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <Button onClick={() => navigate('/invoices/new')}>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.totalValue} currency="GBP" />
                </p>
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
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.paidValue} currency="GBP" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.overdueValue} currency="GBP" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Send className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
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
                  placeholder="Search by invoice number, client, or case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="grid gap-6">
        {filteredInvoices.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Invoices will appear here when created.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status].icon;
            const isOverdue = invoice.status === 'overdue';
            
            return (
              <Card key={invoice.id} className="card-professional hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      <StatusIcon className={`h-6 w-6 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Invoice {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {invoice.clientName} • {invoice.caseName}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusBadge status={invoice.status} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold">
                            <Money amount={invoice.amount} currency={invoice.currency} />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">VAT</p>
                          <p className="font-semibold">
                            <Money amount={invoice.vatAmount} currency={invoice.currency} />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold text-lg">
                            <Money amount={invoice.totalAmount} currency={invoice.currency} />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-semibold">
                            {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</span>
                          {invoice.paidAt && (
                            <span>Paid {format(new Date(invoice.paidAt), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          
                          {invoice.status === 'sent' && user?.role === 'ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendReminder(invoice)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Remind
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Invoice ${selectedInvoice.invoiceNumber} for ${selectedInvoice.clientName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <ScrollArea className="max-h-96">
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Invoice {selectedInvoice.invoiceNumber}</h3>
                    <p className="text-muted-foreground">{selectedInvoice.caseName}</p>
                  </div>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                
                <Separator />
                
                {/* Client Information */}
                <div>
                  <h4 className="font-medium mb-2">Bill To</h4>
                  <p className="font-semibold">{selectedInvoice.clientName}</p>
                </div>
                
                <Separator />
                
                {/* Line Items */}
                <div>
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × <Money amount={item.unitPrice} currency={selectedInvoice.currency} />
                          </p>
                        </div>
                        <p className="font-semibold">
                          <Money amount={item.total} currency={selectedInvoice.currency} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p><Money amount={selectedInvoice.amount} currency={selectedInvoice.currency} /></p>
                  </div>
                  <div className="flex justify-between">
                    <p>VAT (20%)</p>
                    <p><Money amount={selectedInvoice.vatAmount} currency={selectedInvoice.currency} /></p>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <p>Total</p>
                    <p><Money amount={selectedInvoice.totalAmount} currency={selectedInvoice.currency} /></p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(selectedInvoice.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p>{format(new Date(selectedInvoice.dueDate), 'PPP')}</p>
                  </div>
                  {selectedInvoice.paidAt && (
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p>{format(new Date(selectedInvoice.paidAt), 'PPP')}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}