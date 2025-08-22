// Mock Data for B2B Debt Collection Platform Demo
// Comprehensive test data for all user roles and features

import { 
  Case, 
  CaseStatus,
  Message,
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
    id: '550e8400-e29b-41d4-a716-446655440001',
    reference: 'REF-2024-001',
    clientId: 'client_1',
    clientName: 'ACME Manufacturing Ltd',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Sarah Johnson',
    debtor: {
      name: 'Global Tech Solutions',
      email: 'accounts@globaltech.com',
      phone: '+44 20 7123 4567',
      address: {
        street: '45 Tech Park Road',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom',
      },
    },
    amount: 12500.00,
    currency: 'GBP',
    status: 'in_progress' as CaseStatus,
    description: 'Outstanding invoice for manufacturing equipment supplied in Q2 2024.',
    originalCreditor: 'ACME Manufacturing Ltd',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    reference: 'REF-2024-002',
    clientId: 'client_1',
    clientName: 'ACME Manufacturing Ltd',
    assignedAgentId: 'agent_2',
    assignedAgentName: 'Michael Chen',
    debtor: {
      name: 'Apex Consulting Group',
      email: 'finance@apexconsulting.com',
      phone: '+44 161 234 5678',
      address: {
        street: '78 Business Square',
        city: 'Manchester',
        postalCode: 'M1 2AB',
        country: 'United Kingdom',
      },
    },
    amount: 8250.00,
    currency: 'GBP',
    status: 'awaiting_approval' as CaseStatus,
    description: 'Unpaid consulting fees for strategic business review.',
    originalCreditor: 'ACME Manufacturing Ltd',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    reference: 'REF-2024-003',
    clientId: 'client_2',
    clientName: 'Sterling Financial Services',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Sarah Johnson',
    debtor: {
      name: 'Innovation Labs Inc',
      email: 'billing@innovationlabs.com',
      phone: '+1 555 123 4567',
      address: {
        street: '100 Innovation Drive',
        city: 'New York',
        postalCode: '10001',
        country: 'United States',
      },
    },
    amount: 15750.00,
    currency: 'USD',
    status: 'resolved' as CaseStatus,
    description: 'Outstanding payment for financial advisory services.',
    originalCreditor: 'Sterling Financial Services',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    reference: 'REF-2024-004',
    clientId: 'client_2',
    clientName: 'Sterling Financial Services',
    assignedAgentId: 'agent_3',
    assignedAgentName: 'Emma Thompson',
    debtor: {
      name: 'Digital Marketing Pro',
      email: 'accounts@digitalmarketingpro.com',
      phone: '+44 207 987 6543',
      address: {
        street: '22 Marketing Lane',
        city: 'London',
        postalCode: 'E1 6AN',
        country: 'United Kingdom',
      },
    },
    amount: 4500.00,
    currency: 'GBP',
    status: 'new' as CaseStatus,
    description: 'Overdue payment for digital marketing campaign services.',
    originalCreditor: 'Sterling Financial Services',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    reference: 'REF-2024-005',
    clientId: 'client_3',
    clientName: 'Nordic Enterprises',
    assignedAgentId: 'agent_2',
    assignedAgentName: 'Michael Chen',
    debtor: {
      name: 'Sustainable Solutions Ltd',
      email: 'finance@sustainablesolutions.com',
      phone: '+47 22 12 34 56',
      address: {
        street: '15 Green Valley Road',
        city: 'Oslo',
        postalCode: '0150',
        country: 'Norway',
      },
    },
    amount: 22000.00,
    currency: 'NOK',
    status: 'legal_stage' as CaseStatus,
    description: 'Unpaid invoice for sustainable energy consulting project.',
    originalCreditor: 'Nordic Enterprises',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    reference: 'REF-2024-006',
    clientId: 'client_3',
    clientName: 'Nordic Enterprises',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Sarah Johnson',
    debtor: {
      name: 'Tech Startup Hub',
      email: 'billing@techstartuphub.com',
      phone: '+46 8 123 456 78',
      address: {
        street: '33 Innovation Street',
        city: 'Stockholm',
        postalCode: '111 29',
        country: 'Sweden',
      },
    },
    amount: 18500.00,
    currency: 'SEK',
    status: 'closed' as CaseStatus,
    description: 'Outstanding fees for business incubation services.',
    originalCreditor: 'Nordic Enterprises',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Events Data
export const mockEvents: CaseEvent[] = [
  {
    id: 'event_001',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
    type: 'status_change',
    title: 'Case Status Updated',
    description: 'Case status changed from "new" to "in_progress"',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      previousStatus: 'new',
      newStatus: 'in_progress',
      changedBy: 'Sarah Johnson',
    },
  },
  {
    id: 'event_002',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
    type: 'message_sent',
    title: 'Initial Demand Letter Sent',
    description: 'First demand letter sent to debtor via email',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      channel: 'email',
      template: 'Initial Demand',
      sentBy: 'Sarah Johnson',
    },
  },
  {
    id: 'event_003',
    caseId: '550e8400-e29b-41d4-a716-446655440002',
    type: 'approval_request',
    title: 'Legal Escalation Approval Requested',
    description: 'Approval requested for legal escalation due to non-response',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      approvalType: 'legal_escalation',
      requestedBy: 'Michael Chen',
      amount: 8250.00,
    },
  },
  {
    id: 'event_004',
    caseId: '550e8400-e29b-41d4-a716-446655440003',
    type: 'status_change',
    title: 'Case Status Updated to Resolved',
    description: 'Case resolved - full payment of $15,750 received',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      previousStatus: 'in_progress',
      newStatus: 'resolved',
      amount: 15750.00,
      currency: 'USD',
      paymentMethod: 'Bank Transfer',
    },
  },
];

