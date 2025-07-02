// Task 7.2.3: User Profile Creation & Management
// TypeScript definitions for user profiles, privacy settings, and verification

// Core Profile Types
export interface UserProfile {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  completionPercentage: number;
  personalInfo: PersonalInfo;
  professionalInfo?: ProfessionalInfo;
  socialLinks: SocialLinks;
  interests: InterestTag[];
  privacySettings: PrivacySettings;
  verificationStatus: VerificationStatus;
  communityProfiles: CommunityProfile[];
  achievements: Achievement[];
  activityStats: ActivityStats;
}

export interface PersonalInfo {
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio: string;
  avatar: ProfileAvatar;
  location?: LocationInfo;
  dateOfBirth?: string;
  timezone?: string;
  languages: string[];
  pronouns?: string;
  website?: string;
  tagline?: string;
}

export interface ProfileAvatar {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  isDefault: boolean;
  source: 'upload' | 'generated' | 'social';
}

export interface LocationInfo {
  country?: string;
  state?: string;
  city?: string;
  isPublic: boolean;
  precision: 'exact' | 'city' | 'state' | 'country';
}

export interface ProfessionalInfo {
  title?: string;
  company?: string;
  industry?: string;
  experience?: ExperienceLevel;
  skills: Skill[];
  education: EducationEntry[];
  certifications: Certification[];
  portfolioLinks: PortfolioLink[];
  isPublic: boolean;
}

export type ExperienceLevel = 'student' | 'entry' | 'mid' | 'senior' | 'expert' | 'executive';

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements: number;
  isPublic: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  isCurrentlyStudying: boolean;
  description?: string;
  isPublic: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  isVerified: boolean;
  isPublic: boolean;
}

export interface PortfolioLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'website' | 'github' | 'project' | 'article' | 'other';
  isPublic: boolean;
}

export interface SocialLinks {
  twitter?: SocialLink;
  linkedin?: SocialLink;
  github?: SocialLink;
  discord?: SocialLink;
  telegram?: SocialLink;
  instagram?: SocialLink;
  custom: CustomSocialLink[];
}

export interface SocialLink {
  username: string;
  url: string;
  isVerified: boolean;
  verifiedAt?: string;
  isPublic: boolean;
}

export interface CustomSocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon?: string;
  isPublic: boolean;
}

export interface InterestTag {
  id: string;
  name: string;
  category: string;
  weight: number;
  isPublic: boolean;
  addedAt: string;
}

// Privacy and Visibility Types
export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  fieldVisibility: FieldVisibilitySettings;
  communitySettings: CommunityPrivacySettings;
  dataSharing: DataSharingSettings;
  communicationPreferences: CommunicationPreferences;
}

export type ProfileVisibility = 'public' | 'communities_only' | 'friends_only' | 'private';

export interface FieldVisibilitySettings {
  personalInfo: {
    displayName: VisibilityLevel;
    realName: VisibilityLevel;
    bio: VisibilityLevel;
    avatar: VisibilityLevel;
    location: VisibilityLevel;
    languages: VisibilityLevel;
    website: VisibilityLevel;
  };
  professionalInfo: {
    title: VisibilityLevel;
    company: VisibilityLevel;
    skills: VisibilityLevel;
    education: VisibilityLevel;
    certifications: VisibilityLevel;
    portfolio: VisibilityLevel;
  };
  socialLinks: {
    twitter: VisibilityLevel;
    linkedin: VisibilityLevel;
    github: VisibilityLevel;
    discord: VisibilityLevel;
    other: VisibilityLevel;
  };
  communityData: {
    membershipList: VisibilityLevel;
    activityHistory: VisibilityLevel;
    achievements: VisibilityLevel;
    reputation: VisibilityLevel;
  };
}

export type VisibilityLevel = 'public' | 'communities' | 'friends' | 'private';

