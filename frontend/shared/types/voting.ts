// Voting Community System Types
// TypeScript definitions for polls, votes, user management, and community voting

// Import existing profile types
import { UserProfile } from './profile';

// Core Poll Types
export interface Poll {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  startsAt: string;
  endsAt: string;
  status: PollStatus;
  type: PollType;
  category: string;
  tags: string[];
  options: PollOption[];
  results: PollResults;
  settings: PollSettings;
  eligibility: EligibilityRules;
  metadata: PollMetadata;
  visibility: PollVisibility;
}

export type PollStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';

export type PollType = 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'approval' | 'weighted' | 'quadratic';

export interface PollOption {
  id: string;
  text: string;
  description?: string;
  image?: PollImage;
  metadata?: Record<string, any>;
  order: number;
}

export interface PollImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  altText: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface PollResults {
  totalVotes: number;
  totalEligibleVoters: number;
  participationRate: number;
  optionResults: OptionResult[];
  demographics: VotingDemographics;
  timeline: VotingTimeline[];
  isPublic: boolean;
  lastUpdated: string;
}

export interface OptionResult {
  optionId: string;
  voteCount: number;
  percentage: number;
  weightedScore?: number;
  ranking?: number;
}

export interface VotingDemographics {
  byAge: Record<string, number>;
  byLocation: Record<string, number>;
  byMembershipTier: Record<string, number>;
  byJoinDate: Record<string, number>;
  byVerificationLevel: Record<string, number>;
}

export interface VotingTimeline {
  timestamp: string;
  voteCount: number;
  cumulativeVotes: number;
  event?: 'poll_started' | 'reminder_sent' | 'deadline_extended' | 'poll_ended';
}

export interface PollSettings {
  allowAbstain: boolean;
  allowChangeVote: boolean;
  requireReason: boolean;
  showRealTimeResults: boolean;
  anonymousVoting: boolean;
  weightedVoting: boolean;
  quorum?: QuorumSettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface QuorumSettings {
  required: boolean;
  threshold: number;
  type: 'absolute' | 'percentage';
  gracePeriod?: number; // minutes
}

export interface NotificationSettings {
  pollStart: boolean;
  reminderBeforeEnd: boolean;
  resultsAvailable: boolean;
  reminderHours: number[];
}

export interface AccessibilitySettings {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  largeText: boolean;
  alternativeFormats: string[];
}

// Voting and Participation Types
export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  submittedAt: string;
  updatedAt?: string;
  selections: VoteSelection[];
  reason?: string;
  confidence?: number;
  isPublic: boolean;
  metadata: VoteMetadata;
}

export interface VoteSelection {
  optionId: string;
  rank?: number;
  weight?: number;
  approved?: boolean;
}

export interface VoteMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId: string;
  revisionCount: number;
  timeSpent: number; // seconds
}

export interface VotingSession {
  id: string;
  userId: string;
  pollId: string;
  startedAt: string;
  completedAt?: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  progress: SessionProgress;
  draft?: Partial<Vote>;
}

export interface SessionProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  timeSpent: number;
  interactions: UserInteraction[];
}

export interface UserInteraction {
  timestamp: string;
  action: 'view_option' | 'select_option' | 'deselect_option' | 'view_details' | 'change_page';
  target: string;
  duration?: number;
}

// Eligibility and Access Control
export interface EligibilityRules {
  membershipRequired: boolean;
  minimumMembershipDuration?: number; // days
  verificationRequired: boolean;
  minimumTrustScore?: number;
  allowedRoles: string[];
  excludedUsers: string[];
  geoRestrictions?: GeoRestriction[];
  customRules: CustomEligibilityRule[];
}

export interface GeoRestriction {
  type: 'include' | 'exclude';
  countries: string[];
  states?: string[];
  cities?: string[];
}

export interface CustomEligibilityRule {
  id: string;
  name: string;
  description: string;
  condition: string; // JSON logic or expression
  isActive: boolean;
}

