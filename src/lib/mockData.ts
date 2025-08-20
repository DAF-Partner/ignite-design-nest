// Mock Data for B2B Debt Collection Platform Demo
// Comprehensive test data for all user roles and features

import { 
  Case, 
  Approval, 
  Document, 
  Invoice, 
  GdprRequest, 
  Notification,
  CaseEvent,
  Tariff,
  MessageTemplate,
  DashboardStats,
  User
} from '@/types';

// Mock Cases Data
export const mockCases: Case[] = [
  {
    id: 'case_1',
    reference: 'REF-2024-001',
    clientId: 'client_1',
    clientName: 'TechCorp Solutions',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Sarah Johnson',
    debtor: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+49 123 456 7890',
      address: {
        street: '123 Main Street',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
      },
    },
    amount: 2500.00,
    currency: 'EUR',
    status: 'in_progress' as CaseStatus,
    description: 'Outstanding invoice for software licensing services provided in Q3 2024.',
    originalCreditor: 'TechCorp Solutions',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Events Data
export const mockEvents: CaseEvent[] = [
  {
    id: 'event_1',
    caseId: 'case_1',
    type: 'status_change',
    title: 'Case Status Updated',
    description: 'Case status changed from "new" to "in_progress"',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      previousStatus: 'new',
      newStatus: 'in_progress',
      changedBy: 'Sarah Johnson',
    },
  },
];

// Mock Messages Data
export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    caseId: 'case_1',
    direction: 'outbound',
    channel: 'email',
    content: 'Dear Mr. Doe, this is a reminder that your invoice #2024-001 for €2,500.00 is overdue.',
    templateId: 'reminder_template_1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'approval_001',
    caseId: 'case_002',
    caseName: 'Case #002 - Apex Consulting Group',
    type: 'legal_escalation',
    state: 'pending',
    requestedBy: 'agent_2',
    requestedByName: 'Michael Chen',
    amount: 8250.00,
    currency: 'GBP',
    description: 'Request approval for legal escalation due to non-response for 30 days',
    clauseId: 'clause_legal_001',
    clauseText: 'Legal escalation may incur additional fees of 15% of outstanding amount plus fixed legal costs of £500.',
    feeBreakdown: {
      baseAmount: 8250.00,
      percentage: 15,
      fixedFee: 500.00,
      vatAmount: 262.50,
      totalFee: 1762.50,
      currency: 'GBP',
    },
    createdAt: '2024-12-19T10:30:00Z',
  },
  {
    id: 'approval_002',
    caseId: 'case_001',
    caseName: 'Case #001 - Global Tech Solutions',
    type: 'expense',
    state: 'approved',
    requestedBy: 'agent_1',
    requestedByName: 'Sarah Johnson',
    amount: 150.00,
    currency: 'GBP',
    description: 'Skip tracing services to locate updated debtor contact information',
    createdAt: '2024-12-18T09:15:00Z',
    decidedAt: '2024-12-18T14:22:00Z',
    decidedBy: 'admin_1',
    decisionNotes: 'Approved - necessary for case progression',
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    caseId: 'case_1',
    filename: 'invoice_2024_001.pdf',
    category: 'invoice',
    version: 1,
    retentionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    caseId: 'case_005',
    caseName: 'Case #005 - Innovation Labs Inc',
    clientId: 'client_2',
    clientName: 'Sterling Financial Services',
    invoiceNumber: 'CP-2024-001',
    amount: 1920.00,
    vatAmount: 384.00,
    totalAmount: 2304.00,
    currency: 'GBP',
    status: 'paid',
    dueDate: '2024-12-25T00:00:00Z',
    createdAt: '2024-12-10T15:20:00Z',
    paidAt: '2024-12-15T10:30:00Z',
    items: [
      {
        description: 'Debt Collection Services - Case #005',
        quantity: 1,
        unitPrice: 1920.00,
        vatRate: 20,
        total: 1920.00,
      },
    ],
  },
  {
    id: 'inv_002',
    caseId: 'case_002',
    caseName: 'Case #002 - Apex Consulting Group',
    clientId: 'client_1',
    clientName: 'ACME Manufacturing Ltd',
    invoiceNumber: 'CP-2024-002',
    amount: 1237.50,
    vatAmount: 247.50,
    totalAmount: 1485.00,
    currency: 'GBP',
    status: 'sent',
    dueDate: '2025-01-19T00:00:00Z',
    createdAt: '2024-12-19T10:45:00Z',
    items: [
      {
        description: 'Collection Services - Monthly Fee',
        quantity: 1,
        unitPrice: 1237.50,
        vatRate: 20,
        total: 1237.50,
      },
    ],
  },
];