export interface CommunityPrivacySettings {
  defaultJoinVisibility: VisibilityLevel;
  allowCommunityInvites: boolean;
  showActivityBetweenCommunities: boolean;
  allowCrossCommunityProfile: boolean;
  communitySpecificSettings: Record<string, CommunitySpecificPrivacy>;
}

export interface CommunitySpecificPrivacy {
  communityId: string;
  profileVisibility: VisibilityLevel;
  activityVisibility: VisibilityLevel;
  allowMentions: boolean;
  allowDirectMessages: boolean;
  customDisplayName?: string;
  customBio?: string;
}

export interface DataSharingSettings {
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdPartyIntegrations: boolean;
  allowMarketingCommunications: boolean;
  dataRetentionPeriod: number;
  autoDeleteInactiveData: boolean;
}

export interface CommunicationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly' | 'never';
    types: NotificationType[];
  };
  push: {
    enabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
}

export type NotificationType = 
  | 'mentions'
  | 'direct_messages'
  | 'community_updates'
  | 'verification_status'
  | 'profile_views'
  | 'connection_requests'
  | 'achievement_unlocked'
  | 'security_alerts';

// Verification System Types
export interface VerificationStatus {
  overall: VerificationLevel;
  identity: IdentityVerification;
  wallet: WalletVerification[];
  social: SocialVerification[];
  community: CommunityVerification[];
  trustScore: number;
  lastUpdated: string;
}

export type VerificationLevel = 'unverified' | 'basic' | 'enhanced' | 'premium';

export interface IdentityVerification {
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  method?: 'government_id' | 'passport' | 'driver_license';
  verifiedAt?: string;
  expiresAt?: string;
  verificationProvider?: string;
  rejectionReason?: string;
}

export interface WalletVerification {
  id: string;
  address: string;
  chain: string;
  verificationMethod: 'signature' | 'transaction' | 'message';
  verifiedAt: string;
  isPrimary: boolean;
  nickname?: string;
  isPublic: boolean;
}

export interface SocialVerification {
  platform: string;
  username: string;
  verificationMethod: 'oauth' | 'post' | 'bio' | 'manual';
  verifiedAt: string;
  followerCount?: number;
  isPublic: boolean;
}

export interface CommunityVerification {
  communityId: string;
  communityName: string;
  role: string;
  verifiedAt: string;
  verifiedBy: string;
  achievements: string[];
  trustLevel: number;
}

// Multi-Community Profile Types
export interface CommunityProfile {
  id: string;
  communityId: string;
  communityName: string;
  displayName?: string;
  bio?: string;
  avatar?: ProfileAvatar;
  joinedAt: string;
  role: CommunityRole;
  status: CommunityMemberStatus;
  reputation: ReputationScore;
  achievements: CommunityAchievement[];
  activityStats: CommunityActivityStats;
  isPublic: boolean;
}

export interface CommunityRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  badgeIcon?: string;
  badgeColor?: string;
  isPublic: boolean;
}

export type CommunityMemberStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'left';

export interface ReputationScore {
  total: number;
  breakdown: {
    participation: number;
    helpfulness: number;
    leadership: number;
    expertise: number;
  };
  trend: 'rising' | 'stable' | 'declining';
  rank?: number;
  percentile?: number;
}

export interface CommunityAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  icon: string;
  points: number;
  isPublic: boolean;
}

export interface CommunityActivityStats {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  likesGiven: number;
  proposalsCreated: number;
  votesParticipated: number;
  eventsAttended: number;
  lastActiveAt: string;
  streakDays: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
  isPublic: boolean;
}

export interface ActivityStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  communitiesJoined: number;
  achievementsUnlocked: number;
  profileViews: number;
  connectionsCount: number;
  verificationLevel: VerificationLevel;
  joinedAt: string;
  lastActiveAt: string;
  longestStreak: number;
  currentStreak: number;
}

// Profile Wizard Types
export interface ProfileWizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  stepData: ProfileWizardStepData;
  isComplete: boolean;
  canProceed: boolean;
  errors: Record<string, string>;
}

