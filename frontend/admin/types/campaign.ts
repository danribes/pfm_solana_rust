// Campaign Management TypeScript Definitions for Admin Portal

export interface Campaign {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  communityId: string;
  creatorId: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  allowMultipleChoices: boolean;
  minSelections: number;
  maxSelections: number;
  eligibilityCriteria: EligibilityCriteria;
  questions: VotingQuestion[];
  totalVotes: number;
  totalParticipants: number;
  participationRate: number;
  metadata: CampaignMetadata;
}

export interface VotingQuestion {
  id: string;
  campaignId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options: VotingOption[];
  settings: QuestionSettings;
  order: number;
}

export interface VotingOption {
  id: string;
  questionId: string;
  text: string;
  description?: string;
  order: number;
  voteCount: number;
  percentage: number;
}

export interface CampaignMetadata {
  tags: string[];
  category: string;
  priority: CampaignPriority;
  isPublic: boolean;
  allowComments: boolean;
  requireReason: boolean;
  customFields: Record<string, any>;
}

export interface EligibilityCriteria {
  membershipDuration?: number;
  roleRequirements?: string[];
  excludedMembers?: string[];
  minStakeAmount?: number;
  customRules?: string[];
}

export interface QuestionSettings {
  randomizeOptions: boolean;
  allowOtherOption: boolean;
  requireExplanation: boolean;
  weightings?: Record<string, number>;
}

export interface CampaignFormData {
  title: string;
  description: string;
  instructions: string;
  communityId: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  allowMultipleChoices: boolean;
  minSelections: number;
  maxSelections: number;
  eligibilityCriteria: EligibilityCriteria;
  metadata: CampaignMetadata;
  questions: VotingQuestionFormData[];
}

export interface VotingQuestionFormData {
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: VotingOptionFormData[];
  settings: QuestionSettings;
}

export interface VotingOptionFormData {
  text: string;
  description: string;
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKED_CHOICE = 'ranked_choice',
  TEXT_INPUT = 'text_input',
  YES_NO = 'yes_no'
}

export enum CampaignPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