export type PollVisibility = 'public' | 'members_only' | 'restricted' | 'private';

export interface PollMetadata {
  isOfficial: boolean;
  isFeatured: boolean;
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedPolls: string[];
  externalLinks: ExternalLink[];
  attachments: PollAttachment[];
  discussionThreadId?: string;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'document' | 'website' | 'video' | 'article' | 'other';
}

export interface PollAttachment {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: string;
}

// User Management Types
export interface VotingCommunityUser {
  id: string;
  profile: UserProfile;
  votingStats: VotingUserStats;
  eligibilityStatus: UserEligibilityStatus;
  preferences: VotingPreferences;
  reputation: VotingReputation;
  notifications: NotificationPreferences;
  privacy: VotingPrivacySettings;
  achievements: VotingAchievement[];
}

export interface VotingUserStats {
  totalPolls: number;
  totalVotes: number;
  votingStreak: number;
  longestStreak: number;
  averageParticipation: number;
  pollsCreated: number;
  pollsWon: number; // polls where user's choice won
  accuracyScore: number; // how often user votes with majority
  engagementScore: number;
  lastVotedAt?: string;
  memberSince: string;
}

export interface UserEligibilityStatus {
  isEligible: boolean;
  verificationLevel: 'unverified' | 'basic' | 'enhanced' | 'premium';
  trustScore: number;
  membershipTier: string;
  membershipDuration: number; // days
  restrictions: UserRestriction[];
  lastUpdated: string;
}

export interface UserRestriction {
  type: 'temporary_ban' | 'poll_creation_ban' | 'voting_ban' | 'warning';
  reason: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  appealable: boolean;
}

export interface VotingPreferences {
  defaultVotePrivacy: 'public' | 'anonymous';
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderFrequency: 'none' | 'daily' | 'weekly';
  showResultsImmediately: boolean;
  preferredPollTypes: PollType[];
  blockedCategories: string[];
  language: string;
  timezone: string;
}

