// Professional B2B Debt Collection Platform Types
// GDPR-compliant data structures for case management

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN' | 'DPO';

export type CaseStatus = 'new' | 'in_progress' | 'awaiting_approval' | 'legal_stage' | 'closed';

export type ApprovalType = 'expense' | 'legal_escalation' | 'retrieval';

export type ApprovalState = 'pending' | 'approved' | 'rejected';

export type DocumentCategory = 'evidence' | 'correspondence' | 'invoice' | 'other';

export type GdprRequestType = 'SAR' | 'ERASURE';

export type NotificationType = 'case_update' | 'approval_required' | 'document_uploaded' | 'payment_due';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // Only for CLIENT role
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface Case {
  id: string;
  clientId: string;
  clientName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  debtorName: string;
  debtorEmail?: string;
  debtorPhone?: string;
  amount: number;
  currency: string;
  originalAmount: number;
  status: CaseStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  lastActionAt?: string;
  tags?: string[];
}

export interface Approval {
  id: string;
  caseId: string;
  caseName: string;
  type: ApprovalType;
  state: ApprovalState;
  requestedBy: string;
  requestedByName: string;
  amount?: number;
  currency?: string;
  description: string;
  clauseId?: string;
  clauseText?: string;
  feeBreakdown?: FeeBreakdown;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
}

export interface FeeBreakdown {
  baseAmount: number;
  percentage: number;
  fixedFee: number;
  vatAmount: number;
  totalFee: number;
  currency: string;
}

export interface Document {
  id: string;
  caseId: string;
  filename: string;
  originalName: string;
  category: DocumentCategory;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  retentionDate: string;
  version: number;
  isLatest: boolean;
  downloadUrl?: string;
}

export interface Invoice {
  id: string;
  caseId: string;
  caseName: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  pdfUrl?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface GdprRequest {
  id: string;
  type: GdprRequestType;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestedBy: string;
  requestedByName: string;
  dataSubject: string;
  description: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  affectedCases?: string[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: 'case' | 'approval' | 'invoice' | 'gdpr_request';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  type: 'status_change' | 'document_upload' | 'approval_request' | 'message_sent' | 'assignment_change';
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Tariff {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'hybrid';
  percentage?: number;
  fixedAmount?: number;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  clauseText: string;
  isActive: boolean;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'initial_contact' | 'reminder' | 'legal_notice' | 'settlement_offer';
  locale: string;
  version: number;
  isActive: boolean;
  legalNotice?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProblemDetails {
  type?: string;
  title: string;
  detail: string;
  status: number;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Filter and Search Types
export interface CaseFilters {
  status?: CaseStatus[];
  clientId?: string;
  assignedAgentId?: string;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingApprovals: number;
  overdueInvoices: number;
  totalRecovered: number;
  monthlyRecovered: number;
  averageRecoveryTime: number;
  successRate: number;
}