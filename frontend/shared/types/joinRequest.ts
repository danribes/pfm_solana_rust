// Task 7.2.2: Community Join Request Interface
// TypeScript definitions for join requests, applications, and community membership

// Join Request Core Types
export type JoinRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export type ApplicationPriority = 'high' | 'medium' | 'low';

export interface JoinRequest {
  id: string;
  userId: string;
  communityId: string;
  status: JoinRequestStatus;
  priority: ApplicationPriority;
  submittedAt: string;
  updatedAt: string;
  expiresAt?: string;
  applicationData: ApplicationFormData;
  statusHistory: RequestStatusHistory[];
  adminFeedback?: AdminFeedback[];
  appealData?: AppealData;
  metadata: RequestMetadata;
}

export interface RequestMetadata {
  source: 'web' | 'mobile' | 'api';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  sessionId: string;
  attempts: number;
  lastModified: string;
  version: number;
}

// Application Form System
export interface ApplicationFormData {
  formId: string;
  responses: FormResponse[];
  completedSections: string[];
  draftSavedAt?: string;
  submissionAttempts: number;
  validationErrors: ValidationError[];
  attachments: FileAttachment[];
}

export interface FormResponse {
  questionId: string;
  questionType: QuestionType;
  answer: string | string[] | FileAttachment[];
  isRequired: boolean;
  validatedAt?: string;
  confidence?: number;
}

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'date'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'file_upload'
  | 'checkbox'
  | 'rating'
  | 'slider';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  isRequired: boolean;
  order: number;
  section: string;
  validation: QuestionValidation;
  options?: QuestionOption[];
  conditional?: ConditionalLogic;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage: string;
  fileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  order: number;
  isDefault?: boolean;
}

export interface ConditionalLogic {
  showIf: ConditionRule[];
  operator: 'AND' | 'OR';
}

export interface ConditionRule {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: string | number;
}

// Dynamic Form Configuration
export interface ApplicationForm {
  id: string;
  communityId: string;
  title: string;
  description: string;
  version: number;
  status: 'active' | 'draft' | 'archived';
  sections: FormSection[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: FormQuestion[];
  estimatedTime: number;
}

export interface FormSettings {
  allowDrafts: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  showProgress: boolean;
  allowWithdrawal: boolean;
  expirationDays?: number;
}

// File Upload System
export interface FileAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  thumbnailUrl?: string;
}

// Status Tracking System
export interface RequestStatusHistory {
  id: string;
  requestId: string;
  status: JoinRequestStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
  adminNotes?: string;
  publicMessage?: string;
  notificationSent: boolean;
}

// Admin Communication System
export interface AdminFeedback {
  id: string;
  requestId: string;
  adminId: string;
  adminName: string;
  message: string;
  type: 'info' | 'question' | 'concern' | 'approval' | 'rejection';
  isPublic: boolean;
  createdAt: string;
  readBy: string[];
  responses: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  attachments: FileAttachment[];
}

// Appeal Process
export interface AppealData {
  id: string;
  requestId: string;
  reason: string;
  additionalInfo?: string;
  evidence: FileAttachment[];
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// Community Requirements System
export interface CommunityRequirements {
  communityId: string;
  membershipCriteria: MembershipCriteria;
  applicationProcess: ApplicationProcess;
  guidelines: CommunityGuidelines;
  faq: CommunityFAQ[];
  statistics: CommunityStatistics;
}

export interface MembershipCriteria {
  minAge?: number;
  maxAge?: number;
  location?: string[];
  experience?: string[];
  skills?: string[];
  other: string[];
}

export interface ApplicationProcess {
  steps: ProcessStep[];
  estimatedDuration: string;
  reviewTimeline: string;
  approvalRate: number;
  commonRejectionReasons: string[];
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedTime: string;
  isOptional: boolean;
}

export interface CommunityGuidelines {
  codeOfConduct: string;
  communicationRules: string[];
  participationExpectations: string[];
  consequencesPolicy: string;
  lastUpdated: string;
}

export interface CommunityFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  helpful: number;
  notHelpful: number;
}