export interface ProfileWizardStepData {
  basicInfo: Partial<PersonalInfo>;
  avatar: Partial<ProfileAvatar>;
  interests: InterestTag[];
  privacy: Partial<PrivacySettings>;
  social: Partial<SocialLinks>;
  professional?: Partial<ProfessionalInfo>;
}

export type ProfileWizardStep = 
  | 'welcome'
  | 'basic_info'
  | 'avatar'
  | 'interests'
  | 'social_links'
  | 'professional'
  | 'privacy'
  | 'verification'
  | 'complete';

export interface ProfileWizardStepProps {
  stepData: ProfileWizardStepData;
  onUpdateStep: (step: string, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

// Component Props Types
export interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
  section?: 'personal' | 'professional' | 'social' | 'privacy' | 'verification';
}

export interface PrivacyControlsProps {
  settings: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
}

export interface VerificationComponentProps {
  verificationStatus: VerificationStatus;
  onStartVerification: (type: string) => void;
  onRetryVerification: (type: string) => void;
  isLoading?: boolean;
}

// API Types
export interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
  error?: ProfileError;
}

export interface ProfileError {
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

// Hook Return Types
export interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: ProfileError | null;
  actions: {
    updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
    uploadAvatar: (file: File) => Promise<ProfileAvatar>;
    deleteProfile: () => Promise<void>;
    refreshProfile: () => Promise<void>;
  };
}

export interface UseVerificationResult {
  verificationStatus: VerificationStatus | null;
  isLoading: boolean;
  error: ProfileError | null;
  actions: {
    startIdentityVerification: (method: string) => Promise<string>;
    verifyWallet: (address: string, signature: string) => Promise<WalletVerification>;
    verifySocial: (platform: string, proof: string) => Promise<SocialVerification>;
    refreshVerification: () => Promise<void>;
  };
}

export interface UseProfileWizardResult {
  wizardState: ProfileWizardState;
  actions: {
    updateStep: (step: string, data: any) => void;
    nextStep: () => void;
    previousStep: () => void;
    skipStep: () => void;
    completeWizard: () => Promise<UserProfile>;
    saveProgress: () => Promise<void>;
  };
}

// Constants
export const PROFILE_WIZARD_STEPS: ProfileWizardStep[] = [
  'welcome',
  'basic_info',
  'avatar',
  'interests',
  'social_links',
  'professional',
  'privacy',
  'verification',
  'complete'
];

export const VISIBILITY_LEVELS: Record<VisibilityLevel, string> = {
  public: 'Everyone',
  communities: 'Community Members',
  friends: 'Connections Only',
  private: 'Only Me'
};

export const SOCIAL_PLATFORMS = [
  'twitter',
  'linkedin',
  'github',
  'discord',
  'telegram',
  'instagram'
] as const;

export const INTEREST_CATEGORIES = [
  'Technology',
  'Finance',
  'Arts',
  'Sports',
  'Travel',
  'Music',
  'Gaming',
  'Food',
  'Books',
  'Health',
  'Education',
  'Business',
  'Science',
  'Environment',
  'Community'
] as const;

export const PROFILE_ERROR_CODES = {
  INVALID_DATA: 'invalid_data',
  PROFILE_NOT_FOUND: 'profile_not_found',
  UNAUTHORIZED: 'unauthorized',
  VERIFICATION_FAILED: 'verification_failed',
  UPLOAD_FAILED: 'upload_failed',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error'
} as const;

export const PROFILE_CONFIG = {
  maxAvatarSize: 5 * 1024 * 1024, // 5MB
  allowedAvatarTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  maxBioLength: 500,
  maxDisplayNameLength: 50,
  requestTimeout: 30000,
  autoSaveInterval: 60000
};

export default {
  PROFILE_WIZARD_STEPS,
  VISIBILITY_LEVELS,
  SOCIAL_PLATFORMS,
  INTEREST_CATEGORIES,
  PROFILE_ERROR_CODES,
  PROFILE_CONFIG
}; 