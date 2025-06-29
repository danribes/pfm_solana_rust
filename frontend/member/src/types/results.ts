// Results Visualization & Analytics Types
// Task 4.4.4 - Comprehensive types for charts, metrics, and analytics

import { VotingQuestion, Vote, VoteType } from './voting';

// ============================================================================
// CHART TYPES & INTERFACES
// ============================================================================

export type ChartType = 
  | 'bar' 
  | 'pie' 
  | 'line' 
  | 'doughnut' 
  | 'radar' 
  | 'area';

export interface ChartDataPoint {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  title?: string;
  subtitle?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip: {
      enabled: boolean;
      mode: 'point' | 'nearest' | 'index' | 'dataset';
    };
    title?: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      beginAtZero: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
  animation?: {
    duration: number;
    easing: 'linear' | 'easeInOut' | 'easeOut' | 'easeIn';
  };
}

// ============================================================================
// VOTING RESULTS TYPES
// ============================================================================

export interface VotingResult {
  questionId: string;
  question: {
    id: string;
    title: string;
    description: string;
    options: Array<{ id: string; text: string }>;
    type: string;
    status: string;
    createdAt: string;
    deadline: string;
    communityId: string;
    createdBy: string;
  };
  totalVotes: number;
  results: VotingOptionResult[];
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  lastUpdated: string;
  participationRate: number;
  winningOption?: string;
  chartData: ChartData;
}

export interface VotingOptionResult {
  optionId: string;
  optionText: string;
  voteCount: number;
  percentage: number;
  isWinner?: boolean;
}

