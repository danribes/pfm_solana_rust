// Task 7.2.1: User Onboarding Flow & Tutorial System
// React hooks for onboarding state management and analytics

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OnboardingState,
  OnboardingStep,
  UserOnboardingProfile,
  OnboardingGoal,
  OnboardingError,
  UseOnboardingResult,
  AnalyticsEvent,
  OnboardingMetrics,
  UserFeedback,
  Achievement,
  Badge,
  ONBOARDING_STEPS,
  ONBOARDING_CONFIG
} from '@/types/onboarding';

import {
  getOnboardingState,
  startOnboarding,
  completeStep,
  skipStep,
  updateProfile,
  getStepContent,
  getAchievements,
  trackEvent,
  submitFeedback,
  getMetrics,
  calculateProgress,
  getNextStep,
  canAccessStep,
  estimateTimeRemaining
} from '@/services/onboarding';

// Main onboarding hook
export function useOnboarding(userId: string): UseOnboardingResult {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Refs for tracking
  const stepStartTimes = useRef<{ [key: string]: number }>({});
  const sessionStartTime = useRef<number>(Date.now());

  // Initialize onboarding state
  useEffect(() => {
    if (userId) {
      loadOnboardingState();
    }
  }, [userId]);

  const loadOnboardingState = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const onboardingState = await getOnboardingState(userId);
      setState(onboardingState);

      // Load achievements and badges
      const { achievements: userAchievements, badges: userBadges } = await getAchievements(userId);
      setAchievements(userAchievements);
      setBadges(userBadges);

      // Track session start
      trackEvent('step_start', onboardingState.currentStep, {
        sessionStart: true,
        progress: onboardingState.progress
      });

    } catch (err) {
      const onboardingError = err as OnboardingError;
      setError(onboardingError);
      console.error('Failed to load onboarding state:', onboardingError);
    } finally {
      setIsLoading(false);
    }
  };

  // Start onboarding with profile
  const startOnboardingFlow = useCallback(async (profile: UserOnboardingProfile): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    setIsLoading(true);
    setError(null);

    try {
      const newState = await startOnboarding(userId, profile);
      setState(newState);
      stepStartTimes.current[newState.currentStep] = Date.now();

      trackEvent('step_start', newState.currentStep, {
        profile,
        sessionId: sessionStartTime.current
      });
    } catch (err) {
      const onboardingError = err as OnboardingError;
      setError(onboardingError);
      throw onboardingError;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Complete current step
  const completeCurrentStep = useCallback(async (stepData?: any): Promise<void> => {
    if (!userId || !state) throw new Error('Invalid state');

    setIsLoading(true);
    setError(null);

    const startTime = stepStartTimes.current[state.currentStep];
    const duration = startTime ? Date.now() - startTime : undefined;

    try {
      const newState = await completeStep(userId, state.currentStep, stepData);
      setState(newState);

      // Track completion with duration
      trackEvent('step_complete', state.currentStep, {
        stepData,
        duration,
        progress: newState.progress
      });

      // Start tracking next step
      if (newState.currentStep !== state.currentStep) {
        stepStartTimes.current[newState.currentStep] = Date.now();
      }

      // Check for new achievements
      checkForNewAchievements();

    } catch (err) {
      const onboardingError = err as OnboardingError;
      setError(onboardingError);
      trackEvent('error', state.currentStep, {
        error: onboardingError.code,
        message: onboardingError.message
      });
      throw onboardingError;
    } finally {
      setIsLoading(false);
    }
  }, [userId, state]);

  // Skip current step
  const skipCurrentStep = useCallback(async (reason?: string): Promise<void> => {
    if (!userId || !state) throw new Error('Invalid state');

    setIsLoading(true);
    setError(null);

    try {
      const newState = await skipStep(userId, state.currentStep, reason);
      setState(newState);

      trackEvent('step_skip', state.currentStep, {
        reason,
        progress: newState.progress
      });

      // Start tracking next step
      if (newState.currentStep !== state.currentStep) {
        stepStartTimes.current[newState.currentStep] = Date.now();
      }

    } catch (err) {
      const onboardingError = err as OnboardingError;
      setError(onboardingError);
      throw onboardingError;
    } finally {
      setIsLoading(false);
    }
  }, [userId, state]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserOnboardingProfile>): Promise<void> => {
    if (!userId || !state) throw new Error('Invalid state');

    try {
      await updateProfile(userId, updates);
      
      setState(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, ...updates }
      } : prev);

    } catch (err) {
      const onboardingError = err as OnboardingError;
      setError(onboardingError);
      throw onboardingError;
    }
  }, [userId, state]);

  // Reset onboarding
  const resetOnboarding = useCallback(async (): Promise<void> => {
    setState(null);
    setError(null);
    setAchievements([]);
    setBadges([]);
    stepStartTimes.current = {};
    sessionStartTime.current = Date.now();

    if (userId) {
      await loadOnboardingState();
    }
  }, [userId]);

  // Pause onboarding (save current state)
  const pauseOnboarding = useCallback((): void => {
    if (state) {
      trackEvent('step_start', state.currentStep, {
        action: 'pause',
        timeSpent: Date.now() - sessionStartTime.current
      });
    }
  }, [state]);

  // Resume onboarding
  const resumeOnboarding = useCallback((): void => {
    if (state) {
      stepStartTimes.current[state.currentStep] = Date.now();
      trackEvent('step_start', state.currentStep, {
        action: 'resume'
      });
    }
  }, [state]);

  // Check for new achievements
  const checkForNewAchievements = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const { achievements: newAchievements, badges: newBadges } = await getAchievements(userId);
      
      // Find newly unlocked achievements
      const previousAchievementIds = achievements.map(a => a.id);
      const newlyUnlocked = newAchievements.filter(a => 
        !previousAchievementIds.includes(a.id) && a.unlockedAt
      );

      if (newlyUnlocked.length > 0) {
        // Celebrate new achievements
        newlyUnlocked.forEach(achievement => {
          trackEvent('step_complete', state?.currentStep || 'welcome', {
            achievement: achievement.id,
            type: 'achievement_unlocked'
          });
        });
      }

      setAchievements(newAchievements);
      setBadges(newBadges);
    } catch (error) {
      console.warn('Failed to check achievements:', error);
    }
  }, [userId, achievements, state]);

  // Analytics functions
  const analytics = {
    trackEvent: useCallback((event: AnalyticsEvent): void => {
      trackEvent(event.type, event.step, event.data);
    }, []),

    submitFeedback: useCallback(async (feedback: UserFeedback): Promise<void> => {
      if (!userId) throw new Error('User ID required');
      await submitFeedback(userId, feedback);
    }, [userId]),

    getMetrics: useCallback(async (): Promise<OnboardingMetrics> => {
      if (!userId) throw new Error('User ID required');
      return await getMetrics(userId);
    }, [userId])
  };

  // Helper functions
  const getStepProgress = useCallback((step: OnboardingStep): number => {
    if (!state) return 0;
    return state.completedSteps.includes(step) ? 100 : 
           state.currentStep === step ? 50 : 0;
  }, [state]);

  const getTimeSpentOnStep = useCallback((step: OnboardingStep): number => {
    const startTime = stepStartTimes.current[step];
    return startTime ? (Date.now() - startTime) / 1000 : 0; // seconds
  }, []);

  const getTotalTimeSpent = useCallback((): number => {
    return (Date.now() - sessionStartTime.current) / 1000 / 60; // minutes
  }, []);

  const getEstimatedTimeRemaining = useCallback((): number => {
    if (!state) return 0;
    return estimateTimeRemaining(state.currentStep, state.completedSteps, state.profile);
  }, [state]);

  const canGoToStep = useCallback((step: OnboardingStep): boolean => {
    if (!state) return false;
    return canAccessStep(step, state.completedSteps);
  }, [state]);

  const getNextAvailableStep = useCallback((): OnboardingStep | null => {
    if (!state) return null;
    return getNextStep(state.currentStep, state.completedSteps);
  }, [state]);

  return {
    state,
    actions: {
      startOnboarding: startOnboardingFlow,
      completeStep: completeCurrentStep,
      skipStep: skipCurrentStep,
      updateProfile: updateUserProfile,
      resetOnboarding,
      pauseOnboarding,
      resumeOnboarding
    },
    analytics,
    isLoading,
    error,
    // Additional helper properties
    achievements,
    badges,
    helpers: {
      getStepProgress,
      getTimeSpentOnStep,
      getTotalTimeSpent,
      getEstimatedTimeRemaining,
      canGoToStep,
      getNextAvailableStep,
      checkForNewAchievements
    }
  };
}

