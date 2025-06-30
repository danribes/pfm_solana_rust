// Task 4.5.2: Analytics Hook
// React hook for tracking user interactions and analytics

import { useEffect, useCallback, useMemo } from "react";
import {
  UseAnalyticsResult,
  AnalyticsEvent,
  ConversionEvent,
  UserEngagement,
  InteractionType,
  ConversionType,
} from "../types/public";
import { analyticsService } from "../services/analytics";

// ============================================================================
// MAIN ANALYTICS HOOK
// ============================================================================

export function useAnalytics(): UseAnalyticsResult {
  // ========================================================================
  // SESSION INFORMATION
  // ========================================================================

  const sessionInfo = useMemo(() => analyticsService.getSessionInfo(), []);

  // ========================================================================
  // TRACKING METHODS
  // ========================================================================

  const trackEvent = useCallback((event: Partial<AnalyticsEvent>) => {
    analyticsService.trackEvent(event);
  }, []);

  const trackConversion = useCallback((conversion: Partial<ConversionEvent>) => {
    analyticsService.trackConversion(conversion);
  }, []);

  const trackEngagement = useCallback((engagement: Partial<UserEngagement>) => {
    analyticsService.trackEngagement(engagement);
  }, []);

  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    analyticsService.trackPageView(page, properties);
  }, []);

  // ========================================================================
  // PAGE VIEW TRACKING
  // ========================================================================

  useEffect(() => {
    // Track initial page view
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    trackPageView(currentPath, {
      title: typeof document !== "undefined" ? document.title : "",
      url: typeof window !== "undefined" ? window.location.href : "",
    });
  }, []); // Only track on mount

  // ========================================================================
  // RETURN API
  // ========================================================================

  return {
    trackEvent,
    trackConversion,
    trackEngagement,
    trackPageView,
    sessionId: sessionInfo.sessionId,
    userId: sessionInfo.userId,
    isTracking: sessionInfo.isTracking,
  };
}

// ============================================================================
// SPECIALIZED ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for tracking component interactions
 */
export function useComponentAnalytics(componentName: string) {
  const { trackEvent } = useAnalytics();

  const trackComponentEvent = useCallback(
    (action: string, properties?: Record<string, any>) => {
      trackEvent({
        event: "component_interaction",
        category: "component",
        action,
        label: componentName,
        properties: {
          component: componentName,
          ...properties,
        },
      });
    },
    [trackEvent, componentName]
  );

  const trackMount = useCallback(() => {
    trackComponentEvent("mount");
  }, [trackComponentEvent]);

  const trackUnmount = useCallback(() => {
    trackComponentEvent("unmount");
  }, [trackComponentEvent]);

  const trackClick = useCallback(
    (element: string, properties?: Record<string, any>) => {
      trackComponentEvent("click", { element, ...properties });
      analyticsService.trackInteraction(InteractionType.CLICK, `${componentName}.${element}`);
    },
    [trackComponentEvent, componentName]
  );

  const trackHover = useCallback(
    (element: string) => {
      analyticsService.trackInteraction(InteractionType.HOVER, `${componentName}.${element}`);
    },
    [componentName]
  );

  // Auto-track mount/unmount
  useEffect(() => {
    trackMount();
    return trackUnmount;
  }, [trackMount, trackUnmount]);

  return {
    trackComponentEvent,
    trackClick,
    trackHover,
  };
}

/**
 * Hook for tracking form interactions
 */
export function useFormAnalytics(formName: string) {
  const { trackEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackEvent({
      event: "form_start",
      category: "form",
      action: "start",
      label: formName,
    });
  }, [trackEvent, formName]);

  const trackFormField = useCallback(
    (fieldName: string, action: "focus" | "blur" | "change", value?: string) => {
      trackEvent({
        event: "form_field",
        category: "form",
        action: `${action}_${fieldName}`,
        label: formName,
        properties: {
          field: fieldName,
          action,
          hasValue: !!value,
          valueLength: value?.length || 0,
        },
      });
    },
    [trackEvent, formName]
  );

  const trackFormSubmit = useCallback(
    (success: boolean, errors?: string[]) => {
      trackEvent({
        event: "form_submit",
        category: "form",
        action: success ? "submit_success" : "submit_error",
        label: formName,
        properties: {
          success,
          errors,
          errorCount: errors?.length || 0,
        },
      });
    },
    [trackEvent, formName]
  );

  const trackFormAbandonment = useCallback(
    (fieldsCompleted: string[], timeSpent: number) => {
      trackEvent({
        event: "form_abandonment",
        category: "form",
        action: "abandon",
        label: formName,
        value: timeSpent,
        properties: {
          fieldsCompleted,
          completedCount: fieldsCompleted.length,
          timeSpent,
        },
      });
    },
    [trackEvent, formName]
  );

  return {
    trackFormStart,
    trackFormField,
    trackFormSubmit,
    trackFormAbandonment,
  };
}

/**
 * Hook for tracking search interactions
 */
