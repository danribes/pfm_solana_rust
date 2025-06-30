/**
 * Task 4.5.3: Public User Onboarding & Registration Flow
 * Onboarding Service - User Journey Management
 * 
 * Manages the step-by-step onboarding process including progress tracking,
 * step navigation, data persistence, and completion management.
 */

import {
  OnboardingStep,
  OnboardingProgress,
  OnboardingStepData,
  OnboardingResponse,
  OnboardingConfiguration,
  RegistrationError,
  CommunityRecommendation,
  EducationModule,
  WalletConnection,
  UserProfile
} from '../types/registration';

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

interface OnboardingConfig {
  apiBaseUrl: string;
  endpoints: {
    getProgress: string;
    saveProgress: string;
    completeStep: string;
    complete: string;
    getRecommendations: string;
    getEducationModules: string;
  };
  steps: {
    [key in OnboardingStep]: {
      required: boolean;
      estimatedDuration: number;
      allowSkip: boolean;
    };
  };
  autoSave: boolean;
  saveInterval: number;
}

const defaultConfig: OnboardingConfig = {
  apiBaseUrl: (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost:3000',
  endpoints: {
    getProgress: '/api/onboarding/progress',
    saveProgress: '/api/onboarding/save',
    completeStep: '/api/onboarding/complete-step',
    complete: '/api/onboarding/complete',
    getRecommendations: '/api/onboarding/recommendations',
    getEducationModules: '/api/onboarding/education-modules'
  },
  steps: {
    [OnboardingStep.WELCOME]: {
      required: true,
      estimatedDuration: 2,
      allowSkip: false
    },
    [OnboardingStep.WALLET_SETUP]: {
      required: true,
      estimatedDuration: 8,
      allowSkip: false
    },
    [OnboardingStep.EDUCATION]: {
      required: false,
      estimatedDuration: 15,
      allowSkip: true
    },
    [OnboardingStep.PROFILE]: {
      required: false,
      estimatedDuration: 5,
      allowSkip: true
    },
    [OnboardingStep.COMMUNITY]: {
      required: false,
      estimatedDuration: 3,
      allowSkip: true
    },
    [OnboardingStep.COMPLETION]: {
      required: true,
      estimatedDuration: 1,
      allowSkip: false
    }
  },
  autoSave: true,
  saveInterval: 30000 // 30 seconds
};

// ============================================================================
// ONBOARDING SERVICE CLASS
// ============================================================================

export class OnboardingService {
  private config: OnboardingConfig;
  private progressCache: Map<string, OnboardingProgress>;
  private stepDataCache: Map<string, any>;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  constructor(config?: Partial<OnboardingConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.progressCache = new Map();
    this.stepDataCache = new Map();
  }

  // ============================================================================
  // PROGRESS MANAGEMENT
  // ============================================================================

  public async getProgress(userId: string): Promise<OnboardingProgress> {
    // Check cache first
    const cacheKey = `progress-${userId}`;
    if (this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey)!;
    }

    try {
      const response = await this.makeRequest('GET', `${this.config.endpoints.getProgress}/${userId}`);
      const progress: OnboardingProgress = response.progress;
      
      // Cache the result
      this.progressCache.set(cacheKey, progress);
      
      return progress;
    } catch (error) {
      // If no progress exists, create initial progress
      return this.createInitialProgress(userId);
    }
  }

  public async saveProgress(userId: string, progress: Partial<OnboardingProgress>): Promise<void> {
    try {
      const currentProgress = await this.getProgress(userId);
      const updatedProgress = { ...currentProgress, ...progress, lastActiveAt: new Date() };
      
      await this.makeRequest('POST', this.config.endpoints.saveProgress, {
        userId,
        progress: updatedProgress
      });
      
      // Update cache
      const cacheKey = `progress-${userId}`;
      this.progressCache.set(cacheKey, updatedProgress);
      
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      throw this.createOnboardingError('Failed to save progress');
    }
  }

  public async completeStep(userId: string, step: OnboardingStep): Promise<void> {
    try {
      const progress = await this.getProgress(userId);
      
      if (!progress.completedSteps.includes(step)) {
        progress.completedSteps.push(step);
        progress.progressPercentage = this.calculateProgressPercentage(progress.completedSteps);
        progress.estimatedTimeRemaining = this.calculateTimeRemaining(progress.completedSteps);
        
        await this.makeRequest('POST', this.config.endpoints.completeStep, {
          userId,
          step,
          progress
        });
        
        // Update cache
        const cacheKey = `progress-${userId}`;
        this.progressCache.set(cacheKey, progress);
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw this.createOnboardingError('Failed to complete step');
    }
  }

  public async completeOnboarding(userId: string): Promise<void> {
    try {
      const progress = await this.getProgress(userId);
      progress.completedAt = new Date();
      
      await this.makeRequest('POST', this.config.endpoints.complete, {
        userId,
        progress
      });
      
      // Update cache
      const cacheKey = `progress-${userId}`;
      this.progressCache.set(cacheKey, progress);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw this.createOnboardingError('Failed to complete onboarding');
    }
  }

  // ============================================================================
  // STEP NAVIGATION
  // ============================================================================

  public getStepOrder(): OnboardingStep[] {
    return [
      OnboardingStep.WELCOME,
      OnboardingStep.WALLET_SETUP,
      OnboardingStep.EDUCATION,
      OnboardingStep.PROFILE,
      OnboardingStep.COMMUNITY,
      OnboardingStep.COMPLETION
    ];
  }

  public getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
    const stepOrder = this.getStepOrder();
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
      return null;
    }
    
    return stepOrder[currentIndex + 1];
  }

  public getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
    const stepOrder = this.getStepOrder();
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex <= 0) {
      return null;
    }
    
    return stepOrder[currentIndex - 1];
  }

  public canNavigateToStep(userId: string, targetStep: OnboardingStep, progress: OnboardingProgress): boolean {
    const stepOrder = this.getStepOrder();
    const targetIndex = stepOrder.indexOf(targetStep);
    
    // Always allow going back to completed steps
    if (progress.completedSteps.includes(targetStep)) {
      return true;
    }
    
    // Check if prerequisites are met
    for (let i = 0; i < targetIndex; i++) {
      const prerequisiteStep = stepOrder[i];
      const stepConfig = this.config.steps[prerequisiteStep];
      
      if (stepConfig.required && !progress.completedSteps.includes(prerequisiteStep)) {
        return false;
      }
    }
    
    return true;
  }

  // ============================================================================
  // STEP DATA MANAGEMENT
  // ============================================================================

  public getStepData(userId: string, step: OnboardingStep): OnboardingStepData {
    const stepConfig = this.config.steps[step];
    
    return {
      step,
      title: this.getStepTitle(step),
      description: this.getStepDescription(step),
      estimatedDuration: stepConfig.estimatedDuration,
      required: stepConfig.required,
      prerequisites: this.getStepPrerequisites(step),
      content: null, // Will be populated by specific step components
      validation: undefined
    };
  }

  public async saveStepData(userId: string, step: OnboardingStep, data: any): Promise<void> {
    const cacheKey = `${userId}-${step}`;
    this.stepDataCache.set(cacheKey, data);
    
    // Auto-save if enabled
    if (this.config.autoSave) {
      this.scheduleAutoSave(userId);
    }
  }

  public getStepDataFromCache(userId: string, step: OnboardingStep): any {
    const cacheKey = `${userId}-${step}`;
    return this.stepDataCache.get(cacheKey) || {};
  }

  // ============================================================================
  // COMMUNITY RECOMMENDATIONS
  // ============================================================================

  public async getCommunityRecommendations(userId: string): Promise<CommunityRecommendation[]> {
    try {
      const response = await this.makeRequest('GET', `${this.config.endpoints.getRecommendations}/${userId}`);
      return response.recommendations || [];
    } catch (error) {
      console.error('Error fetching community recommendations:', error);
      return this.getDefaultCommunityRecommendations();
    }
  }

  // ============================================================================
  // EDUCATION MODULES
  // ============================================================================

  public async getEducationModules(userId: string): Promise<EducationModule[]> {
    try {
      const response = await this.makeRequest('GET', `${this.config.endpoints.getEducationModules}/${userId}`);
      return response.modules || [];
    } catch (error) {
      console.error('Error fetching education modules:', error);
      return this.getDefaultEducationModules();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private createInitialProgress(userId: string): OnboardingProgress {
    return {
      userId,
      currentStep: OnboardingStep.WELCOME,
      completedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
      skippedSteps: [],
      totalSteps: this.getStepOrder().length,
      progressPercentage: 0,
      estimatedTimeRemaining: this.calculateTotalEstimatedTime()
    };
  }

  private calculateProgressPercentage(completedSteps: OnboardingStep[]): number {
    const totalSteps = this.getStepOrder().length;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }

  private calculateTimeRemaining(completedSteps: OnboardingStep[]): number {
    const stepOrder = this.getStepOrder();
    let remainingTime = 0;
    
    for (const step of stepOrder) {
      if (!completedSteps.includes(step)) {
        remainingTime += this.config.steps[step].estimatedDuration;
      }
    }
    
    return remainingTime;
  }

  private calculateTotalEstimatedTime(): number {
    return this.getStepOrder().reduce((total, step) => {
      return total + this.config.steps[step].estimatedDuration;
    }, 0);
  }

  private getStepTitle(step: OnboardingStep): string {
    const titles: Record<OnboardingStep, string> = {
      [OnboardingStep.WELCOME]: 'Welcome to the Platform',
      [OnboardingStep.WALLET_SETUP]: 'Connect Your Wallet',
      [OnboardingStep.EDUCATION]: 'Learn the Basics',
      [OnboardingStep.PROFILE]: 'Set Up Your Profile',
      [OnboardingStep.COMMUNITY]: 'Join Communities',
      [OnboardingStep.COMPLETION]: 'All Set!'
    };
    return titles[step];
  }

  private getStepDescription(step: OnboardingStep): string {
    const descriptions: Record<OnboardingStep, string> = {
      [OnboardingStep.WELCOME]: 'Get started with our platform and learn what makes us special',
      [OnboardingStep.WALLET_SETUP]: 'Securely connect your wallet to participate in governance',
      [OnboardingStep.EDUCATION]: 'Understand blockchain governance and how voting works',
      [OnboardingStep.PROFILE]: 'Customize your profile and privacy settings',
      [OnboardingStep.COMMUNITY]: 'Discover and join communities that match your interests',
      [OnboardingStep.COMPLETION]: 'Congratulations! You\'re ready to start participating'
    };
    return descriptions[step];
  }

  private getStepPrerequisites(step: OnboardingStep): OnboardingStep[] {
    const prerequisites: Record<OnboardingStep, OnboardingStep[]> = {
      [OnboardingStep.WELCOME]: [],
      [OnboardingStep.WALLET_SETUP]: [OnboardingStep.WELCOME],
      [OnboardingStep.EDUCATION]: [OnboardingStep.WALLET_SETUP],
      [OnboardingStep.PROFILE]: [OnboardingStep.WALLET_SETUP],
      [OnboardingStep.COMMUNITY]: [OnboardingStep.WALLET_SETUP],
      [OnboardingStep.COMPLETION]: [OnboardingStep.WALLET_SETUP]
    };
    return prerequisites[step];
  }

  private getDefaultCommunityRecommendations(): CommunityRecommendation[] {
    return [
      {
        community: {
          id: 'default-tech',
          name: 'Technology Community',
          description: 'Discuss the latest in blockchain and tech innovation',
          category: 'Technology',
          memberCount: 1250,
          activityLevel: 'high',
          icon: '/icons/tech-community.svg',
          isPublic: true
        },
        score: 95,
        reasons: ['Matches your interests', 'High activity level', 'Beginner friendly'],
        matchingInterests: ['blockchain', 'technology'],
        estimatedEngagement: 85
      }
    ];
  }

  private getDefaultEducationModules(): EducationModule[] {
    return [
      {
        id: 'blockchain-basics',
        title: 'Blockchain Fundamentals',
        description: 'Learn the core concepts of blockchain technology',
        category: 'blockchain',
        difficulty: 'beginner',
        estimatedDuration: 10,
        prerequisites: [],
        content: []
      }
    ];
  }

  private scheduleAutoSave(userId: string): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave(userId);
    }, this.config.saveInterval);
  }

  private async performAutoSave(userId: string): Promise<void> {
    try {
      // Save any cached step data
      for (const [cacheKey, data] of this.stepDataCache.entries()) {
        if (cacheKey.startsWith(userId)) {
          await this.makeRequest('POST', '/api/onboarding/save-step-data', {
            userId,
            stepData: { [cacheKey]: data }
          });
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private createOnboardingError(message: string): RegistrationError {
    return {
      type: 'server',
      message,
      recoverable: true,
      retryable: true,
      suggestions: ['Please try again or contact support if the problem persists']
    };
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  public clearCache(userId?: string): void {
    if (userId) {
      // Clear specific user's cache
      const keysToDelete = Array.from(this.progressCache.keys()).filter(key => key.includes(userId));
      keysToDelete.forEach(key => this.progressCache.delete(key));
      
      const stepKeysToDelete = Array.from(this.stepDataCache.keys()).filter(key => key.startsWith(userId));
      stepKeysToDelete.forEach(key => this.stepDataCache.delete(key));
    } else {
      // Clear all cache
      this.progressCache.clear();
      this.stepDataCache.clear();
    }
  }

  public updateConfig(newConfig: Partial<OnboardingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public isStepRequired(step: OnboardingStep): boolean {
    return this.config.steps[step].required;
  }

  public canSkipStep(step: OnboardingStep): boolean {
    return this.config.steps[step].allowSkip;
  }

  public getEstimatedDuration(step: OnboardingStep): number {
    return this.config.steps[step].estimatedDuration;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const onboardingService = new OnboardingService();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const getOnboardingProgress = (userId: string) => onboardingService.getProgress(userId);
export const saveOnboardingProgress = (userId: string, progress: Partial<OnboardingProgress>) => 
  onboardingService.saveProgress(userId, progress);
export const completeOnboardingStep = (userId: string, step: OnboardingStep) => 
  onboardingService.completeStep(userId, step);
export const completeOnboarding = (userId: string) => onboardingService.completeOnboarding(userId);
export const getCommunityRecommendations = (userId: string) => 
  onboardingService.getCommunityRecommendations(userId);
export const getEducationModules = (userId: string) => onboardingService.getEducationModules(userId); 