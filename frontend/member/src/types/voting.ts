// Voting Types and Interfaces
// This file contains all TypeScript interfaces and types for the voting system

// Core Voting Data Types
export interface VotingQuestion {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
  status: VotingStatus;
  type: VoteType;
  options: VotingOption[];
  totalVotes: number;
  userHasVoted: boolean;
  userVote?: Vote;
  minVotes?: number;
  maxVotes?: number;
  requiresAuth: boolean;
  communityId: string;
  createdBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface VotingOption {
  id: string;
  questionId: string;
  text: string;
  description?: string;
  order: number;
  voteCount: number;
  percentage: number;
  isSelected?: boolean;
}

export interface Vote {
  id: string;
  questionId: string;
  optionIds: string[];
  userId: string;
  timestamp: Date;
  transactionHash?: string; // For blockchain voting
  ipAddress?: string;
  userAgent?: string;
}

export interface VotingResult {
  questionId: string;
  totalVotes: number;
  totalParticipants: number;
  options: VotingOptionResult[];
  status: VotingStatus;
  deadline: Date;
  finalizedAt?: Date;
}

export interface VotingOptionResult {
  optionId: string;
  text: string;
  voteCount: number;
  percentage: number;
  isWinner?: boolean;
}

// State Management Types
export interface VotingState {
  questions: VotingQuestion[];
  activeQuestion: VotingQuestion | null;
  userVotes: Vote[];
  loading: boolean;
  error: VotingError | null;
  pagination: PaginationState;
  filters: VotingFilters;
}

export interface VotingAction {
  type: VotingActionType;
  payload?: any;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface VotingFilters {
  status?: VotingStatus[];
  type?: VoteType[];
  communityId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

// API Response Types
export interface VotingAPIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: VotingError;
  timestamp: Date;
}

export interface VotingQuestionsResponse {
  questions: VotingQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VotingHistoryResponse {
  votes: Vote[];
  questions: VotingQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CastVoteResponse {
  vote: Vote;
  updatedQuestion: VotingQuestion;
  transactionHash?: string;
}

export interface VotingStatsResponse {
  totalQuestions: number;
  activeQuestions: number;
  completedQuestions: number;
  userParticipation: number;
  recentActivity: VotingActivity[];
}

export interface VotingActivity {
  id: string;
  type: 'question_created' | 'vote_cast' | 'question_closed';
  questionId: string;
  questionTitle: string;
  timestamp: Date;
  userId?: string;
  details?: Record<string, any>;
}

// Real-time Update Types
export interface VotingUpdatePayload {
  type: VotingUpdateType;
  questionId: string;
  data: any;
  timestamp: Date;
}

export interface VoteCountUpdate {
  questionId: string;
  optionId: string;
  newCount: number;
  newPercentage: number;
  totalVotes: number;
}

// Enums
export enum VotingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  FINALIZED = 'finalized'
}

export enum VoteType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKED_CHOICE = 'ranked_choice',
  APPROVAL = 'approval',
  WEIGHTED = 'weighted'
}

export enum VotingActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_QUESTIONS = 'SET_QUESTIONS',
  ADD_QUESTION = 'ADD_QUESTION',
  UPDATE_QUESTION = 'UPDATE_QUESTION',
  SET_ACTIVE_QUESTION = 'SET_ACTIVE_QUESTION',
  ADD_VOTE = 'ADD_VOTE',
  UPDATE_VOTE_COUNT = 'UPDATE_VOTE_COUNT',
  SET_FILTERS = 'SET_FILTERS',
  SET_PAGINATION = 'SET_PAGINATION',
  CLEAR_ERROR = 'CLEAR_ERROR',
  RESET_STATE = 'RESET_STATE'
}

export enum VotingUpdateType {
  VOTE_CAST = 'vote_cast',
  QUESTION_UPDATED = 'question_updated',
  QUESTION_CLOSED = 'question_closed',
  NEW_QUESTION = 'new_question'
}

export enum VotingError {
  NETWORK_ERROR = 'network_error',
  UNAUTHORIZED = 'unauthorized',
  QUESTION_NOT_FOUND = 'question_not_found',
  VOTING_CLOSED = 'voting_closed',
  ALREADY_VOTED = 'already_voted',
  INVALID_OPTION = 'invalid_option',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  VALIDATION_ERROR = 'validation_error',
  BLOCKCHAIN_ERROR = 'blockchain_error',
  SERVER_ERROR = 'server_error'
}

// Utility Types
export type VotingQuestionWithResults = VotingQuestion & {
  results: VotingResult;
};

export type CreateVotingQuestionDTO = Omit<VotingQuestion, 'id' | 'createdAt' | 'updatedAt' | 'totalVotes' | 'userHasVoted' | 'userVote'>;

export type UpdateVotingQuestionDTO = Partial<Pick<VotingQuestion, 'title' | 'description' | 'deadline' | 'status' | 'tags' | 'metadata'>>;

export type CastVoteDTO = {
  questionId: string;
  optionIds: string[];
  metadata?: Record<string, any>;
};

// Hook Return Types
export interface UseVotingReturn {
  state: VotingState;
  actions: {
    loadQuestions: (filters?: VotingFilters) => Promise<void>;
    loadQuestion: (id: string) => Promise<void>;
    castVote: (vote: CastVoteDTO) => Promise<void>;
    loadUserVotes: () => Promise<void>;
    clearError: () => void;
    setFilters: (filters: VotingFilters) => void;
    loadMore: () => Promise<void>;
  };
}

export interface UseVotingHistoryReturn {
  votes: Vote[];
  questions: VotingQuestion[];
  loading: boolean;
  error: VotingError | null;
  pagination: PaginationState;
  loadHistory: (filters?: VotingFilters, page?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  updateFilters: (filters: Partial<VotingFilters>) => void;
  refresh: () => void;
  clearHistory: () => void;
  getQuestionForVote: (voteId: string) => VotingQuestion | undefined;
  getVotesForQuestion: (questionId: string) => Vote[];
  getVotesByDateRange: (start: Date, end: Date) => Vote[];
  getParticipationStats: () => any;
}

// Component Props Types
export interface VotingQuestionCardProps {
  question: VotingQuestion;
  onVote?: (questionId: string, optionIds: string[]) => void;
  onViewDetails?: (questionId: string) => void;
  showResults?: boolean;
  compact?: boolean;
}

export interface VoteOptionsProps {
  question: VotingQuestion;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  disabled?: boolean;
  showResults?: boolean;
}

export interface VotingHistoryProps {
  userId?: string;
  filters?: VotingFilters;
  pageSize?: number;
}

export interface VotingProgressProps {
  question: VotingQuestion;
  showPercentages?: boolean;
  showCounts?: boolean;
  animated?: boolean;
} 