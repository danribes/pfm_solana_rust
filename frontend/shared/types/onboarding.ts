// Task 7.2.1: User Onboarding Flow & Tutorial System
// TypeScript definitions for onboarding, education, and tutorial system

// Onboarding Step Types
export type OnboardingStep = 
  | 'welcome'
  | 'goals'
  | 'blockchain-education'
  | 'voting-tutorial'
  | 'wallet-education'
  | 'platform-tour'
  | 'community-guidance'
  | 'first-vote'
  | 'completion';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

// User Profile & Goals
export interface UserOnboardingProfile {
  userId: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  goals: OnboardingGoal[];
  skipAdvanced: boolean;
  preferredLearningStyle: 'visual' | 'interactive' | 'reading' | 'video';
  estimatedTimeAvailable: number; // minutes
}

export interface OnboardingGoal {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'participation' | 'community' | 'financial';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  completed: boolean;
}

// Onboarding State Management
export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  profile: UserOnboardingProfile;
  progress: number; // 0-100
  timeSpent: number; // minutes
  startedAt: string;
  lastActiveAt: string;
  isCompleted: boolean;
  hasSkipped: boolean;
  achievements: Achievement[];
  badges: Badge[];
}

export interface OnboardingStepData {
  step: OnboardingStep;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  isRequired: boolean;
  prerequisites: OnboardingStep[];
  content: EducationContent | TutorialContent | CommunityContent;
  quiz?: Quiz;
  practiceActivity?: PracticeActivity;
}

// Education Content Types
export interface EducationContent {
  type: 'blockchain' | 'voting' | 'wallet' | 'security' | 'community';
  title: string;
  description: string;
  sections: EducationSection[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number; // minutes
  videoUrl?: string;
  interactiveDemo?: InteractiveDemo;
}

export interface EducationSection {
  id: string;
  title: string;
  content: string;
  illustrations?: Illustration[];
  keyPoints: string[];
  examples: Example[];
  relatedConcepts: string[];
}

export interface Illustration {
  id: string;
  type: 'image' | 'diagram' | 'animation' | 'infographic';
  url: string;
  caption: string;
  description: string;
}

export interface Example {
  id: string;
  title: string;
  description: string;
  scenario: string;
  outcome: string;
  learningPoint: string;
}

// Interactive Demos and Tutorials
export interface InteractiveDemo {
  id: string;
  title: string;
  type: 'simulation' | 'guided_tour' | 'practice' | 'quiz';
  steps: DemoStep[];
  canSkip: boolean;
  trackProgress: boolean;
}

export interface DemoStep {
  id: string;
  title: string;
  instruction: string;
  action: DemoAction;
  validation?: StepValidation;
  hints: string[];
  skipAllowed: boolean;
}

export interface DemoAction {
  type: 'click' | 'input' | 'select' | 'navigation' | 'observation';
  target: string; // CSS selector or element ID
  expectedValue?: string;
  waitFor?: string; // What to wait for before continuing
}

export interface StepValidation {
  type: 'element_present' | 'value_correct' | 'state_changed' | 'custom';
  criteria: ValidationCriteria;
  errorMessage: string;
  successMessage: string;
}

export interface ValidationCriteria {
  selector?: string;
  expectedValue?: string;
  customValidator?: (state: any) => boolean;
}

// Tutorial System
export interface TutorialContent {
  id: string;
  title: string;
  description: string;
  category: 'platform_basics' | 'voting' | 'community' | 'wallet' | 'governance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  format: 'interactive_tour' | 'step_by_step' | 'video' | 'practice';
  estimatedTime: number;
  prerequisites: string[];
  learningObjectives: string[];
  content: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  action?: TutorialAction;
  media?: TutorialMedia;
  interactive?: InteractiveElement;
  quiz?: QuizQuestion;
  checkpoint?: boolean;
}

export interface TutorialAction {
  type: 'navigate' | 'click' | 'input' | 'wait' | 'scroll';
  target: string;
  value?: string;
  description: string;
}

export interface TutorialMedia {
  type: 'image' | 'video' | 'gif' | 'screenshot';
  url: string;
  caption?: string;
  thumbnail?: string;
}

export interface InteractiveElement {
  type: 'button' | 'form' | 'slider' | 'toggle' | 'dropdown';
  id: string;
  label: string;
  options?: string[];
  defaultValue?: string;
  validation?: string;
}

// Quiz and Assessment System
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  allowRetry: boolean;
  showExplanations: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'drag_drop' | 'fill_blank' | 'matching';
  options?: QuizOption[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: QuizAnswer[];
  completedAt: string;
  timeSpent: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

// Practice Activities
export interface PracticeActivity {
  id: string;
  title: string;
  description: string;
  type: 'voting_simulation' | 'wallet_practice' | 'community_interaction' | 'governance_proposal';
  difficulty: 'easy' | 'medium' | 'hard';
  scenario: PracticeScenario;
  objectives: string[];
  hints: string[];
  feedback: PracticeFeedback[];
}

export interface PracticeScenario {
  title: string;
  description: string;
  context: string;
  initialState: any;
  expectedOutcome: string;
  successCriteria: SuccessCriteria[];
}

export interface SuccessCriteria {
  id: string;
  description: string;
  validator: (state: any) => boolean;
  weight: number; // for scoring
}

export interface PracticeFeedback {
  trigger: 'success' | 'error' | 'hint_request' | 'timeout';
  message: string;
  type: 'encouragement' | 'correction' | 'guidance' | 'warning';
  actionSuggestion?: string;
}

// Community Integration
export interface CommunityContent {
  recommendedCommunities: RecommendedCommunity[];
  joinGuidance: JoinGuidance;
  etiquetteGuide: EtiquetteGuide;
  firstVoteGuidance: FirstVoteGuidance;
}

export interface RecommendedCommunity {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activityLevel: 'high' | 'medium' | 'low';
  matchReason: string;
  matchScore: number; // 0-100
  joinDifficulty: 'easy' | 'moderate' | 'challenging';
  expectedTimeCommitment: string;
}

export interface JoinGuidance {
  steps: GuidanceStep[];
  tips: string[];
  commonMistakes: string[];
  expectedTimeline: string;
}

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  action: string;
  expectedResult: string;
  troubleshooting: string[];
}

export interface EtiquetteGuide {
  principles: EtiquettePrinciple[];
  doAndDonts: DoAndDont[];
  examples: EtiquetteExample[];
}

export interface EtiquettePrinciple {
  title: string;
  description: string;
  importance: string;
  examples: string[];
}

export interface DoAndDont {
  category: string;
  dos: string[];
  donts: string[];
  reasoning: string;
}

export interface EtiquetteExample {
  scenario: string;
  goodResponse: string;
  badResponse: string;
  explanation: string;
}

export interface FirstVoteGuidance {
  preparation: string[];
  votingProcess: string[];
  afterVoting: string[];
  commonConcerns: Concern[];
}

export interface Concern {
  question: string;
  answer: string;
  category: 'technical' | 'social' | 'procedural' | 'security';
}

// Progress Tracking and Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'participation' | 'community' | 'completion';
  icon: string;
  badgeIcon?: string;
  condition: AchievementCondition;
  rewards: Reward[];
  unlockedAt?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'step_completion' | 'quiz_score' | 'time_spent' | 'streak' | 'perfect_score' | 'help_others';
  target: string | number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'education' | 'participation' | 'community' | 'expert' | 'helper';
  level: number; // 1-5 for progression
  earnedAt: string;
  shareableUrl?: string;
}

