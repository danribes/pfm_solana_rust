// Campaign and Voting TypeScript Definitions for Task 4.4.6
// Active Polls & Voting Campaigns Display

// ===========================
// CORE CAMPAIGN INTERFACES
// ===========================

export interface Campaign {
  id: string;
  title: string;
  description: string;
  communityId: string;
  communityName: string;
  createdBy: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  category: CampaignCategory;
  
  // Voting Configuration
  votingConfig: VotingConfiguration;
  
  // Participation Details
  eligibilityRequirements: EligibilityRequirements;
  participationStats: ParticipationStatistics;
  
  // Questions and Options
  questions: VotingQuestion[];
  
  // Results and Progress
  results?: CampaignResults;
  isResultsPublic: boolean;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}

export interface VotingQuestion {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  questionType: QuestionType;
  options: VotingOption[];
  isRequired: boolean;
  order: number;
  metadata: Record<string, any>;
}

export interface VotingOption {
  id: string;
  questionId: string;
  text: string;
  description?: string;
  order: number;
  voteCount: number;
  percentage: number;
  metadata: Record<string, any>;
}

export interface VotingConfiguration {
  allowMultipleVotes: boolean;
  allowVoteChanges: boolean;
  requireSignature: boolean;
  minimumStake?: number;
  maxVotesPerUser: number;
  votingMethod: VotingMethod;
  quorumRequired?: number;
  approvalThreshold?: number;
}

export interface EligibilityRequirements {
  minimumMembershipDuration?: number;
  requiredRoles?: string[];
  minimumTokenBalance?: number;
  stakingRequirements?: StakingRequirement[];
  customCriteria?: CustomCriteria[];
}

export interface StakingRequirement {
  tokenType: string;
  minimumAmount: number;
  lockPeriod?: number;
}

export interface CustomCriteria {
  criteriaType: string;
  value: any;
  operator: "equals" | "greater_than" | "less_than" | "contains";
}

export interface ParticipationStatistics {
  totalEligibleVoters: number;
  totalVotesCast: number;
  participationRate: number;
  uniqueVoters: number;
  lastUpdated: string;
  breakdown: ParticipationBreakdown;
}

export interface ParticipationBreakdown {
  byRole: Record<string, number>;
  byStakingLevel: Record<string, number>;
  byMembershipDuration: Record<string, number>;
  byTimeOfDay: Record<string, number>;
}

export interface CampaignResults {
  id: string;
  campaignId: string;
  finalResults: QuestionResult[];
  winningOptions: string[];
  isPassed: boolean;
  quorumMet: boolean;
  finalizedAt: string;
  executionStatus: ExecutionStatus;
  summary: string;
}

export interface QuestionResult {
  questionId: string;
  results: OptionResult[];
  totalVotes: number;
  winnerOptionId?: string;
  isPassed: boolean;
  margin: number;
}

export interface OptionResult {
  optionId: string;
  voteCount: number;
  percentage: number;
  stakingWeight?: number;
  finalScore: number;
}

// ===========================
// USER INTERACTION INTERFACES
// ===========================

export interface UserVote {
  id: string;
  userId: string;
  campaignId: string;
  questionId: string;
  optionId: string;
  votedAt: string;
  signature?: string;
  stakingAmount?: number;
  weight: number;
  metadata: Record<string, any>;
}

export interface UserVotingStatus {
  userId: string;
  campaignId: string;
  hasVoted: boolean;
  votedQuestions: string[];
  remainingQuestions: string[];
  canVote: boolean;
  eligibilityStatus: EligibilityStatus;
  votes: UserVote[];
  lastActivityAt: string;
}

export interface EligibilityStatus {
  isEligible: boolean;
  reasons: EligibilityReason[];
  missingRequirements: string[];
  canBecomeLigible: boolean;
  nextEligibilityCheck?: string;
}

export interface EligibilityReason {
  criteriaType: string;
  status: "met" | "not_met" | "pending";
  currentValue: any;
  requiredValue: any;
  description: string;
}

// ===========================
// ENUMS AND TYPES
// ===========================

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ENDING_SOON = "ending_soon",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PAUSED = "paused"
}

export enum CampaignPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
  CRITICAL = "critical"
}

export enum CampaignCategory {
  GOVERNANCE = "governance",
  TREASURY = "treasury",
  COMMUNITY = "community",
  TECHNICAL = "technical",
  SOCIAL = "social",
  POLICY = "policy",
  FUNDING = "funding",
  MEMBERSHIP = "membership",
  OTHER = "other"
}

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  RANKED_CHOICE = "ranked_choice",
  YES_NO = "yes_no",
  NUMERIC = "numeric",
  TEXT = "text",
  APPROVAL = "approval"
}

export enum VotingMethod {
  SIMPLE_MAJORITY = "simple_majority",
  SUPER_MAJORITY = "super_majority",
  UNANIMOUS = "unanimous",
  WEIGHTED_VOTING = "weighted_voting",
  QUADRATIC_VOTING = "quadratic_voting",
  RANKED_CHOICE_VOTING = "ranked_choice_voting"
}