export function useSearchAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackSearch = useCallback(
    (query: string, resultsCount: number, source: string = "default") => {
      analyticsService.trackSearch(query, resultsCount);
      trackEvent({
        event: "search_performed",
        category: "search",
        action: "search",
        label: query,
        value: resultsCount,
        properties: {
          query,
          resultsCount,
          source,
          hasResults: resultsCount > 0,
        },
      });
    },
    [trackEvent]
  );

  const trackSearchResult = useCallback(
    (query: string, resultId: string, position: number) => {
      trackEvent({
        event: "search_result_click",
        category: "search",
        action: "result_click",
        label: query,
        value: position,
        properties: {
          query,
          resultId,
          position,
        },
      });
    },
    [trackEvent]
  );

  const trackSearchFilter = useCallback(
    (filterType: string, filterValue: string, query?: string) => {
      analyticsService.trackFilterUsage(filterType, filterValue);
      trackEvent({
        event: "search_filter_applied",
        category: "search",
        action: "filter",
        label: filterType,
        properties: {
          filterType,
          filterValue,
          query,
        },
      });
    },
    [trackEvent]
  );

  const trackSearchClear = useCallback(
    (query: string, timeSpent: number) => {
      trackEvent({
        event: "search_cleared",
        category: "search",
        action: "clear",
        label: query,
        value: timeSpent,
        properties: {
          query,
          timeSpent,
        },
      });
    },
    [trackEvent]
  );

  return {
    trackSearch,
    trackSearchResult,
    trackSearchFilter,
    trackSearchClear,
  };
}

/**
 * Hook for tracking conversion funnels
 */
export function useConversionAnalytics() {
  const { trackConversion, trackEvent } = useAnalytics();

  const trackNewsletterSignup = useCallback(
    (email: string, interests: string[], source: string) => {
      analyticsService.trackNewsletterSignup(email, interests, source);
      trackConversion({
        type: ConversionType.NEWSLETTER_SIGNUP,
        source: source as any,
        properties: {
          interests,
          interestCount: interests.length,
        },
      });
    },
    [trackConversion]
  );

  const trackRegistrationStart = useCallback(() => {
    trackEvent({
      event: "registration_start",
      category: "conversion",
      action: "start",
      label: "user_registration",
    });
  }, [trackEvent]);

  const trackRegistrationComplete = useCallback(
    (userId: string, method: string) => {
      trackConversion({
        type: ConversionType.REGISTRATION,
        properties: {
          method,
          userId,
        },
      });
    },
    [trackConversion]
  );

  const trackCommunityJoin = useCallback(
    (communityId: string, communityName: string, source: string) => {
      trackConversion({
        type: ConversionType.COMMUNITY_JOIN,
        properties: {
          communityId,
          communityName,
          source,
        },
      });
    },
    [trackConversion]
  );

  const trackDemoRequest = useCallback(
    (contactInfo: Record<string, any>) => {
      analyticsService.trackDemoRequest(contactInfo);
    },
    []
  );

  return {
    trackNewsletterSignup,
    trackRegistrationStart,
    trackRegistrationComplete,
    trackCommunityJoin,
    trackDemoRequest,
  };
}

/**
 * Hook for tracking user engagement patterns
 */
export function useEngagementAnalytics() {
  const { trackEngagement, trackEvent } = useAnalytics();

  const trackTimeOnPage = useCallback(
    (page: string, timeSpent: number) => {
      trackEvent({
        event: "time_on_page",
        category: "engagement",
        action: "time_spent",
        label: page,
        value: timeSpent,
        properties: {
          page,
          timeSpent,
          timeSpentMinutes: Math.round(timeSpent / 60000),
        },
      });
    },
    [trackEvent]
  );

  const trackScrollMilestone = useCallback(
    (milestone: number, page: string) => {
      trackEvent({
        event: "scroll_milestone",
        category: "engagement",
        action: "scroll",
        label: page,
        value: milestone,
        properties: {
          page,
          milestone,
        },
      });
    },
    [trackEvent]
  );

  const trackVideoEngagement = useCallback(
    (videoId: string, action: "play" | "pause" | "complete", progress: number) => {
      trackEvent({
        event: "video_engagement",
        category: "media",
        action,
        label: videoId,
        value: progress,
        properties: {
          videoId,
          progress,
          progressPercent: Math.round(progress * 100),
        },
      });
    },
    [trackEvent]
  );

  const trackContentEngagement = useCallback(
    (contentId: string, contentType: string, action: string, value?: number) => {
      trackEvent({
        event: "content_engagement",
        category: "content",
        action,
        label: contentId,
        value,
        properties: {
          contentId,
          contentType,
        },
      });
    },
    [trackEvent]
  );

  return {
    trackTimeOnPage,
    trackScrollMilestone,
    trackVideoEngagement,
    trackContentEngagement,
  };
}

/**
 * Hook for A/B testing and experimentation
 */
export function useExperimentAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackExperimentView = useCallback(
    (experimentId: string, variant: string) => {
      trackEvent({
        event: "experiment_view",
        category: "experiment",
        action: "view",
        label: experimentId,
        properties: {
          experimentId,
          variant,
        },
      });
    },
    [trackEvent]
  );

  const trackExperimentConversion = useCallback(
    (experimentId: string, variant: string, conversionType: string) => {
      trackEvent({
        event: "experiment_conversion",
        category: "experiment",
        action: "conversion",
        label: experimentId,
        properties: {
          experimentId,
          variant,
          conversionType,
        },
      });
    },
    [trackEvent]
  );

  return {
    trackExperimentView,
    trackExperimentConversion,
  };
}
