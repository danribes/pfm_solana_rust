// Request Management TypeScript Definitions for Admin Portal

export interface UserRequest {
  id: string;
  userId: string;
  communityId: string;
  type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  submittedAt: string;
  reviewedAt?: string;
  processedAt?: string;
  reviewedBy?: string;
  processedBy?: string;
  title: string;
  description: string;
  requestData: RequestData;
  userProfile: UserProfile;
  adminNotes: AdminNote[];
  history: RequestHistoryEntry[];
  metadata: RequestMetadata;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  joinedAt: string;
  verificationStatus: VerificationStatus;
  reputation: number;
  badges: string[];
  socialLinks: SocialLink[];
  previousCommunities: string[];
  walletHistory: WalletTransaction[];
}

export interface RequestData {
  communityId?: string;
  requestedRole?: string;
  reason?: string;
  additionalInfo?: Record<string, any>;
  attachments?: string[];
  references?: string[];
}

export interface AdminNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
  isPrivate: boolean;
  tags: string[];
}

export interface RequestHistoryEntry {
  id: string;
  action: RequestAction;
  performedBy: string;
  performedAt: string;
  details: string;
  previousStatus?: RequestStatus;
  newStatus?: RequestStatus;
  metadata?: Record<string, any>;
}

export interface RequestMetadata {
  source: RequestSource;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  campaignId?: string;
  autoProcessed: boolean;
  riskScore: number;
  flaggedReasons: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

export interface WalletTransaction {
  hash: string;
  type: string;
  amount?: number;
  timestamp: string;
  status: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  communityId: string;
  isActive: boolean;
  rules: ApprovalRule[];
  stages: ApprovalStage[];
  autoApprovalCriteria: AutoApprovalCriteria;
  notifications: NotificationSettings;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  isActive: boolean;
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
  subConditions?: RuleCondition[];
}

export interface RuleAction {
  type: ActionType;
  targetStatus: RequestStatus;
  assignTo?: string;
  message?: string;
  delay?: number;
}

export interface ApprovalStage {
  id: string;
  name: string;
  order: number;
  requiredApprovers: number;
  approvers: string[];
  isOptional: boolean;
  timeoutHours: number;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: string;
  triggerAfterHours: number;
  escalateTo: string[];
  action: EscalationAction;
  notificationTemplate: string;
}

export interface AutoApprovalCriteria {
  enabled: boolean;
  minReputation: number;
  minWalletAge: number;
  maxRiskScore: number;
  requiredBadges: string[];
  excludedFlags: string[];
  customRules: string[];
}

export interface NotificationSettings {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  slackEnabled: boolean;
  templates: NotificationTemplate[];
  escalationNotifications: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface RequestAnalytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
  averageProcessingTime: number;
  requestsByType: RequestTypeStats[];
  requestsByPriority: RequestPriorityStats[];
  adminWorkload: AdminWorkloadStats[];
  timelineData: RequestTimelineData[];
  trends: RequestTrends;
}

export interface RequestTypeStats {
  type: RequestType;
  count: number;
  percentage: number;
  averageProcessingTime: number;
  approvalRate: number;
}

export interface RequestPriorityStats {
  priority: RequestPriority;
  count: number;
  percentage: number;
  averageProcessingTime: number;
}

export interface AdminWorkloadStats {
  adminId: string;
  adminName: string;
  requestsHandled: number;
  averageProcessingTime: number;
  approvalRate: number;
  workloadPercentage: number;
}

export interface RequestTimelineData {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface RequestTrends {
  submissionTrend: TrendDirection;
  approvalRateTrend: TrendDirection;
  processingTimeTrend: TrendDirection;
  qualityScoreTrend: TrendDirection;
}

export interface RequestFilters {
  status?: RequestStatus[];
  type?: RequestType[];
  priority?: RequestPriority[];
  communityId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string;
  searchTerm?: string;
  riskScore?: {
    min: number;
    max: number;
  };
}

export interface BulkActionRequest {
  requestIds: string[];
  action: BulkActionType;
  reason?: string;
  assignTo?: string;
  message?: string;
}

export interface BulkActionResult {
  successful: string[];
  failed: { id: string; error: string }[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// Enums
export enum RequestType {
  MEMBERSHIP = 'membership',
  ROLE_CHANGE = 'role_change',
  SPECIAL_ACCESS = 'special_access',
  COMMUNITY_CREATION = 'community_creation',
  FEATURE_REQUEST = 'feature_request',
  SUPPORT = 'support',
  APPEAL = 'appeal'
}

export enum RequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  FULLY_VERIFIED = 'fully_verified'
}

export enum RequestAction {
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  REASSIGNED = 'reassigned',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed'
}

export enum RequestSource {
  WEB_FORM = 'web_form',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  ADMIN_PANEL = 'admin_panel',
  BULK_IMPORT = 'bulk_import',
  INTEGRATION = 'integration'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in'
}

export enum ActionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  ESCALATE = 'escalate',
  ASSIGN = 'assign',
  HOLD = 'hold',
  REQUEST_INFO = 'request_info'
}

export enum EscalationAction {
  REASSIGN = 'reassign',
  NOTIFY_SUPERVISOR = 'notify_supervisor',
  AUTO_APPROVE = 'auto_approve',
  MARK_URGENT = 'mark_urgent'
}

export enum NotificationType {
  APPROVAL = 'approval',
  REJECTION = 'rejection',
  REQUEST_INFO = 'request_info',
  ESCALATION = 'escalation',
  REMINDER = 'reminder'
}

export enum BulkActionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  CHANGE_PRIORITY = 'change_priority',
  ADD_NOTE = 'add_note',
  EXPORT = 'export'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

// Hook Types
export interface UseRequestsOptions {
  filters?: RequestFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseRequestsResult {
  requests: UserRequest[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refetch: () => Promise<void>;
  approveRequest: (id: string, message?: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
  assignRequest: (id: string, adminId: string) => Promise<void>;
  addNote: (id: string, note: string, isPrivate?: boolean) => Promise<void>;
  bulkAction: (action: BulkActionRequest) => Promise<BulkActionResult>;
}

export interface UseApprovalWorkflowResult {
  workflows: ApprovalWorkflow[];
  loading: boolean;
  error: string | null;
  createWorkflow: (workflow: Partial<ApprovalWorkflow>) => Promise<ApprovalWorkflow>;
  updateWorkflow: (id: string, updates: Partial<ApprovalWorkflow>) => Promise<ApprovalWorkflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  testWorkflow: (workflowId: string, testData: any) => Promise<any>;
}