// Tutorial-specific hook
export function useTutorials(userId: string) {
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null);
  const [tutorialProgress, setTutorialProgress] = useState<{ [tutorialId: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTutorial = useCallback(async (tutorialId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setCurrentTutorial(tutorialId);
      setTutorialProgress(prev => ({
        ...prev,
        [tutorialId]: {
          currentStep: 0,
          completedSteps: [],
          startedAt: new Date().toISOString()
        }
      }));

      trackEvent('step_start', 'platform-tour', {
        tutorialId,
        action: 'tutorial_started'
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tutorial');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeStep = useCallback(async (tutorialId: string, stepId: string): Promise<void> => {
    const progress = tutorialProgress[tutorialId];
    if (!progress) return;

    setTutorialProgress(prev => ({
      ...prev,
      [tutorialId]: {
        ...progress,
        completedSteps: [...progress.completedSteps, stepId],
        currentStep: progress.currentStep + 1,
        lastActiveAt: new Date().toISOString()
      }
    }));

    trackEvent('step_complete', 'platform-tour', {
      tutorialId,
      stepId,
      action: 'tutorial_step_completed'
    });
  }, [tutorialProgress]);

  const pauseTutorial = useCallback((): void => {
    if (currentTutorial) {
      trackEvent('step_start', 'platform-tour', {
        tutorialId: currentTutorial,
        action: 'tutorial_paused'
      });
    }
  }, [currentTutorial]);

  const resumeTutorial = useCallback((): void => {
    if (currentTutorial) {
      trackEvent('step_start', 'platform-tour', {
        tutorialId: currentTutorial,
        action: 'tutorial_resumed'
      });
    }
  }, [currentTutorial]);

  const resetTutorial = useCallback((tutorialId: string): void => {
    setTutorialProgress(prev => ({
      ...prev,
      [tutorialId]: {
        currentStep: 0,
        completedSteps: [],
        startedAt: new Date().toISOString()
      }
    }));

    trackEvent('step_start', 'platform-tour', {
      tutorialId,
      action: 'tutorial_reset'
    });
  }, []);

  const skipToStep = useCallback((tutorialId: string, stepNumber: number): void => {
    const progress = tutorialProgress[tutorialId];
    if (!progress) return;

    setTutorialProgress(prev => ({
      ...prev,
      [tutorialId]: {
        ...progress,
        currentStep: stepNumber,
        lastActiveAt: new Date().toISOString()
      }
    }));

    trackEvent('step_skip', 'platform-tour', {
      tutorialId,
      stepNumber,
      action: 'tutorial_skip_to_step'
    });
  }, [tutorialProgress]);

  return {
    currentTutorial,
    progress: currentTutorial ? tutorialProgress[currentTutorial] : null,
    actions: {
      startTutorial,
      completeStep,
      pauseTutorial,
      resumeTutorial,
      resetTutorial,
      skipToStep
    },
    isLoading,
    error
  };
}

// Onboarding analytics hook
export function useOnboardingAnalytics() {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  // Track events locally
  const trackEvent = useCallback((
    eventType: AnalyticsEvent['type'],
    step: OnboardingStep,
    metadata?: Record<string, any>
  ): void => {
    const event: AnalyticsEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      step,
      data: metadata
    };

    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events

    // Also call global tracking
    trackEvent(eventType, step, metadata);
  }, []);

  // Track form interactions
  const trackFormInteraction = useCallback((
    field: string,
    action: 'focus' | 'blur' | 'change' | 'error',
    value?: any
  ): void => {
    trackEvent('step_start', 'welcome', {
      type: 'form_interaction',
      field,
      action,
      hasValue: !!value
    });
  }, [trackEvent]);

  // Track validation errors
  const trackValidationError = useCallback((
    field: string,
    error: string,
    step: OnboardingStep
  ): void => {
    trackEvent('error', step, {
      type: 'validation_error',
      field,
      error
    });
  }, [trackEvent]);

  // Track help requests
  const trackHelpRequest = useCallback((
    step: OnboardingStep,
    helpType: 'tooltip' | 'guide' | 'support' | 'faq'
  ): void => {
    trackEvent('help_request', step, {
      helpType
    });
  }, [trackEvent]);

  // Track quiz attempts
  const trackQuizAttempt = useCallback((
    quizId: string,
    score: number,
    passed: boolean,
    timeSpent: number
  ): void => {
    trackEvent('quiz_attempt', 'blockchain-education', {
      quizId,
      score,
      passed,
      timeSpent
    });
  }, [trackEvent]);

  // Get session metrics
  const getSessionMetrics = useCallback((): {
    eventsCount: number;
    errorsCount: number;
    helpRequestsCount: number;
    timeSpent: number;
  } => {
    const now = Date.now();
    const sessionStart = events.length > 0 ? new Date(events[0].timestamp).getTime() : now;
    
    return {
      eventsCount: events.length,
      errorsCount: events.filter(e => e.type === 'error').length,
      helpRequestsCount: events.filter(e => e.type === 'help_request').length,
      timeSpent: Math.round((now - sessionStart) / 1000 / 60) // minutes
    };
  }, [events]);

  // Export analytics data
  const exportAnalytics = useCallback((): string => {
    const data = {
      metrics,
      events,
      sessionMetrics: getSessionMetrics(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }, [metrics, events, getSessionMetrics]);

  return {
    metrics,
    events: events.slice(-10), // Return last 10 events for display
    trackEvent,
    trackFormInteraction,
    trackValidationError,
    trackHelpRequest,
    trackQuizAttempt,
    getSessionMetrics,
    exportAnalytics
  };
}

// Goal management hook
export function useOnboardingGoals(userId: string) {
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addGoal = useCallback((goal: Omit<OnboardingGoal, 'id' | 'completed'>): void => {
    const newGoal: OnboardingGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false
    };

    setGoals(prev => [...prev, newGoal]);

    trackEvent('step_start', 'goals', {
      action: 'goal_added',
      goal: newGoal
    });
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<OnboardingGoal>): void => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));

    trackEvent('step_start', 'goals', {
      action: 'goal_updated',
      goalId,
      updates
    });
  }, []);

  const completeGoal = useCallback((goalId: string): void => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, completed: true } : goal
    ));

    trackEvent('step_complete', 'goals', {
      action: 'goal_completed',
      goalId
    });
  }, []);

  const removeGoal = useCallback((goalId: string): void => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));

    trackEvent('step_skip', 'goals', {
      action: 'goal_removed',
      goalId
    });
  }, []);

  const getGoalsByCategory = useCallback((category: OnboardingGoal['category']): OnboardingGoal[] => {
    return goals.filter(goal => goal.category === category);
  }, [goals]);

  const getCompletionRate = useCallback((): number => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(goal => goal.completed).length;
    return Math.round((completed / goals.length) * 100);
  }, [goals]);

  return {
    goals,
    isLoading,
    actions: {
      addGoal,
      updateGoal,
      completeGoal,
      removeGoal
    },
    helpers: {
      getGoalsByCategory,
      getCompletionRate
    }
  };
}

// Progress persistence hook
export function useOnboardingPersistence(userId: string) {
  const saveProgress = useCallback(async (state: OnboardingState): Promise<void> => {
    try {
      // Save to localStorage for immediate recovery
      localStorage.setItem(`onboarding-${userId}`, JSON.stringify(state));

      // Also attempt to save to server
      await updateProfile(userId, state.profile);
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error);
    }
  }, [userId]);

  const loadProgress = useCallback((): OnboardingState | null => {
    try {
      const saved = localStorage.getItem(`onboarding-${userId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load saved progress:', error);
      return null;
    }
  }, [userId]);

  const clearProgress = useCallback((): void => {
    localStorage.removeItem(`onboarding-${userId}`);
  }, [userId]);

  return {
    saveProgress,
    loadProgress,
    clearProgress
  };
}

export default useOnboarding; 