// Task 7.2.1: User Onboarding Flow & Tutorial System
// Onboarding service for API communication and state management

import {
  OnboardingState,
  OnboardingStepData,
  OnboardingStep,
  UserOnboardingProfile,
  OnboardingGoal,
  OnboardingResponse,
  OnboardingError,
  TutorialContent,
  TutorialProgress,
  TutorialProgressResponse,
  EducationContent,
  CommunityContent,
  Achievement,
  Badge,
  Quiz,
  QuizResult,
  QuizAnswer,
  PracticeActivity,
  OnboardingAnalytics,
  AnalyticsEvent,
  OnboardingMetrics,
  UserFeedback,
  ONBOARDING_STEPS,
  ONBOARDING_CONFIG,
  ONBOARDING_ERROR_CODES
} from '@/types/onboarding';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 15000; // 15 seconds for onboarding operations

// Onboarding API client
class OnboardingService {
  private baseURL: string;
  private timeout: number;
  private sessionId: string;
  private userId: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: OnboardingError = {
        code: data.code || ONBOARDING_ERROR_CODES.SERVER_ERROR,
        message: data.message || 'An error occurred',
        field: data.field,
        retryable: response.status >= 500
      };
      throw error;
    }

    return data;
  }

  // Set current user
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Get onboarding state
  async getOnboardingState(userId: string): Promise<OnboardingState> {
    const url = `${this.baseURL}/api/onboarding/${userId}/state`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<OnboardingResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      // Return default state if no existing onboarding found
      return this.createDefaultOnboardingState(userId);
    } catch (error) {
      console.warn('Failed to get onboarding state, using default:', error);
      return this.createDefaultOnboardingState(userId);
    }
  }

  // Start onboarding
  async startOnboarding(userId: string, profile: UserOnboardingProfile): Promise<OnboardingState> {
    const url = `${this.baseURL}/api/onboarding/${userId}/start`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          profile,
          sessionId: this.sessionId
        }),
      });

      const result = await this.handleResponse<OnboardingResponse>(response);
      
      if (result.success && result.data) {
        this.trackEvent('step_start', 'welcome', { profile });
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to start onboarding');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      throw this.handleError(error);
    }
  }

  // Complete onboarding step
  async completeStep(userId: string, step: OnboardingStep, data?: any): Promise<OnboardingState> {
    const url = `${this.baseURL}/api/onboarding/${userId}/step/${step}/complete`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          stepData: data,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<OnboardingResponse>(response);
      
      if (result.success && result.data) {
        this.trackEvent('step_complete', step, { data });
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to complete step');
    } catch (error) {
      console.error('Failed to complete step:', error);
      throw this.handleError(error);
    }
  }

  // Skip onboarding step
  async skipStep(userId: string, step: OnboardingStep, reason?: string): Promise<OnboardingState> {
    const url = `${this.baseURL}/api/onboarding/${userId}/step/${step}/skip`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          reason,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<OnboardingResponse>(response);
      
      if (result.success && result.data) {
        this.trackEvent('step_skip', step, { reason });
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to skip step');
    } catch (error) {
      console.error('Failed to skip step:', error);
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserOnboardingProfile>): Promise<void> {
    const url = `${this.baseURL}/api/onboarding/${userId}/profile`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw this.handleError(error);
    }
  }

  // Get step content
  async getStepContent(step: OnboardingStep, userId: string): Promise<OnboardingStepData> {
    const url = `${this.baseURL}/api/onboarding/content/${step}?userId=${userId}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: OnboardingStepData }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      // Fallback to static content
      return this.getStaticStepContent(step);
    } catch (error) {
      console.warn('Failed to get step content, using static:', error);
      return this.getStaticStepContent(step);
    }
  }

  // Get education content
  async getEducationContent(type: 'blockchain' | 'voting' | 'wallet' | 'security' | 'community'): Promise<EducationContent> {
    const url = `${this.baseURL}/api/onboarding/education/${type}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: EducationContent }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Education content not found');
    } catch (error) {
      console.warn('Failed to get education content, using mock:', error);
      return this.getMockEducationContent(type);
    }
  }

  // Get tutorial content
  async getTutorialContent(tutorialId: string): Promise<TutorialContent> {
    const url = `${this.baseURL}/api/onboarding/tutorials/${tutorialId}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: TutorialContent }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Tutorial content not found');
    } catch (error) {
      console.warn('Failed to get tutorial content, using mock:', error);
      return this.getMockTutorialContent(tutorialId);
    }
  }

  // Get community recommendations
  async getCommunityRecommendations(userId: string): Promise<CommunityContent> {
    const url = `${this.baseURL}/api/onboarding/${userId}/communities/recommendations`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: CommunityContent }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Community recommendations not found');
    } catch (error) {
      console.warn('Failed to get community recommendations, using mock:', error);
      return this.getMockCommunityContent();
    }
  }

  // Quiz operations
  async submitQuizAnswers(quizId: string, userId: string, answers: QuizAnswer[]): Promise<QuizResult> {
    const url = `${this.baseURL}/api/onboarding/quiz/${quizId}/submit`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          answers,
          sessionId: this.sessionId
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: QuizResult }>(response);
      
      if (result.success && result.data) {
        this.trackEvent('quiz_attempt', 'quiz', {
          quizId,
          score: result.data.score,
          passed: result.data.passed
        });
        return result.data;
      }
      
      throw new Error('Failed to submit quiz');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw this.handleError(error);
    }
  }

  // Practice activity completion
  async completePracticeActivity(activityId: string, userId: string, result: any): Promise<void> {
    const url = `${this.baseURL}/api/onboarding/practice/${activityId}/complete`;
    
    try {
      await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          result,
          sessionId: this.sessionId
        }),
      });

      this.trackEvent('step_complete', 'practice', { activityId, result });
    } catch (error) {
      console.error('Failed to complete practice activity:', error);
      throw this.handleError(error);
    }
  }

  // Get achievements and badges
  async getAchievements(userId: string): Promise<{ achievements: Achievement[]; badges: Badge[] }> {
    const url = `${this.baseURL}/api/onboarding/${userId}/achievements`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: { achievements: Achievement[]; badges: Badge[] } }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return { achievements: [], badges: [] };
    } catch (error) {
      console.warn('Failed to get achievements:', error);
      return { achievements: [], badges: [] };
    }
  }

  // Analytics and tracking
  async trackEvent(type: AnalyticsEvent['type'], step: OnboardingStep, data?: any): Promise<void> {
    const event: AnalyticsEvent = {
      type,
      timestamp: new Date().toISOString(),
      step,
      data,
      duration: data?.duration
    };

    // Track locally for immediate use
    this.trackLocalEvent(event);

    // Send to server
    try {
      const url = `${this.baseURL}/api/onboarding/analytics/track`;
      await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          sessionId: this.sessionId,
          event
        }),
      });
    } catch (error) {
      console.warn('Failed to track event on server:', error);
    }
  }

  // Submit user feedback
  async submitFeedback(userId: string, feedback: UserFeedback): Promise<void> {
    const url = `${this.baseURL}/api/onboarding/${userId}/feedback`;
    
    try {
      await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          ...feedback,
          sessionId: this.sessionId
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw this.handleError(error);
    }
  }

  // Get onboarding metrics
  async getMetrics(userId: string): Promise<OnboardingMetrics> {
    const url = `${this.baseURL}/api/onboarding/${userId}/metrics`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: OnboardingMetrics }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return this.createDefaultMetrics();
    } catch (error) {
      console.warn('Failed to get metrics:', error);
      return this.createDefaultMetrics();
    }
  }

  // Tutorial progress operations
  async getTutorialProgress(userId: string, tutorialId: string): Promise<TutorialProgress | null> {
    const url = `${this.baseURL}/api/onboarding/${userId}/tutorials/${tutorialId}/progress`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<TutorialProgressResponse>(response);
      
      return result.data || null;
    } catch (error) {
      console.warn('Failed to get tutorial progress:', error);
      return null;
    }
  }

  async updateTutorialProgress(userId: string, tutorialId: string, progress: Partial<TutorialProgress>): Promise<void> {
    const url = `${this.baseURL}/api/onboarding/${userId}/tutorials/${tutorialId}/progress`;
    
    try {
      await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(progress),
      });
    } catch (error) {
      console.error('Failed to update tutorial progress:', error);
      throw this.handleError(error);
    }
  }

  // Helper methods
  private createDefaultOnboardingState(userId: string): OnboardingState {
    return {
      currentStep: 'welcome',
      completedSteps: [],
      profile: this.createDefaultProfile(userId),
      progress: 0,
      timeSpent: 0,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCompleted: false,
      hasSkipped: false,
      achievements: [],
      badges: []
    };
  }

  private createDefaultProfile(userId: string): UserOnboardingProfile {
    return {
      userId,
      experienceLevel: 'beginner',
      interests: [],
      goals: [],
      skipAdvanced: false,
      preferredLearningStyle: 'interactive',
      estimatedTimeAvailable: 30
    };
  }

  private createDefaultMetrics(): OnboardingMetrics {
    return {
      totalTimeSpent: 0,
      stepsCompleted: 0,
      stepsSkipped: 0,
      quizzesPassed: 0,
      quizzesFailed: 0,
      helpRequestsCount: 0,
      errorsEncountered: 0,
      completionRate: 0,
      engagementScore: 0
    };
  }

  private getStaticStepContent(step: OnboardingStep): OnboardingStepData {
    const staticStep = ONBOARDING_STEPS[step];
    return {
      ...staticStep,
      content: this.getDefaultContentForStep(step)
    };
  }

  private getDefaultContentForStep(step: OnboardingStep): any {
    switch (step) {
      case 'blockchain-education':
        return this.getMockEducationContent('blockchain');
      case 'voting-tutorial':
        return this.getMockEducationContent('voting');
      case 'wallet-education':
        return this.getMockEducationContent('wallet');
      case 'community-guidance':
        return this.getMockCommunityContent();
      default:
        return {};
    }
  }

  private getMockEducationContent(type: 'blockchain' | 'voting' | 'wallet' | 'security' | 'community'): EducationContent {
    const contentMap = {
      blockchain: {
        type: 'blockchain' as const,
        title: 'Understanding Blockchain Technology',
        description: 'Learn the fundamentals of blockchain and how it powers our platform',
        sections: [
          {
            id: 'intro',
            title: 'What is Blockchain?',
            content: 'Blockchain is a decentralized, immutable ledger that records transactions across multiple computers.',
            illustrations: [],
            keyPoints: [
              'Decentralized network',
              'Immutable records',
              'Transparent transactions',
              'Enhanced security'
            ],
            examples: [],
            relatedConcepts: ['cryptography', 'consensus', 'nodes']
          }
        ],
        difficulty: 'beginner' as const,
        estimatedReadTime: 10
      },
      voting: {
        type: 'voting' as const,
        title: 'Blockchain Voting Mechanisms',
        description: 'Understand how voting works on our platform',
        sections: [
          {
            id: 'voting-basics',
            title: 'How Voting Works',
            content: 'Our platform uses secure blockchain voting to ensure transparency and immutability.',
            illustrations: [],
            keyPoints: [
              'One person, one vote',
              'Transparent results',
              'Immutable records',
              'Privacy protection'
            ],
            examples: [],
            relatedConcepts: ['governance', 'democracy', 'consensus']
          }
        ],
        difficulty: 'beginner' as const,
        estimatedReadTime: 8
      },
      wallet: {
        type: 'wallet' as const,
        title: 'Digital Wallet Basics',
        description: 'Learn how to use and secure your digital wallet',
        sections: [
          {
            id: 'wallet-intro',
            title: 'What is a Digital Wallet?',
            content: 'A digital wallet stores your cryptocurrency and enables interaction with blockchain applications.',
            illustrations: [],
            keyPoints: [
              'Secure storage',
              'Private keys',
              'Transaction signing',
              'Asset management'
            ],
            examples: [],
            relatedConcepts: ['private keys', 'public keys', 'signatures']
          }
        ],
        difficulty: 'beginner' as const,
        estimatedReadTime: 12
      },
      security: {
        type: 'security' as const,
        title: 'Security Best Practices',
        description: 'Keep your assets and identity safe',
        sections: [
          {
            id: 'security-basics',
            title: 'Essential Security Practices',
            content: 'Learn fundamental security practices for blockchain interactions.',
            illustrations: [],
            keyPoints: [
              'Strong passwords',
              'Two-factor authentication',
              'Phishing awareness',
              'Private key protection'
            ],
            examples: [],
            relatedConcepts: ['2FA', 'phishing', 'social engineering']
          }
        ],
        difficulty: 'beginner' as const,
        estimatedReadTime: 15
      },
      community: {
        type: 'community' as const,
        title: 'Community Participation',
        description: 'Learn how to engage effectively with communities',
        sections: [
          {
            id: 'community-basics',
            title: 'Getting Started in Communities',
            content: 'Discover how to find, join, and participate in communities that match your interests.',
            illustrations: [],
            keyPoints: [
              'Finding communities',
              'Joining processes',
              'Participation etiquette',
              'Building reputation'
            ],
            examples: [],
            relatedConcepts: ['governance', 'reputation', 'consensus']
          }
        ],
        difficulty: 'beginner' as const,
        estimatedReadTime: 10
      }
    };

    return contentMap[type];
  }

  private getMockTutorialContent(tutorialId: string): TutorialContent {
    return {
      id: tutorialId,
      title: 'Platform Tutorial',
      description: 'Learn how to use the platform effectively',
      category: 'platform_basics',
      difficulty: 'beginner',
      format: 'interactive_tour',
      estimatedTime: 15,
      prerequisites: [],
      learningObjectives: [
        'Navigate the platform',
        'Understand key features',
        'Complete basic actions'
      ],
      content: [
        {
          id: 'step-1',
          title: 'Welcome to the Platform',
          content: 'This tutorial will guide you through the main features of our platform.',
          checkpoint: true
        }
      ]
    };
  }

  private getMockCommunityContent(): CommunityContent {
    return {
      recommendedCommunities: [
        {
          id: 'community-1',
          name: 'Financial Innovation DAO',
          description: 'Community focused on innovative financial solutions',
          category: 'Finance',
          memberCount: 1250,
          activityLevel: 'high',
          matchReason: 'Matches your interest in financial innovation',
          matchScore: 95,
          joinDifficulty: 'easy',
          expectedTimeCommitment: '2-4 hours per week'
        }
      ],
      joinGuidance: {
        steps: [
          {
            id: 'step-1',
            title: 'Review Community',
            description: 'Read the community description and guidelines',
            action: 'Click on community to view details',
            expectedResult: 'Understanding of community purpose and rules',
            troubleshooting: ['If page doesn\'t load, refresh browser']
          }
        ],
        tips: ['Read community guidelines carefully'],
        commonMistakes: ['Joining without reading guidelines'],
        expectedTimeline: '5-10 minutes for approval'
      },
      etiquetteGuide: {
        principles: [
          {
            title: 'Respectful Communication',
            description: 'Always communicate respectfully with other members',
            importance: 'Essential for healthy community dynamics',
            examples: ['Use polite language', 'Listen to others', 'Avoid personal attacks']
          }
        ],
        doAndDonts: [
          {
            category: 'Communication',
            dos: ['Be respectful', 'Stay on topic', 'Use constructive criticism'],
            donts: ['Use offensive language', 'Make personal attacks', 'Spam'],
            reasoning: 'Maintains a positive community environment'
          }
        ],
        examples: [
          {
            scenario: 'Disagreeing with a proposal',
            goodResponse: 'I understand the intent, but I have concerns about implementation...',
            badResponse: 'This is a terrible idea and won\'t work.',
            explanation: 'The good response is constructive and specific'
          }
        ]
      },
      firstVoteGuidance: {
        preparation: [
          'Read the proposal thoroughly',
          'Understand the implications',
          'Consider different perspectives'
        ],
        votingProcess: [
          'Connect your wallet',
          'Review your vote choice',
          'Submit your vote',
          'Verify transaction'
        ],
        afterVoting: [
          'Monitor results',
          'Participate in discussions',
          'Learn from the outcome'
        ],
        commonConcerns: [
          {
            question: 'Can I change my vote?',
            answer: 'Votes are final once submitted to ensure integrity',
            category: 'procedural'
          }
        ]
      }
    };
  }

  private trackLocalEvent(event: AnalyticsEvent): void {
    // Store locally for immediate analytics
    if (typeof window !== 'undefined') {
      const localEvents = JSON.parse(localStorage.getItem('onboarding-events') || '[]');
      localEvents.push(event);
      localStorage.setItem('onboarding-events', JSON.stringify(localEvents.slice(-100))); // Keep last 100 events
    }
  }

  private handleError(error: any): OnboardingError {
    if (error.code && error.message) {
      return error as OnboardingError;
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: ONBOARDING_ERROR_CODES.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }
    
    // Generic server error
    return {
      code: ONBOARDING_ERROR_CODES.SERVER_ERROR,
      message: error.message || 'An unexpected error occurred',
      retryable: true
    };
  }
}

// Create singleton instance
const onboardingService = new OnboardingService();

// Export individual functions for easier use
export const getOnboardingState = (userId: string) => 
  onboardingService.getOnboardingState(userId);

export const startOnboarding = (userId: string, profile: UserOnboardingProfile) =>
  onboardingService.startOnboarding(userId, profile);

export const completeStep = (userId: string, step: OnboardingStep, data?: any) =>
  onboardingService.completeStep(userId, step, data);

export const skipStep = (userId: string, step: OnboardingStep, reason?: string) =>
  onboardingService.skipStep(userId, step, reason);

export const updateProfile = (userId: string, updates: Partial<UserOnboardingProfile>) =>
  onboardingService.updateProfile(userId, updates);

export const getStepContent = (step: OnboardingStep, userId: string) =>
  onboardingService.getStepContent(step, userId);

export const getEducationContent = (type: 'blockchain' | 'voting' | 'wallet' | 'security' | 'community') =>
  onboardingService.getEducationContent(type);

export const getTutorialContent = (tutorialId: string) =>
  onboardingService.getTutorialContent(tutorialId);

export const getCommunityRecommendations = (userId: string) =>
  onboardingService.getCommunityRecommendations(userId);

export const submitQuizAnswers = (quizId: string, userId: string, answers: QuizAnswer[]) =>
  onboardingService.submitQuizAnswers(quizId, userId, answers);

export const completePracticeActivity = (activityId: string, userId: string, result: any) =>
  onboardingService.completePracticeActivity(activityId, userId, result);

export const getAchievements = (userId: string) =>
  onboardingService.getAchievements(userId);

export const trackEvent = (type: AnalyticsEvent['type'], step: OnboardingStep, data?: any) =>
  onboardingService.trackEvent(type, step, data);

export const submitFeedback = (userId: string, feedback: UserFeedback) =>
  onboardingService.submitFeedback(userId, feedback);

export const getMetrics = (userId: string) =>
  onboardingService.getMetrics(userId);

export const getTutorialProgress = (userId: string, tutorialId: string) =>
  onboardingService.getTutorialProgress(userId, tutorialId);

export const updateTutorialProgress = (userId: string, tutorialId: string, progress: Partial<TutorialProgress>) =>
  onboardingService.updateTutorialProgress(userId, tutorialId, progress);

// Utility functions
export const calculateProgress = (completedSteps: OnboardingStep[]): number => {
  const totalSteps = Object.keys(ONBOARDING_STEPS).length;
  return Math.round((completedSteps.length / totalSteps) * 100);
};

export const getNextStep = (currentStep: OnboardingStep, completedSteps: OnboardingStep[]): OnboardingStep | null => {
  const allSteps = Object.keys(ONBOARDING_STEPS) as OnboardingStep[];
  const currentIndex = allSteps.indexOf(currentStep);
  
  if (currentIndex < allSteps.length - 1) {
    return allSteps[currentIndex + 1];
  }
  
  return null;
};

export const canAccessStep = (step: OnboardingStep, completedSteps: OnboardingStep[]): boolean => {
  const stepData = ONBOARDING_STEPS[step];
  if (!stepData) return false;
  
  return stepData.prerequisites.every(prereq => completedSteps.includes(prereq));
};

export const estimateTimeRemaining = (
  currentStep: OnboardingStep,
  completedSteps: OnboardingStep[],
  profile: UserOnboardingProfile
): number => {
  const allSteps = Object.keys(ONBOARDING_STEPS) as OnboardingStep[];
  const currentIndex = allSteps.indexOf(currentStep);
  const remainingSteps = allSteps.slice(currentIndex);
  
  let totalTime = 0;
  for (const step of remainingSteps) {
    const stepData = ONBOARDING_STEPS[step];
    if (stepData && !completedSteps.includes(step)) {
      // Adjust time based on experience level
      let adjustedTime = stepData.estimatedTime;
      if (profile.experienceLevel === 'advanced') {
        adjustedTime *= 0.7;
      } else if (profile.experienceLevel === 'intermediate') {
        adjustedTime *= 0.85;
      }
      totalTime += adjustedTime;
    }
  }
  
  return Math.round(totalTime);
};

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Export service instance
export default onboardingService; 