// Mock GDPR Requests
export const mockGdprRequests: GdprRequest[] = [
  {
    id: 'gdpr_001',
    type: 'SAR',
    status: 'processing',
    requestedBy: 'client_1',
    requestedByName: 'ACME Manufacturing Ltd',
    dataSubject: 'Global Tech Solutions',
    description: 'Subject Access Request for all data held regarding Global Tech Solutions',
    dueDate: '2025-01-19T00:00:00Z',
    createdAt: '2024-12-19T11:00:00Z',
    affectedCases: ['case_001'],
  },
  {
    id: 'gdpr_002',
    type: 'ERASURE',
    status: 'completed',
    requestedBy: 'dpo_1',
    requestedByName: 'Jane Smith (DPO)',
    dataSubject: 'Defunct Corp Ltd',
    description: 'Right to erasure request - company dissolved',
    dueDate: '2024-12-15T00:00:00Z',
    createdAt: '2024-11-15T14:30:00Z',
    completedAt: '2024-12-14T16:20:00Z',
    downloadUrl: '/api/v1/gdpr/certificates/gdpr_002.pdf',
    affectedCases: ['case_006'],
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalCases: 47,
  activeCases: 23,
  pendingApprovals: 3,
  overdueInvoices: 1,
  totalRecovered: 384750.00,
  monthlyRecovered: 45230.00,
  averageRecoveryTime: 42, // days
  successRate: 78.5, // percentage
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'client_1',
    email: 'client@example.com',
    name: 'ACME Manufacturing Ltd',
    role: 'CLIENT',
    clientId: 'client_1',
    createdAt: '2024-01-15T09:00:00Z',
    lastLoginAt: '2024-12-19T08:30:00Z',
  },
  {
    id: 'agent_1',
    email: 'agent@example.com',
    name: 'Sarah Johnson',
    role: 'AGENT',
    createdAt: '2024-02-01T10:00:00Z',
    lastLoginAt: '2024-12-19T09:15:00Z',
  },
  {
    id: 'admin_1',
    email: 'admin@example.com',
    name: 'John Administrator',
    role: 'ADMIN',
    createdAt: '2024-01-01T08:00:00Z',
    lastLoginAt: '2024-12-19T07:45:00Z',
  },
  {
    id: 'dpo_1',
    email: 'dpo@example.com',
    name: 'Jane Smith',
    role: 'DPO',
    createdAt: '2024-01-01T08:00:00Z',
    lastLoginAt: '2024-12-18T16:30:00Z',
  },
];

// Helper functions to get filtered data based on user role
export function getCasesForUser(userId: string, userRole: string): Case[] {
  switch (userRole) {
    case 'CLIENT':
      const user = mockUsers.find(u => u.id === userId);
      return mockCases.filter(c => c.clientId === user?.clientId);
    case 'AGENT':
      return mockCases.filter(c => c.assignedAgentId === userId);
    case 'ADMIN':
    case 'DPO':
      return mockCases;
    default:
      return [];
  }
}

export function getApprovalsForUser(userId: string, userRole: string): Approval[] {
  switch (userRole) {
    case 'CLIENT':
      const userCases = getCasesForUser(userId, userRole);
      const caseIds = userCases.map(c => c.id);
      return mockApprovals.filter(a => caseIds.includes(a.caseId));
    case 'ADMIN':
      return mockApprovals;
    default:
      return [];
  }
}

export function getInvoicesForUser(userId: string, userRole: string): Invoice[] {
  switch (userRole) {
    case 'CLIENT':
      const user = mockUsers.find(u => u.id === userId);
      return mockInvoices.filter(i => i.clientId === user?.clientId);
    case 'ADMIN':
      return mockInvoices;
    default:
      return [];
  }
}

export function getDashboardStatsForUser(userId: string, userRole: string): DashboardStats {
  // In a real app, this would be filtered based on user access
  // For now, return the same stats but could be customized per role
  return mockDashboardStats;
}