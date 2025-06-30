/**
 * Task 4.5.3: Public User Onboarding & Registration Flow
 * TypeScript Definitions and Interfaces
 * 
 * Comprehensive type system for user registration, onboarding,
 * wallet connection, and community integration processes.
 */

import { ReactNode } from 'react';

// ============================================================================
// CORE REGISTRATION TYPES
// ============================================================================

export interface RegistrationData {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  dateOfBirth?: string;
  country?: string;
  referralCode?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  marketingOptIn: boolean;
  createdAt: Date;
  emailVerified: boolean;
  profileComplete: boolean;
  onboardingComplete: boolean;
}

export interface RegistrationFormData {
  email: string;
  username: string;
  fullName?: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  country?: string;
  referralCode?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  marketingOptIn: boolean;
}

export interface EmailVerificationData {
  email: string;
  verificationCode: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// ============================================================================
// ONBOARDING FLOW TYPES
// ============================================================================

export enum OnboardingStep {
  WELCOME = 'welcome',
  WALLET_SETUP = 'wallet_setup',
  EDUCATION = 'education',
  PROFILE = 'profile',
  COMMUNITY = 'community',
  COMPLETION = 'completion'
}

export interface OnboardingProgress {
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  skippedSteps: OnboardingStep[];
  totalSteps: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
}

export interface OnboardingStepData {
  step: OnboardingStep;
  title: string;
  description: string;
  estimatedDuration: number;
  required: boolean;
  prerequisites: OnboardingStep[];
  content: ReactNode;
  validation?: (data: any) => ValidationResult;
}

export interface OnboardingConfiguration {
  steps: OnboardingStepData[];
  allowSkipping: boolean;
  showProgress: boolean;
  autoSave: boolean;
  timeoutDuration: number;
  requireCompletion: boolean;
}

// ============================================================================
// WALLET CONNECTION TYPES
// ============================================================================

export enum WalletProvider {
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare',
  SOLLET = 'sollet',
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect'
}

export interface WalletConnection {
  id: string;
  userId: string;
  provider: WalletProvider;
  publicKey: string;
  address: string;
  balance: number;
  verified: boolean;
  isPrimary: boolean;
  connectedAt: Date;
  lastUsed: Date;
  metadata: WalletMetadata;
}

export interface WalletMetadata {
  name: string;
  icon: string;
  version: string;
  isInstalled: boolean;
  downloadUrl: string;
  setupGuideUrl: string;
  features: string[];
}

export interface WalletSetupStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  media?: {
    type: 'image' | 'video' | 'animation';
    url: string;
    alt: string;
  };
  verification?: () => Promise<boolean>;
  troubleshooting: TroubleshootingStep[];
}

export interface TroubleshootingStep {
  problem: string;
  solution: string;
  steps: string[];
  helpUrl?: string;
}

// ============================================================================
// PROFILE SETUP TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLink[];
  interests: string[];
  communityPreferences: CommunityPreference[];
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  completionPercentage: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

export interface CommunityPreference {
  category: string;
  preference: 'interested' | 'not_interested' | 'neutral';
  weight: number;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'community_only' | 'private';
  showEmail: boolean;
  showWalletAddress: boolean;
  showVotingHistory: boolean;
  allowMessages: boolean;
  allowFollowers: boolean;
}

export interface NotificationSettings {
  email: EmailNotifications;
  push: PushNotifications;
  inApp: InAppNotifications;
}

export interface EmailNotifications {
  enabled: boolean;
  communityUpdates: boolean;
  votingReminders: boolean;
  proposalNotifications: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
}

export interface PushNotifications {
  enabled: boolean;
  urgentNotifications: boolean;
  communityMessages: boolean;
  votingDeadlines: boolean;
}

export interface InAppNotifications {
  enabled: boolean;
  showBadges: boolean;
  soundEnabled: boolean;
  autoMarkRead: boolean;
}

// ============================================================================
// COMMUNITY INTEGRATION TYPES
// ============================================================================

export interface CommunityRecommendation {
  community: {
    id: string;
    name: string;
    description: string;
    category: string;
    memberCount: number;
    activityLevel: 'low' | 'medium' | 'high';
    icon: string;
    isPublic: boolean;
  };
  score: number;
  reasons: string[];
  matchingInterests: string[];
  estimatedEngagement: number;
}

export interface CommunityJoinRequest {
  id: string;
  userId: string;
  communityId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  autoApproved: boolean;
}

// ============================================================================
// EDUCATION & TUTORIAL TYPES
// ============================================================================

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'blockchain' | 'governance' | 'security' | 'platform';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites: string[];
  content: EducationContent[];
  quiz?: QuizData;
  completion?: ModuleCompletion;
}

export interface EducationContent {
  type: 'text' | 'video' | 'interactive' | 'animation';
  title: string;
  content: string | ReactNode;
  media?: {
    url: string;
    type: string;
    thumbnail?: string;
  };
  interactive?: InteractiveElement;
}

export interface InteractiveElement {
  type: 'simulation' | 'demo' | 'exercise';
  component: ReactNode;
  validation?: (input: any) => boolean;
  hints: string[];
}

export interface QuizData {
  questions: QuizQuestion[];
  passingScore: number;
  attempts: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface ModuleCompletion {
  userId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  timeSpent: number;
  completedAt?: Date;
}

// ============================================================================
// TUTORIAL AND HELP TYPES
// ============================================================================

export interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSkip: boolean;
  showNext: boolean;
  showPrevious: boolean;
  action?: {
    type: 'click' | 'input' | 'wait';
    selector?: string;
    value?: string;
    duration?: number;
  };
}

export interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  autoStart: boolean;
  showProgress: boolean;
  persistProgress: boolean;
  exitOnClickOutside: boolean;
  highlightTarget: boolean;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
}

// ============================================================================
// VALIDATION AND ERROR TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface RegistrationError {
  type: 'validation' | 'network' | 'server' | 'wallet' | 'verification';
  message: string;
  details?: any;
  recoverable: boolean;
  retryable: boolean;
  suggestions: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface RegistrationResponse {
  success: boolean;
  data?: {
    userId: string;
    registrationId: string;
    verificationRequired: boolean;
    onboardingUrl: string;
  };
  error?: RegistrationError;
}

export interface OnboardingResponse {
  success: boolean;
  data?: {
    progress: OnboardingProgress;
    nextStep: OnboardingStep;
    recommendations: CommunityRecommendation[];
  };
  error?: RegistrationError;
}

export interface EmailVerificationResponse {
  success: boolean;
  data?: {
    verified: boolean;
    userId: string;
    nextStep: string;
  };
  error?: RegistrationError;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseRegistrationResult {
  // State
  registrationData: RegistrationFormData | null;
  isRegistering: boolean;
  isEmailVerifying: boolean;
  currentStep: string;
  errors: RegistrationError[];
  
  // Actions
  updateRegistrationData: (data: Partial<RegistrationFormData>) => void;
  submitRegistration: () => Promise<RegistrationResponse>;
  verifyEmail: (code: string) => Promise<EmailVerificationResponse>;
  resendVerification: () => Promise<void>;
  resetRegistration: () => void;
  
  // Validation
  validateField: (field: string, value: any) => ValidationResult;
  validateForm: () => ValidationResult;
}

export interface UseOnboardingResult {
  // State
  progress: OnboardingProgress | null;
  currentStepData: OnboardingStepData | null;
  isLoading: boolean;
  isSaving: boolean;
  errors: RegistrationError[];
  
  // Navigation
  goToStep: (step: OnboardingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipStep: () => void;
  
  // Data Management
  saveStepData: (data: any) => Promise<void>;
  completeStep: (step: OnboardingStep) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  
  // Utilities
  canGoToStep: (step: OnboardingStep) => boolean;
  isStepCompleted: (step: OnboardingStep) => boolean;
  getStepProgress: () => number;
}

export interface UseWalletSetupResult {
  // State
  availableWallets: WalletMetadata[];
  connectedWallet: WalletConnection | null;
  isConnecting: boolean;
  isVerifying: boolean;
  setupStep: number;
  errors: RegistrationError[];
  
  // Actions
  connectWallet: (provider: WalletProvider) => Promise<void>;
  verifyWallet: () => Promise<void>;
  disconnectWallet: () => void;
  retryConnection: () => void;
  
  // Setup Flow
  nextSetupStep: () => void;
  previousSetupStep: () => void;
  getSetupSteps: () => WalletSetupStep[];
  
  // Utilities
  isWalletInstalled: (provider: WalletProvider) => boolean;
  getWalletDownloadUrl: (provider: WalletProvider) => string;
}

// ============================================================================
// ANALYTICS AND TRACKING TYPES
// ============================================================================

export interface RegistrationAnalytics {
  sessionId: string;
  userId?: string;
  step: string;
  action: 'start' | 'progress' | 'complete' | 'abandon' | 'error';
  timestamp: Date;
  duration?: number;
  metadata: {
    source: string;
    referrer?: string;
    userAgent: string;
    errors?: RegistrationError[];
  };
}

export interface OnboardingAnalytics {
  sessionId: string;
  userId: string;
  step: OnboardingStep;
  action: 'enter' | 'exit' | 'complete' | 'skip' | 'help';
  timestamp: Date;
  timeSpent: number;
  interactions: number;
  helpUsed: boolean;
  errors: RegistrationError[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface OnboardingWizardProps {
  userId: string;
  configuration?: Partial<OnboardingConfiguration>;
  onComplete: (userId: string) => void;
  onSkip?: () => void;
  onError?: (error: RegistrationError) => void;
}

export interface RegistrationFormProps {
  initialData?: Partial<RegistrationFormData>;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  onValidationError: (errors: ValidationError[]) => void;
  showSocialLogin?: boolean;
  termsUrl: string;
  privacyUrl: string;
}

export interface WalletSetupProps {
  onComplete: (wallet: WalletConnection) => void;
  onSkip?: () => void;
  allowedProviders?: WalletProvider[];
  requireVerification?: boolean;
}

export interface EducationStepProps {
  modules: EducationModule[];
  onModuleComplete: (moduleId: string, score?: number) => void;
  onAllComplete: () => void;
  allowSkip?: boolean;
  requiredModules?: string[];
}

export interface ProfileStepProps {
  userId: string;
  initialProfile?: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
  requiredFields?: string[];
}

export interface CommunityStepProps {
  userId: string;
  recommendations: CommunityRecommendation[];
  onJoinCommunity: (communityId: string) => Promise<void>;
  onComplete: (joinedCommunities: string[]) => void;
  onSkip?: () => void;
  minRecommended?: number;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export for convenience
  ReactNode
} from 'react'; 