export enum ExecutionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// ===========================
// API REQUEST/RESPONSE TYPES
// ===========================

export interface CampaignFilters {
  status?: CampaignStatus[];
  category?: CampaignCategory[];
  priority?: CampaignPriority[];
  search?: string;
  communityId?: string;
  tags?: string[];
  dateRange?: DateRange;
  eligibilityFilter?: "all" | "eligible_only" | "participated" | "not_participated";
  sortBy?: CampaignSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum CampaignSortField {
  CREATED_AT = "created_at",
  START_DATE = "start_date",
  END_DATE = "end_date",
  PRIORITY = "priority",
  PARTICIPATION_RATE = "participation_rate",
  TITLE = "title",
  UPDATED_AT = "updated_at"
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  pagination: PaginationInfo;
  filters: ActiveFilters;
  totalCount: number;
  recommendations?: Campaign[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ActiveFilters {
  applied: CampaignFilters;
  available: FilterOptions;
}

export interface FilterOptions {
  categories: { value: CampaignCategory; label: string; count: number }[];
  statuses: { value: CampaignStatus; label: string; count: number }[];
  priorities: { value: CampaignPriority; label: string; count: number }[];
  communities: { id: string; name: string; count: number }[];
  tags: { tag: string; count: number }[];
}

export interface VoteSubmissionRequest {
  campaignId: string;
  votes: VoteData[];
  signature?: string;
  metadata?: Record<string, any>;
}

export interface VoteData {
  questionId: string;
  optionId: string;
  stakingAmount?: number;
  metadata?: Record<string, any>;
}

export interface VoteSubmissionResponse {
  success: boolean;
  voteIds: string[];
  errors?: VoteError[];
  warnings?: VoteWarning[];
  updatedStatus: UserVotingStatus;
}

export interface VoteError {
  questionId: string;
  code: string;
  message: string;
  details?: any;
}

export interface VoteWarning {
  questionId: string;
  code: string;
  message: string;
  canProceed: boolean;
}

// ===========================
// COMPONENT STATE INTERFACES
// ===========================

export interface CampaignDashboardState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  filters: CampaignFilters;
  selectedCampaign: Campaign | null;
  userStatuses: Record<string, UserVotingStatus>;
  lastUpdated: string;
}

export interface VotingInterfaceState {
  campaign: Campaign | null;
  userStatus: UserVotingStatus | null;
  selectedVotes: Record<string, string>;
  isSubmitting: boolean;
  submissionError: string | null;
  validationErrors: Record<string, string>;
  showConfirmation: boolean;
}

export interface CampaignProgressInfo {
  campaign: Campaign;
  timeRemaining: TimeRemaining;
  participationProgress: number;
  quorumProgress: number;
  userProgress: UserProgress;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

export interface UserProgress {
  questionsAnswered: number;
  totalQuestions: number;
  completionPercentage: number;
  canComplete: boolean;
  nextQuestion?: VotingQuestion;
}

// ===========================
// HOOK RETURN TYPES
// ===========================

export interface UseCampaignsResult {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  filters: CampaignFilters;
  setFilters: (filters: CampaignFilters) => void;
  refreshCampaigns: () => Promise<void>;
  loadMoreCampaigns: () => Promise<void>;
  hasMore: boolean;
  selectedCampaign: Campaign | null;
  selectCampaign: (campaign: Campaign | null) => void;
  getUserStatus: (campaignId: string) => UserVotingStatus | null;
  searchCampaigns: (query: string) => Promise<Campaign[]>;
}

export interface UseVotingResult {
  campaign: Campaign | null;
  userStatus: UserVotingStatus | null;
  selectedVotes: Record<string, string>;
  setVote: (questionId: string, optionId: string) => void;
  clearVote: (questionId: string) => void;
  submitVotes: () => Promise<VoteSubmissionResponse>;
  isSubmitting: boolean;
  canSubmit: boolean;
  validationErrors: Record<string, string>;
  previewVotes: () => VotePreview[];
  resetVoting: () => void;
}

export interface VotePreview {
  question: VotingQuestion;
  selectedOption: VotingOption;
  isValid: boolean;
  warnings: string[];
}

// ===========================
// NOTIFICATION INTERFACES
// ===========================

export interface CampaignNotification {
  id: string;
  type: CampaignNotificationType;
  campaignId: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority: "low" | "normal" | "high";
  createdAt: string;
  readAt?: string;
  metadata: Record<string, any>;
}

export enum CampaignNotificationType {
  NEW_CAMPAIGN = "new_campaign",
  CAMPAIGN_STARTING = "campaign_starting",
  DEADLINE_REMINDER = "deadline_reminder",
  RESULTS_AVAILABLE = "results_available",
  VOTE_CONFIRMED = "vote_confirmed",
  ELIGIBILITY_CHANGED = "eligibility_changed",
  CAMPAIGN_UPDATED = "campaign_updated"
}
