// Task 4.5.2: Analytics and Tracking Service
// Handles user engagement tracking, conversion analytics, and marketing metrics

import {
  AnalyticsEvent,
  ConversionEvent,
  UserEngagement,
  InteractionEvent,
  ConversionType,
  TrafficSource,
  InteractionType
} from "../types/public";

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private isTracking: boolean = true;
  private engagementData: UserEngagement;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeEngagement();
    this.setupEventListeners();
    this.startEventFlushing();
  }

  // ========================================================================
  // CORE TRACKING METHODS
  // ========================================================================

  /**
   * Track custom analytics event
   */
  trackEvent(event: Partial<AnalyticsEvent>): void {
    if (!this.isTracking) return;

    const fullEvent: AnalyticsEvent = {
      event: event.event || "custom_event",
      category: event.category || "general",
      action: event.action || "unknown",
      label: event.label,
      value: event.value,
      properties: event.properties || {},
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.eventQueue.push(fullEvent);
    
    // Send critical events immediately
    if (this.isCriticalEvent(fullEvent)) {
      this.flushEvents();
    }
  }

  /**
   * Track conversion events
   */
  trackConversion(conversion: Partial<ConversionEvent>): void {
    if (!this.isTracking) return;

    const conversionEvent: ConversionEvent = {
      type: conversion.type || ConversionType.REGISTRATION,
      source: conversion.source || this.detectTrafficSource(),
      medium: conversion.medium || "unknown",
      campaign: conversion.campaign,
      content: conversion.content,
      term: conversion.term,
      value: conversion.value,
      timestamp: new Date().toISOString(),
    };

    // Track as both conversion and general event
    this.trackEvent({
      event: "conversion",
      category: "conversion",
      action: conversionEvent.type,
      label: conversionEvent.source,
      value: conversionEvent.value,
      properties: conversionEvent,
    });

    // Send conversion events immediately
    this.sendConversionEvent(conversionEvent);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, any>): void {
    if (!this.isTracking) return;

    this.trackEvent({
      event: "page_view",
      category: "navigation",
      action: "view",
      label: page,
      properties: {
        page,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ...properties,
      },
    });

    this.engagementData.pageViews++;
  }

  /**
   * Track user interaction
   */
  trackInteraction(type: InteractionType, element: string, value?: string): void {
    if (!this.isTracking) return;

    const interaction: InteractionEvent = {
      type,
      element,
      timestamp: new Date().toISOString(),
      value,
    };

    this.engagementData.interactions.push(interaction);

    this.trackEvent({
      event: "interaction",
      category: "engagement",
      action: type,
      label: element,
      value: value ? parseFloat(value) || undefined : undefined,
      properties: interaction,
    });
  }

  /**
   * Track engagement metrics
   */
  trackEngagement(engagement: Partial<UserEngagement>): void {
    if (!this.isTracking) return;

    Object.assign(this.engagementData, engagement);

    this.trackEvent({
      event: "engagement_update",
      category: "engagement",
      action: "update",
      properties: this.engagementData,
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(depth: number): void {
    if (!this.isTracking) return;

    if (depth > this.engagementData.scrollDepth) {
      this.engagementData.scrollDepth = depth;

      // Track milestone scroll depths
      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (depth >= milestone && this.engagementData.scrollDepth < milestone) {
          this.trackEvent({
            event: "scroll_milestone",
            category: "engagement",
            action: "scroll",
            label: `${milestone}%`,
            value: milestone,
          });
        }
      }
    }
  }

  // ========================================================================
  // SPECIALIZED TRACKING METHODS
  // ========================================================================

  /**
   * Track community interaction
   */
  trackCommunityInteraction(action: string, communityId: string, properties?: Record<string, any>): void {
    this.trackEvent({
      event: "community_interaction",
      category: "community",
      action,
      label: communityId,
      properties: {
        communityId,
        ...properties,
      },
    });
  }

  /**
   * Track search behavior
   */
  trackSearch(query: string, resultsCount: number, selectedResult?: string): void {
    this.trackEvent({
      event: "search",
      category: "discovery",
      action: "search",
      label: query,
      value: resultsCount,
      properties: {
        query,
        resultsCount,
        selectedResult,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track filter usage
   */
  trackFilterUsage(filterType: string, filterValue: string): void {
    this.trackEvent({
      event: "filter_applied",
      category: "discovery",
      action: "filter",
      label: filterType,
      value: 1,
      properties: {
        filterType,
        filterValue,
      },
    });
  }

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(email: string, interests: string[], source: string): void {
    this.trackConversion({
      type: ConversionType.NEWSLETTER_SIGNUP,
      source: this.detectTrafficSource(),
      medium: source,
      properties: {
        email: this.hashEmail(email),
        interests,
        source,
      },
    });
  }

  /**
   * Track demo request
   */
  trackDemoRequest(contactInfo: Record<string, any>): void {
    this.trackConversion({
      type: ConversionType.DEMO_REQUEST,
      source: this.detectTrafficSource(),
      medium: "landing_page",
      value: 1,
      properties: {
        ...contactInfo,
        email: this.hashEmail(contactInfo.email),
      },
    });
  }

  // ========================================================================
  // USER IDENTIFICATION
  // ========================================================================

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent({
      event: "user_identified",
      category: "user",
      action: "identify",
      properties: { userId },
    });
  }

  /**
   * Clear user identification
   */
  clearUserId(): void {
    this.userId = undefined;
    this.trackEvent({
      event: "user_logged_out",
      category: "user",
      action: "logout",
    });
  }

  // ========================================================================
  // CONFIGURATION METHODS
  // ========================================================================

  /**
   * Enable/disable tracking
   */
  setTracking(enabled: boolean): void {
    this.isTracking = enabled;
    
    if (enabled) {
      this.trackEvent({
        event: "tracking_enabled",
        category: "system",
        action: "enable_tracking",
      });
    } else {
      this.flushEvents(); // Send remaining events before disabling
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo(): { sessionId: string; userId?: string; isTracking: boolean } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isTracking: this.isTracking,
    };
  }

  // ========================================================================
  // PRIVATE UTILITY METHODS
  // ========================================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEngagement(): void {
    this.engagementData = {
      sessionId: this.sessionId,
      timeOnPage: 0,
      pageViews: 0,
      scrollDepth: 0,
      interactions: [],
      exitIntent: false,
      converted: false,
    };
  }

  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // Track time on page
    const startTime = Date.now();
    setInterval(() => {
      this.engagementData.timeOnPage = Date.now() - startTime;
    }, 1000);

    // Track scroll depth
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          this.trackScrollDepth(Math.min(scrollPercent, 100));
          ticking = false;
        });
        ticking = true;
      }
    });

    // Track exit intent
    document.addEventListener("mouseleave", (e) => {
      if (e.clientY <= 0) {
        this.engagementData.exitIntent = true;
        this.trackEvent({
          event: "exit_intent",
          category: "engagement",
          action: "exit_intent",
        });
      }
    });

    // Track page unload
    window.addEventListener("beforeunload", () => {
      this.trackEngagement(this.engagementData);
      this.flushEvents();
    });

    // Track visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackEvent({
          event: "page_hidden",
          category: "engagement",
          action: "visibility_change",
        });
      } else {
        this.trackEvent({
          event: "page_visible",
          category: "engagement",
          action: "visibility_change",
        });
      }
    });
  }

  private detectTrafficSource(): TrafficSource {
    if (typeof window === "undefined") return TrafficSource.DIRECT;

    const referrer = document.referrer;
    const url = new URL(window.location.href);
    
    // Check URL parameters for UTM sources
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    
    if (utmMedium === "email") return TrafficSource.EMAIL;
    if (utmMedium === "social") return TrafficSource.SOCIAL;
    if (utmMedium === "cpc" || utmMedium === "paid") return TrafficSource.PAID;
    
    if (referrer) {
      if (referrer.includes("google") || referrer.includes("bing") || referrer.includes("duckduckgo")) {
        return TrafficSource.ORGANIC;
      }
      if (referrer.includes("facebook") || referrer.includes("twitter") || referrer.includes("linkedin")) {
        return TrafficSource.SOCIAL;
      }
      return TrafficSource.REFERRAL;
    }

    return TrafficSource.DIRECT;
  }

  private isCriticalEvent(event: AnalyticsEvent): boolean {
    const criticalEvents = ["conversion", "error", "user_identified"];
    return criticalEvents.includes(event.event);
  }

  private startEventFlushing(): void {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        // Re-queue events if sending failed
        this.eventQueue.unshift(...events);
      }
    } catch (error: any) { console.error("Analytics error:", error);
      console.warn("Failed to send analytics events:", error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private async sendConversionEvent(conversion: ConversionEvent): Promise<void> {
    try {
      await fetch("/api/analytics/conversions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversion }),
      });
    } catch (error: any) { console.error("Analytics error:", error);
      console.warn("Failed to send conversion event:", error);
    }
  }

  private hashEmail(email: string): string {
    // Simple hash for privacy - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const analyticsService = new AnalyticsService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize analytics with configuration
 */
export function initializeAnalytics(config: {
  userId?: string;
  trackingEnabled?: boolean;
  debugMode?: boolean;
}): void {
  if (config.userId) {
    analyticsService.setUserId(config.userId);
  }
  
  if (config.trackingEnabled !== undefined) {
    analyticsService.setTracking(config.trackingEnabled);
  }
  
  // Track initialization
  analyticsService.trackEvent({
    event: "analytics_initialized",
    category: "system",
    action: "initialize",
    properties: config,
  });
}

/**
 * Track external link clicks
 */
export function trackExternalLink(url: string, context?: string): void {
  analyticsService.trackEvent({
    event: "external_link_click",
    category: "navigation",
    action: "external_link",
    label: url,
    properties: {
      url,
      context,
    },
  });
}

/**
 * Track form interactions
 */
export function trackFormInteraction(formName: string, action: string, field?: string): void {
  analyticsService.trackEvent({
    event: "form_interaction",
    category: "form",
    action,
    label: formName,
    properties: {
      formName,
      field,
    },
  });
}

/**
 * Track download events
 */
export function trackDownload(fileName: string, fileType: string, source?: string): void {
  analyticsService.trackEvent({
    event: "download",
    category: "content",
    action: "download",
    label: fileName,
    properties: {
      fileName,
      fileType,
      source,
    },
  });
}

/**
 * Track video interactions
 */
export function trackVideoInteraction(videoId: string, action: string, progress?: number): void {
  analyticsService.trackEvent({
    event: "video_interaction",
    category: "media",
    action,
    label: videoId,
    value: progress,
    properties: {
      videoId,
      progress,
    },
  });
}