export interface VotingReputation {
  overall: number;
  breakdown: {
    participation: number;
    consistency: number;
    thoughtfulness: number;
    leadership: number;
  };
  badges: ReputationBadge[];
  level: number;
  nextLevelThreshold: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface NotificationPreferences {
  pollStarted: boolean;
  pollReminder: boolean;
  pollEnding: boolean;
  resultsAvailable: boolean;
  newPollInCategory: boolean;
  achievementUnlocked: boolean;
  reputationChanged: boolean;
  systemUpdates: boolean;
  preferredDelivery: ('email' | 'push' | 'in_app')[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface VotingPrivacySettings {
  defaultVoteVisibility: 'public' | 'anonymous' | 'private';
  showVotingHistory: boolean;
  showStatistics: boolean;
  allowVoteTracking: boolean;
  shareDataForResearch: boolean;
  profileVisibility: 'public' | 'members_only' | 'private';
}

export interface VotingAchievement {
  id: string;
  name: string;
  description: string;
  category: 'participation' | 'accuracy' | 'leadership' | 'consistency' | 'special';
  icon: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
  unlockedAt?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

// Admin Management Types
export interface AdminUser {
  id: string;
  profile: UserProfile;
  adminLevel: AdminLevel;
  permissions: AdminPermission[];
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  lastActiveAt: string;
  auditLog: AdminAuditEntry[];
}

export type AdminLevel = 'moderator' | 'admin' | 'super_admin' | 'system_admin';

export type AdminPermission = 
  | 'manage_users'
  | 'manage_polls'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_admins'
  | 'system_config'
  | 'data_export'
  | 'user_verification';

export interface AdminAuditEntry {
  id: string;
  action: string;
  targetType: 'user' | 'poll' | 'system' | 'admin';
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface AdminDashboardStats {
  users: UserManagementStats;
  polls: PollManagementStats;
  system: SystemStats;
  engagement: EngagementStats;
  lastUpdated: string;
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  verifiedUsers: number;
  bannedUsers: number;
  usersByTier: Record<string, number>;
  retentionRate: number;
}

export interface PollManagementStats {
  totalPolls: number;
  activePolls: number;
  pollsToday: number;
  pollsThisWeek: number;
  averageParticipation: number;
  totalVotes: number;
  votesToday: number;
  pollsByCategory: Record<string, number>;
}

export interface SystemStats {
  uptime: number;
  responseTime: number;
  errorRate: number;
  storageUsed: number;
  bandwidthUsed: number;
  lastBackup: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface EngagementStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  engagementTrend: 'rising' | 'stable' | 'declining';
}

// Analytics and Reporting Types
export interface VotingAnalytics {
  pollAnalytics: PollAnalytics;
  userAnalytics: UserAnalytics;
  engagementAnalytics: EngagementAnalytics;
  demographicAnalytics: DemographicAnalytics;
  timeframe: AnalyticsTimeframe;
  generatedAt: string;
}

export interface PollAnalytics {
  totalPolls: number;
  averageParticipation: number;
  completionRate: number;
  popularCategories: CategoryStat[];
  pollPerformance: PollPerformanceStat[];
  votingPatterns: VotingPattern[];
}

export interface CategoryStat {
  category: string;
  pollCount: number;
  averageParticipation: number;
  growth: number;
}

export interface PollPerformanceStat {
  pollId: string;
  title: string;
  participation: number;
  engagement: number;
  completion: number;
  satisfaction?: number;
}

export interface VotingPattern {
  pattern: string;
  frequency: number;
  description: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface UserAnalytics {
  acquisitionFunnel: AcquisitionFunnel;
  retentionCohorts: RetentionCohort[];
  engagementSegments: EngagementSegment[];
  churnAnalysis: ChurnAnalysis;
}

export interface AcquisitionFunnel {
  visitors: number;
  signups: number;
  verified: number;
  firstVote: number;
  activeMembers: number;
  conversionRates: Record<string, number>;
}

export interface RetentionCohort {
  cohort: string;
  initialSize: number;
  retained: Record<string, number>; // period -> count
  retentionRates: Record<string, number>; // period -> rate
}

export interface EngagementSegment {
  segment: string;
  userCount: number;
  averageVotes: number;
  averageSessionDuration: number;
  characteristics: string[];
}

export interface ChurnAnalysis {
  churnRate: number;
  riskFactors: RiskFactor[];
  churnReasons: ChurnReason[];
  preventionStrategies: string[];
}

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface ChurnReason {
  reason: string;
  frequency: number;
  category: 'usability' | 'content' | 'technical' | 'personal' | 'other';
}

export interface EngagementAnalytics {
  overallEngagement: number;
  engagementTrends: EngagementTrend[];
  topEngagers: TopEngager[];
  engagementByFeature: FeatureEngagement[];
}

export interface EngagementTrend {
  date: string;
  engagement: number;
  activeUsers: number;
  votes: number;
  sessions: number;
}

export interface TopEngager {
  userId: string;
  username: string;
  engagementScore: number;
  contributionType: string[];
}

export interface FeatureEngagement {
  feature: string;
  usage: number;
  satisfaction: number;
  adoptionRate: number;
}

export interface DemographicAnalytics {
  ageDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  membershipDistribution: Record<string, number>;
  verificationDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  crossTabulations: CrossTabulation[];
}

export interface CrossTabulation {
  dimension1: string;
  dimension2: string;
  data: Record<string, Record<string, number>>;
}

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | '1y' | 'all_time' | 'custom';

// Component Props Types
export interface PollListProps {
  polls: Poll[];
  status?: PollStatus;
  category?: string;
  onPollSelect: (poll: Poll) => void;
  onVote?: (pollId: string, vote: Partial<Vote>) => void;
  isLoading?: boolean;
  showFilters?: boolean;
  userRole?: 'member' | 'admin';
}

export interface PollCardProps {
  poll: Poll;
  userVote?: Vote;
  onVote: (vote: Partial<Vote>) => void;
  onViewDetails: () => void;
  showResults?: boolean;
  isVotingEnabled?: boolean;
  className?: string;
}

export interface VotingInterfaceProps {
  poll: Poll;
  existingVote?: Vote;
  onSubmitVote: (vote: Partial<Vote>) => Promise<void>;
  onSaveDraft: (draft: Partial<Vote>) => void;
  isLoading?: boolean;
  canChangeVote?: boolean;
}

export interface PollResultsProps {
  poll: Poll;
  results: PollResults;
  userVote?: Vote;
  showDemographics?: boolean;
  showTimeline?: boolean;
  onExport?: () => void;
}

export interface UserManagementProps {
  users: VotingCommunityUser[];
  onUserAction: (userId: string, action: string, data?: any) => void;
  permissions: AdminPermission[];
  isLoading?: boolean;
  filters?: UserFilters;
  onFiltersChange?: (filters: UserFilters) => void;
}

export interface UserFilters {
  search?: string;
  verificationLevel?: string;
  membershipTier?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PollManagementProps {
  polls: Poll[];
  onPollAction: (pollId: string, action: string, data?: any) => void;
  onCreatePoll: () => void;
  permissions: AdminPermission[];
  isLoading?: boolean;
  filters?: PollFilters;
  onFiltersChange?: (filters: PollFilters) => void;
}

export interface PollFilters {
  search?: string;
  status?: PollStatus;
  category?: string;
  creator?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// API Response Types
export interface VotingApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: VotingApiError;
  pagination?: PaginationInfo;
}

export interface VotingApiError {
  code: string;
  message: string;
  field?: string;
  retryable: boolean;
  details?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Hook Return Types
export interface UsePollsResult {
  polls: Poll[];
  isLoading: boolean;
  error: VotingApiError | null;
  pagination: PaginationInfo | null;
  actions: {
    loadPolls: (filters?: PollFilters) => Promise<void>;
    createPoll: (poll: Partial<Poll>) => Promise<Poll>;
    updatePoll: (pollId: string, updates: Partial<Poll>) => Promise<Poll>;
    deletePoll: (pollId: string) => Promise<void>;
    vote: (pollId: string, vote: Partial<Vote>) => Promise<Vote>;
    changePollStatus: (pollId: string, status: PollStatus) => Promise<Poll>;
  };
}

export interface UseVotingResult {
  vote: Vote | null;
  session: VotingSession | null;
  isLoading: boolean;
  error: VotingApiError | null;
  actions: {
    submitVote: (vote: Partial<Vote>) => Promise<Vote>;
    saveDraft: (draft: Partial<Vote>) => Promise<void>;
    changeVote: (changes: Partial<Vote>) => Promise<Vote>;
    startSession: (pollId: string) => Promise<VotingSession>;
    endSession: () => Promise<void>;
  };
}

export interface UseUserManagementResult {
  users: VotingCommunityUser[];
  isLoading: boolean;
  error: VotingApiError | null;
  pagination: PaginationInfo | null;
  actions: {
    loadUsers: (filters?: UserFilters) => Promise<void>;
    updateUser: (userId: string, updates: Partial<VotingCommunityUser>) => Promise<VotingCommunityUser>;
    banUser: (userId: string, reason: string, duration?: number) => Promise<void>;
    unbanUser: (userId: string) => Promise<void>;
    verifyUser: (userId: string, level: string) => Promise<void>;
    changeUserTier: (userId: string, tier: string) => Promise<void>;
  };
}

export interface UseAnalyticsResult {
  analytics: VotingAnalytics | null;
  isLoading: boolean;
  error: VotingApiError | null;
  actions: {
    loadAnalytics: (timeframe: AnalyticsTimeframe) => Promise<void>;
    exportData: (format: 'csv' | 'json' | 'pdf') => Promise<string>;
    generateReport: (type: string, parameters: Record<string, any>) => Promise<string>;
  };
} 