// Mock Messages Data
export const mockMessages: Message[] = [
  {
    id: 'msg_001',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
    direction: 'outbound',
    channel: 'email',
    content: 'Dear Global Tech Solutions, this is a formal demand for payment of invoice #INV-2024-001 for £12,500.00 which is now overdue.',
    templateId: 'initial_demand',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_002',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
    direction: 'outbound',
    channel: 'letter',
    content: 'Second formal demand letter - legal action may be taken if payment is not received within 7 days.',
    templateId: 'second_demand',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_003',
    caseId: '550e8400-e29b-41d4-a716-446655440002',
    direction: 'outbound',
    channel: 'phone',
    content: 'Phone call attempt - no answer. Left voicemail requesting urgent contact.',
    templateId: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_004',
    caseId: '550e8400-e29b-41d4-a716-446655440004',
    direction: 'outbound',
    channel: 'email',
    content: 'Initial payment reminder for outstanding amount of £4,500.00.',
    templateId: 'payment_reminder',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'approval_001',
    caseId: '550e8400-e29b-41d4-a716-446655440002',
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
    caseId: '550e8400-e29b-41d4-a716-446655440001',
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
  {
    id: 'approval_003',
    caseId: '550e8400-e29b-41d4-a716-446655440005',
    caseName: 'Case #005 - Sustainable Solutions Ltd',
    type: 'settlement_approval',
    state: 'pending',
    requestedBy: 'agent_2',
    requestedByName: 'Michael Chen',
    amount: 2500.00,
    currency: 'NOK',
    description: 'Settlement negotiation expenses - offered 75% settlement (NOK 16,500) on outstanding amount of NOK 22,000',
    createdAt: '2024-12-18T15:45:00Z',
  },
  {
    id: 'approval_004',
    caseId: '550e8400-e29b-41d4-a716-446655440004',
    caseName: 'Case #004 - Digital Marketing Pro',
    type: 'payment_plan',
    state: 'rejected',
    requestedBy: 'agent_3',
    requestedByName: 'Emma Thompson',
    amount: 750.00,
    currency: 'GBP',
    description: 'Document retrieval and payment plan setup costs for debtor request',
    createdAt: '2024-12-17T11:20:00Z',
    decidedAt: '2024-12-17T16:30:00Z',
    decidedBy: 'admin_1',
    decisionNotes: 'Rejected - debtor has history of defaulting on payment plans',
  },
  {
    id: 'approval_005',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
    caseName: 'Case #001 - Global Tech Solutions',
    type: 'write_off',
    state: 'approved',
    requestedBy: 'agent_1',
    requestedByName: 'Sarah Johnson',
    amount: 350.00,
    currency: 'GBP',
    description: 'Additional tracing and collection costs due to debtor relocation',
    createdAt: '2024-12-16T09:00:00Z',
    decidedAt: '2024-12-16T14:15:00Z',
    decidedBy: 'admin_1',
    decisionNotes: 'Approved - necessary for case progression after debtor moved address',
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    caseId: '550e8400-e29b-41d4-a716-446655440001',
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
    caseId: '550e8400-e29b-41d4-a716-446655440005',
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
    caseId: '550e8400-e29b-41d4-a716-446655440002',
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
    affectedCases: ['550e8400-e29b-41d4-a716-446655440001'],
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
    affectedCases: ['550e8400-e29b-41d4-a716-446655440006'],
  },
  {
    id: 'gdpr_003',
    type: 'RECTIFICATION',
    status: 'pending',
    requestedBy: 'client_2',
    requestedByName: 'Sterling Financial Services',
    dataSubject: 'Innovation Labs Inc',
    description: 'Request to correct debtor contact information - phone number and email address',
    dueDate: '2025-01-05T00:00:00Z',
    createdAt: '2024-12-15T13:20:00Z',
    affectedCases: ['550e8400-e29b-41d4-a716-446655440003'],
  },
  {
    id: 'gdpr_004',
    type: 'PORTABILITY',
    status: 'processing',
    requestedBy: 'client_3',
    requestedByName: 'Nordic Enterprises',
    dataSubject: 'Tech Startup Hub',
    description: 'Data portability request for case data and communications',
    dueDate: '2025-01-12T00:00:00Z',
    createdAt: '2024-12-12T10:45:00Z',
    affectedCases: ['550e8400-e29b-41d4-a716-446655440006'],
  },
  {
    id: 'gdpr_005',
    type: 'OBJECTION',
    status: 'processing',
    requestedBy: 'dpo_1',
    requestedByName: 'Jane Smith (DPO)',
    dataSubject: 'Apex Consulting Group',
    description: 'Objection to processing during dispute resolution - temporary hold on collection activities',
    dueDate: '2024-12-20T00:00:00Z',
    createdAt: '2024-12-10T09:30:00Z',
    affectedCases: ['550e8400-e29b-41d4-a716-446655440002'],
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalCases: 156,
  activeCases: 67,
  pendingApprovals: 5,
  overdueInvoices: 3,
  totalRecovered: 2847650.00,
  monthlyRecovered: 145230.00,
  averageRecoveryTime: 38, // days
  successRate: 82.3, // percentage
};

// Mock Users
export const mockUsers: User[] = [
  // Clients
  {
    id: 'client_1',
    email: 'client@acmemanufacturing.com',
    name: 'ACME Manufacturing Ltd',
    role: 'CLIENT',
    clientId: 'client_1',
    department: 'Finance',
    phone: '+44 121 234 5678',
    isActive: true,
    lastLoginAt: '2024-12-19T08:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-19T08:30:00Z',
    permissions: ['view_cases', 'create_cases', 'view_invoices'],
  },
  {
    id: 'client_2',
    email: 'finance@sterlingfinancial.com',
    name: 'Sterling Financial Services',
    role: 'CLIENT',
    clientId: 'client_2',
    department: 'Accounts Receivable',
    phone: '+44 20 7890 1234',
    isActive: true,
    lastLoginAt: '2024-12-18T16:45:00Z',
    createdAt: '2024-02-10T11:30:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
    permissions: ['view_cases', 'create_cases', 'view_invoices'],
  },
  {
    id: 'client_3',
    email: 'billing@nordicenterprise.com',
    name: 'Nordic Enterprises',
    role: 'CLIENT',
    clientId: 'client_3',
    department: 'Collections',
    phone: '+47 22 98 76 54',
    isActive: true,
    lastLoginAt: '2024-12-17T14:20:00Z',
    createdAt: '2024-03-05T08:15:00Z',
    updatedAt: '2024-12-17T14:20:00Z',
    permissions: ['view_cases', 'create_cases', 'view_invoices'],
  },
  
  // Agents
  {
    id: 'agent_1',
    email: 'sarah.johnson@collectpro.com',
    name: 'Sarah Johnson',
    role: 'AGENT',
    department: 'Collections Team A',
    phone: '+44 20 7123 4567',
    isActive: true,
    lastLoginAt: '2024-12-19T09:15:00Z',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-19T09:15:00Z',
    permissions: ['view_cases', 'update_cases', 'send_messages', 'create_approvals'],
  },
  {
    id: 'agent_2',
    email: 'michael.chen@collectpro.com',
    name: 'Michael Chen',
    role: 'AGENT',
    department: 'Collections Team B',
    phone: '+44 161 987 6543',
    isActive: true,
    lastLoginAt: '2024-12-19T08:45:00Z',
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-12-19T08:45:00Z',
    permissions: ['view_cases', 'update_cases', 'send_messages', 'create_approvals'],
  },
  {
    id: 'agent_3',
    email: 'emma.thompson@collectpro.com',
    name: 'Emma Thompson',
    role: 'AGENT',
    department: 'Legal Collections',
    phone: '+44 20 7456 7890',
    isActive: true,
    lastLoginAt: '2024-12-18T17:30:00Z',
    createdAt: '2024-03-01T14:20:00Z',
    updatedAt: '2024-12-18T17:30:00Z',
    permissions: ['view_cases', 'update_cases', 'send_messages', 'create_approvals', 'legal_escalation'],
  },
  
  // Admins
  {
    id: 'admin_1',
    email: 'john.admin@collectpro.com',
    name: 'John Administrator',
    role: 'ADMIN',
    department: 'System Administration',
    phone: '+44 20 7000 0001',
    isActive: true,
    lastLoginAt: '2024-12-19T07:45:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-19T07:45:00Z',
    permissions: ['full_access'],
  },
  
  // DPOs
  {
    id: 'dpo_1',
    email: 'jane.smith@collectpro.com',
    name: 'Jane Smith',
    role: 'DPO',
    department: 'Data Protection',
    phone: '+44 20 7000 0002',
    isActive: true,
    lastLoginAt: '2024-12-18T16:30:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-18T16:30:00Z',
    permissions: ['view_all_data', 'gdpr_requests', 'data_erasure', 'retention_policy'],
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