export interface VotingResultsResponse {
  results: VotingResult[];
  totalQuestions: number;
  totalVotes: number;
  averageParticipation: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// COMMUNITY ANALYTICS TYPES
// ============================================================================

export interface CommunityAnalytics {
  communityId: string;
  communityName: string;
  totalMembers: number;
  activeMembers: number;
  totalVotingQuestions: number;
  completedVotingQuestions: number;
  averageParticipationRate: number;
  mostActiveVoters: MemberParticipation[];
  votingTrends: VotingTrend[];
  engagementMetrics: EngagementMetrics;
  timeSeriesData: TimeSeriesData[];
}

export interface MemberParticipation {
  memberId: string;
  memberAddress: string;
  memberName?: string;
  totalVotes: number;
  participationRate: number;
  lastVoteDate: string;
  votingStreak: number;
  reputation: number;
}

export interface VotingTrend {
  period: string;
  date: string;
  questionsCreated: number;
  questionsCompleted: number;
  totalVotes: number;
  uniqueVoters: number;
  averageParticipation: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
  newMemberGrowthRate: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label: string;
  category: string;
}

// ============================================================================
// PERSONAL ANALYTICS TYPES
// ============================================================================

export interface PersonalAnalytics {
  userId: string;
  userAddress: string;
  totalVotes: number;
  totalCommunities: number;
  votingHistory: PersonalVotingHistory[];
  participationRate: number;
  votingStreak: number;
  longestVotingStreak: number;
  averageVotingSpeed: number;
  favoriteVotingTimes: string[];
  communityContributions: CommunityContribution[];
  achievements: Achievement[];
  rankingPosition: number;
  totalRankings: number;
}

export interface PersonalVotingHistory {
  questionId: string;
  questionTitle: string;
  communityId: string;
  communityName: string;
  voteDate: string;
  votedOption: string;
  wasWinningVote: boolean;
  participationRank: number;
  timeToVote: number;
}

export interface CommunityContribution {
  communityId: string;
  communityName: string;
  votesInCommunity: number;
  participationRate: number;
  influence: number;
  joinDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: 'participation' | 'accuracy' | 'consistency' | 'leadership';
  points: number;
}

// ============================================================================
// DASHBOARD CONFIGURATION TYPES
// ============================================================================

export interface DashboardConfig {
  userId: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number; // Seconds
  exportSettings: ExportSettings;
}

export interface DashboardLayout {
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  responsive: {
    mobile: { columns: number };
    tablet: { columns: number };
    desktop: { columns: number };
  };
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  dataSource: DataSource;
  visible: boolean;
  refreshable: boolean;
}

export type WidgetType = 
  | 'chart' 
  | 'metric' 
  | 'table' 
  | 'list' 
  | 'progress' 
  | 'heatmap' 
  | 'timeline' 
  | 'leaderboard';

export interface WidgetConfig {
  chartType?: ChartType;
  showLegend?: boolean;
  showTooltips?: boolean;
  animationEnabled?: boolean;
  colorScheme?: string[];
  displayFormat?: 'number' | 'percentage' | 'currency';
  precision?: number;
  showTrend?: boolean;
  comparisonPeriod?: 'day' | 'week' | 'month' | 'year';
}

export interface DataSource {
  type: 'api' | 'static' | 'realtime';
  endpoint?: string;
  params?: Record<string, any>;
  refreshInterval?: number;
  cacheEnabled?: boolean;
  cacheDuration?: number;
}

// ============================================================================
// EXPORT & SHARING TYPES
// ============================================================================

export interface ExportSettings {
  defaultFormat: ExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  compressionEnabled: boolean;
  watermarkEnabled: boolean;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg';

export interface ExportRequest {
  type: 'report' | 'chart' | 'data';
  format: ExportFormat;
  data: any;
  options: ExportOptions;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  compression?: 'none' | 'gzip' | 'zip';
  quality?: number; // For image exports
  pageSize?: 'A4' | 'letter' | 'legal'; // For PDF exports
}

export interface ShareableLink {
  id: string;
  url: string;
  type: 'dashboard' | 'chart' | 'report';
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isPublic: boolean;
  accessCount: number;
  permissions: SharePermissions;
}

export interface SharePermissions {
  canView: boolean;
  canDownload: boolean;
  canShare: boolean;
  allowedDomains?: string[];
  passwordProtected?: boolean;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ResultsFilter {
  communityIds?: string[];
  questionIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: ('active' | 'completed' | 'cancelled')[];
  participationThreshold?: {
    min: number;
    max: number;
  };
  sortBy?: 'date' | 'participation' | 'votes' | 'title';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface AnalyticsQuery {
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface ResultsState {
  results: VotingResult[];
  communityAnalytics: CommunityAnalytics | null;
  personalAnalytics: PersonalAnalytics | null;
  filters: ResultsFilter;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  realTimeUpdates: boolean;
  selectedResult: VotingResult | null;
}

export interface ResultsAction {
  type: ResultsActionType;
  payload?: any;
}

export type ResultsActionType =
  | 'LOAD_RESULTS_START'
  | 'LOAD_RESULTS_SUCCESS'
  | 'LOAD_RESULTS_ERROR'
  | 'LOAD_COMMUNITY_ANALYTICS_SUCCESS'
  | 'LOAD_PERSONAL_ANALYTICS_SUCCESS'
  | 'UPDATE_FILTERS'
  | 'SELECT_RESULT'
  | 'CLEAR_SELECTION'
  | 'ENABLE_REAL_TIME'
  | 'DISABLE_REAL_TIME'
  | 'CLEAR_ERROR'
  | 'REFRESH_DATA';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ResultsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ResultsError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export type ResultsErrorCode =
  | 'RESULTS_NOT_FOUND'
  | 'ANALYTICS_ERROR'
  | 'EXPORT_FAILED'
  | 'CHART_RENDER_ERROR'
  | 'DATA_FETCH_ERROR'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'INVALID_FILTER'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ChartTheme {
  name: string;
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
  fonts: {
    family: string;
    sizes: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  delay: number;
  staggerDelay: number;
}

// Default export for convenience
export default {
  ChartType,
  WidgetType,
  ExportFormat,
  ResultsActionType,
  ResultsErrorCode
}; 