export interface Reward {
  type: 'badge' | 'points' | 'access' | 'recognition' | 'feature_unlock';
  value: string | number;
  description: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining: number; // minutes
  celebration?: Celebration;
}

export interface Celebration {
  type: 'confetti' | 'badge_reveal' | 'progress_highlight' | 'share_prompt';
  message: string;
  duration: number; // seconds
  interactive: boolean;
}

// Progress Analytics
export interface OnboardingAnalytics {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  metrics: OnboardingMetrics;
  feedback: UserFeedback[];
}

export interface AnalyticsEvent {
  type: 'step_start' | 'step_complete' | 'step_skip' | 'quiz_attempt' | 'help_request' | 'error';
  timestamp: string;
  step: OnboardingStep;
  data: any;
  duration?: number; // milliseconds
}

export interface OnboardingMetrics {
  totalTimeSpent: number; // minutes
  stepsCompleted: number;
  stepsSkipped: number;
  quizzesPassed: number;
  quizzesFailed: number;
  helpRequestsCount: number;
  errorsEncountered: number;
  completionRate: number; // percentage
  engagementScore: number; // 0-100
}

export interface UserFeedback {
  step: OnboardingStep;
  rating: number; // 1-5
  comment?: string;
  timestamp: string;
  helpful: boolean;
  suggestions?: string;
}

// API Response Types
export interface OnboardingResponse {
  success: boolean;
  data?: OnboardingState;
  message?: string;
  error?: OnboardingError;
}

export interface OnboardingError {
  code: string;
  message: string;
  field?: string;
  retryable: boolean;
}

export interface TutorialProgressResponse {
  success: boolean;
  data?: TutorialProgress;
  message?: string;
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  progress: number; // percentage
  timeSpent: number; // minutes
  lastAccessedAt: string;
  isCompleted: boolean;
}

// Component Props Types
export interface OnboardingWizardProps {
  userId: string;
  initialStep?: OnboardingStep;
  onComplete?: (profile: UserOnboardingProfile) => void;
  onSkip?: (step: OnboardingStep) => void;
  onExit?: () => void;
  showProgress?: boolean;
  allowSkipping?: boolean;
  customization?: OnboardingCustomization;
}

export interface OnboardingCustomization {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  showAnimations: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
}

export interface EducationStepProps {
  content: EducationContent;
  onComplete: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  progress: number;
  allowSkip: boolean;
}

export interface TutorialStepProps {
  tutorial: TutorialContent;
  currentStep: number;
  onStepComplete: (stepId: string) => void;
  onTutorialComplete: () => void;
  onExit: () => void;
  allowSkip: boolean;
}

