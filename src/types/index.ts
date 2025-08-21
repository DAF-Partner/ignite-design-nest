// Professional B2B Debt Collection Platform Types
// GDPR-compliant data structures for case management

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN' | 'DPO';

export type CaseStatus = 'new' | 'in_progress' | 'awaiting_approval' | 'legal_stage' | 'closed';

// Enhanced Case Intake System Types
export type CaseIntakeStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'needs_info' | 'rejected';

export type DebtorType = 'individual' | 'company';

export type ApprovalType = 'expense' | 'legal_escalation' | 'retrieval' | 'settlement_approval' | 'payment_plan' | 'write_off';

export type ApprovalState = 'pending' | 'approved' | 'rejected';

export type DocumentCategory = 'evidence' | 'correspondence' | 'invoice' | 'other';

export type GdprRequestType = 'SAR' | 'ERASURE' | 'RECTIFICATION' | 'PORTABILITY' | 'OBJECTION';

export type NotificationType = 'case_update' | 'approval_required' | 'document_uploaded' | 'payment_due';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // Only for CLIENT role
  department?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt?: string;
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
  reference: string;
  clientId: string;
  clientName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  debtor: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street?: string;
      city: string;
      postalCode?: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
  originalAmount?: number;
  status: CaseStatus;
  description?: string;
  originalCreditor?: string;
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
  originalName?: string;
  category: DocumentCategory;
  size?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
  retentionDate?: string;
  version: number;
  isLatest?: boolean;
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
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected';
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
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  caseId: string;
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'sms' | 'letter' | 'phone';
  content: string;
  templateId?: string;
  createdAt: string;
}

export interface CreateCaseRequest {
  debtor: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street?: string;
      city: string;
      postalCode?: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
  description?: string;
  reference: string;
  originalCreditor?: string;
  clientId: string;
}

export interface Tariff {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'tiered';
  percentage?: number;
  fixedAmount?: number;
  fixedFee?: number;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  minimumFee?: number;
  maximumFee?: number;
  clauseText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  tiers?: TariffTier[];
}

export interface TariffTier {
  minAmount: number;
  maxAmount: number | null;
  percentage: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'initial_contact' | 'reminder' | 'legal_notice' | 'settlement_offer';
  channel?: 'email' | 'sms' | 'letter' | 'phone';
  locale: string;
  version: number;
  isActive: boolean;
  legalNotice?: string;
  variables?: TemplateVariable[];
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasNext: boolean;
  nextCursor?: string;
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

// Enhanced Case Intake & Admin Configuration Types
export interface ServiceLevel {
  id: string;
  name: string;
  code: string;
  description?: string;
  slaHours: number;
  isActive: boolean;
  isSystemDefault: boolean;
  tenantId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtStatus {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isSystemDefault: boolean;
  tenantId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LawfulBasis {
  id: string;
  name: string;
  code: string;
  description?: string;
  articleReference?: string;
  isActive: boolean;
  isSystemDefault: boolean;
  tenantId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseIntake {
  id: string;
  reference: string;
  
  // Contract & Service Info
  contractId?: string;
  serviceLevelId?: string;
  serviceLevel?: ServiceLevel;
  debtStatusId?: string;
  debtStatus?: DebtStatus;
  
  // Debtor Info with GDPR
  debtorName: string;
  debtorType: DebtorType;
  debtorTaxId?: string;
  debtorVatId?: string;
  debtorEmail?: string;
  debtorPhone?: string;
  debtorAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  debtorCountry?: string;
  isGdprSubject: boolean;
  lawfulBasisId?: string;
  lawfulBasis?: LawfulBasis;
  
  // Financial Totals (computed from invoices)
  totalAmount: number;
  totalVat: number;
  totalPenalties: number;
  totalInterest: number;
  totalFees: number;
  currencyCode: string;
  
  // Workflow State
  status: CaseIntakeStatus;
  
  // Metadata
  notes?: string;
  clientId: string;
  assignedAgentId?: string;
  createdBy: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Related Data
  invoices?: CaseInvoice[];
  messages?: CaseMessage[];
  auditEvents?: CaseAuditEvent[];
}

export interface CaseInvoice {
  id: string;
  caseId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  penalties: number;
  interest: number;
  fees: number;
  currencyCode: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  messageType: 'user' | 'system' | 'auto';
  senderId: string;
  senderName: string;
  content: string;
  mentions: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface CaseAuditEvent {
  id: string;
  caseId: string;
  eventType: string;
  eventDescription: string;
  actorId: string;
  actorName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateCaseIntakeRequest {
  // Contract & Service Info
  contractId?: string;
  serviceLevelId: string;
  debtStatusId: string;
  
  // Debtor Info
  debtorName: string;
  debtorType: DebtorType;
  debtorTaxId?: string;
  debtorVatId?: string;
  debtorEmail?: string;
  debtorPhone?: string;
  debtorAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  debtorCountry?: string;
  isGdprSubject: boolean;
  lawfulBasisId?: string;
  
  // Financials
  currencyCode: string;
  invoices: Omit<CaseInvoice, 'id' | 'caseId' | 'createdAt' | 'updatedAt'>[];
  
  // Case Info
  notes?: string;
  clientId: string;
}

export interface CaseIntakeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AcceptanceReview {
  caseId: string;
  action: 'accept' | 'reject' | 'request_fixes';
  reviewNotes?: string;
  rejectionReason?: string;
  fixesRequired?: string[];
  assignedAgentId?: string;
}