export interface CommunityStatistics {
  totalMembers: number;
  activeMembers: number;
  averageApprovalTime: number;
  approvalRate: number;
  memberRetentionRate: number;
  lastUpdated: string;
}

// Request Management Dashboard
export interface RequestDashboard {
  userId: string;
  summary: RequestSummary;
  activeRequests: JoinRequest[];
  requestHistory: JoinRequest[];
  recommendations: CommunityRecommendation[];
}

export interface RequestSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  successRate: number;
  averageProcessingTime: number;
}

export interface CommunityRecommendation {
  communityId: string;
  communityName: string;
  matchScore: number;
  matchReasons: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedApprovalChance: number;
}

// API Response Types
export interface JoinRequestResponse {
  success: boolean;
  data?: JoinRequest;
  message?: string;
  error?: JoinRequestError;
}

export interface JoinRequestListResponse {
  success: boolean;
  data?: {
    requests: JoinRequest[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  message?: string;
  error?: JoinRequestError;
}

export interface JoinRequestError {
  code: string;
  message: string;
  field?: string;
  retryable: boolean;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

// Component Props Types
export interface JoinRequestButtonProps {
  communityId: string;
  communityName: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onSuccess?: (request: JoinRequest) => void;
  onError?: (error: JoinRequestError) => void;
}

export interface JoinRequestFormProps {
  communityId: string;
  formId?: string;
  initialData?: Partial<ApplicationFormData>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onSaveDraft?: (data: ApplicationFormData) => Promise<void>;
  onCancel?: () => void;
  showProgress?: boolean;
  allowDrafts?: boolean;
}

export interface RequestStatusProps {
  requestId: string;
  showHistory?: boolean;
  showFeedback?: boolean;
  allowAppeal?: boolean;
  compact?: boolean;
}

export interface RequirementsDisplayProps {
  communityId: string;
  showStatistics?: boolean;
  expandedView?: boolean;
}

export interface RequestDashboardProps {
  userId: string;
  showRecommendations?: boolean;
  showAnalytics?: boolean;
  filterStatus?: JoinRequestStatus[];
}

// Hook Return Types
export interface UseJoinRequestsResult {
  requests: JoinRequest[];
  isLoading: boolean;
  error: JoinRequestError | null;
  summary: RequestSummary | null;
  actions: {
    submitRequest: (communityId: string, data: ApplicationFormData) => Promise<JoinRequest>;
    withdrawRequest: (requestId: string) => Promise<void>;
    submitAppeal: (requestId: string, appeal: Omit<AppealData, 'id' | 'requestId'>) => Promise<void>;
    refreshRequests: () => Promise<void>;
  };
}

export interface UseApplicationFormResult {
  form: ApplicationForm | null;
  formData: ApplicationFormData;
  isDirty: boolean;
  isValid: boolean;
  validationErrors: ValidationError[];
  isLoading: boolean;
  error: string | null;
  actions: {
    updateResponse: (questionId: string, answer: any) => void;
    saveDraft: () => Promise<void>;
    submit: () => Promise<JoinRequest>;
    reset: () => void;
    uploadFile: (questionId: string, file: File) => Promise<FileAttachment>;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Constants
export const JOIN_REQUEST_STATUS_LABELS: Record<JoinRequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  additional_info_required: 'Additional Info Required',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired'
};

export const JOIN_REQUEST_ERROR_CODES = {
  INVALID_REQUEST: 'invalid_request',
  UNAUTHORIZED: 'unauthorized',
  COMMUNITY_NOT_FOUND: 'community_not_found',
  REQUEST_NOT_FOUND: 'request_not_found',
  ALREADY_APPLIED: 'already_applied',
  ALREADY_MEMBER: 'already_member',
  VALIDATION_FAILED: 'validation_failed',
  UPLOAD_FAILED: 'upload_failed',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error'
} as const;

export const JOIN_REQUEST_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'text/plain'
  ],
  maxFilesPerQuestion: 5,
  autoSaveInterval: 30000, // 30 seconds
  requestTimeout: 30000 // 30 seconds
};

export default {
  JOIN_REQUEST_STATUS_LABELS,
  JOIN_REQUEST_ERROR_CODES,
  JOIN_REQUEST_CONFIG
}; 