export interface ProgressTrackerProps {
  onboardingState: OnboardingState;
  showDetails?: boolean;
  compact?: boolean;
  onMilestoneClick?: (milestone: Milestone) => void;
}

export interface AchievementDisplayProps {
  achievements: Achievement[];
  badges: Badge[];
  showNewOnly?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  animateNew?: boolean;
}

// Hook Return Types
export interface UseOnboardingResult {
  state: OnboardingState;
  actions: {
    startOnboarding: (profile: UserOnboardingProfile) => Promise<void>;
    completeStep: (step: OnboardingStep) => Promise<void>;
    skipStep: (step: OnboardingStep) => Promise<void>;
    updateProfile: (updates: Partial<UserOnboardingProfile>) => void;
    resetOnboarding: () => void;
    pauseOnboarding: () => void;
    resumeOnboarding: () => void;
  };
  analytics: {
    trackEvent: (event: AnalyticsEvent) => void;
    submitFeedback: (feedback: UserFeedback) => Promise<void>;
    getMetrics: () => OnboardingMetrics;
  };
  isLoading: boolean;
  error: OnboardingError | null;
}

export interface UseTutorialResult {
  currentTutorial: TutorialContent | null;
  progress: TutorialProgress | null;
  actions: {
    startTutorial: (tutorialId: string) => Promise<void>;
    completeStep: (stepId: string) => Promise<void>;
    pauseTutorial: () => void;
    resumeTutorial: () => void;
    resetTutorial: () => void;
    skipToStep: (stepNumber: number) => void;
  };
  isLoading: boolean;
  error: string | null;
}

// Configuration and Constants
export const ONBOARDING_STEPS: Record<OnboardingStep, OnboardingStepData> = {
  welcome: {
    step: 'welcome',
    title: 'Welcome to PFM Platform',
    description: 'Get started with participatory financial management',
    estimatedTime: 3,
    isRequired: true,
    prerequisites: [],
    content: {} as any
  },
  goals: {
    step: 'goals',
    title: 'Set Your Goals',
    description: 'Tell us what you want to achieve',
    estimatedTime: 5,
    isRequired: true,
    prerequisites: ['welcome'],
    content: {} as any
  },
  'blockchain-education': {
    step: 'blockchain-education',
    title: 'Blockchain Basics',
    description: 'Learn fundamental blockchain concepts',
    estimatedTime: 15,
    isRequired: false,
    prerequisites: ['goals'],
    content: {} as any
  },
  'voting-tutorial': {
    step: 'voting-tutorial',
    title: 'How Voting Works',
    description: 'Understand our voting mechanisms',
    estimatedTime: 10,
    isRequired: true,
    prerequisites: ['blockchain-education'],
    content: {} as any
  },
  'wallet-education': {
    step: 'wallet-education',
    title: 'Wallet Basics',
    description: 'Learn about wallet security and usage',
    estimatedTime: 12,
    isRequired: false,
    prerequisites: ['voting-tutorial'],
    content: {} as any
  },
  'platform-tour': {
    step: 'platform-tour',
    title: 'Platform Tour',
    description: 'Explore key platform features',
    estimatedTime: 8,
    isRequired: true,
    prerequisites: ['wallet-education'],
    content: {} as any
  },
  'community-guidance': {
    step: 'community-guidance',
    title: 'Find Your Community',
    description: 'Discover and join relevant communities',
    estimatedTime: 7,
    isRequired: true,
    prerequisites: ['platform-tour'],
    content: {} as any
  },
  'first-vote': {
    step: 'first-vote',
    title: 'Your First Vote',
    description: 'Participate in your first voting campaign',
    estimatedTime: 10,
    isRequired: true,
    prerequisites: ['community-guidance'],
    content: {} as any
  },
  completion: {
    step: 'completion',
    title: 'Onboarding Complete',
    description: 'Congratulations! You\'re ready to participate',
    estimatedTime: 2,
    isRequired: true,
    prerequisites: ['first-vote'],
    content: {} as any
  }
};

export const ONBOARDING_CONFIG = {
  maxTimePerStep: 30, // minutes
  autoSaveInterval: 30, // seconds
  sessionTimeout: 60, // minutes
  maxRetries: 3,
  enableAnalytics: true,
  enableGamification: true,
  defaultTheme: 'light' as const,
  supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
  accessibilityFeatures: {
    screenReader: true,
    highContrast: true,
    keyboardNavigation: true,
    reducedMotion: true
  }
};

// Error Codes
export const ONBOARDING_ERROR_CODES = {
  INVALID_STEP: 'invalid_step',
  PREREQUISITES_NOT_MET: 'prerequisites_not_met',
  SESSION_EXPIRED: 'session_expired',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  VALIDATION_FAILED: 'validation_failed',
  QUIZ_FAILED: 'quiz_failed',
  TUTORIAL_ERROR: 'tutorial_error',
  SAVE_FAILED: 'save_failed'
} as const;

export default {
  ONBOARDING_STEPS,
  ONBOARDING_CONFIG,
  ONBOARDING_ERROR_CODES
}; 