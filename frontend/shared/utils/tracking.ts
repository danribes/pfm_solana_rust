/**
 * Tracking Utilities
 * 
 * Comprehensive utilities for analytics tracking, performance monitoring,
 * and data collection in the PFM application.
 */

import {
  EventCategory,
  EventAction,
  AnalyticsEvent,
  PerformanceMetrics,
  DeviceInfo,
  LocationInfo,
  ConversionEvent
} from '../types/analytics';

/**
 * Event Tracking Utilities
 */
export class EventTracker {
  /**
   * Track user interactions with elements
   */
  static trackClick(
    element: HTMLElement,
    category: EventCategory = 'user_interaction',
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      category,
      action: 'click',
      label: this.getElementLabel(element),
      properties: {
        elementType: element.tagName.toLowerCase(),
        elementId: element.id || undefined,
        elementClass: element.className || undefined,
        elementText: element.textContent?.trim().substring(0, 100) || undefined,
        ...customProperties
      }
    };

    return event;
  }

  /**
   * Track form submissions
   */
  static trackFormSubmit(
    form: HTMLFormElement,
    success: boolean = true,
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    const formData = new FormData(form);
    const fieldCount = Array.from(formData.keys()).length;

    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'user_interaction',
      action: 'submit',
      label: form.name || form.id || 'unnamed_form',
      value: success ? 1 : 0,
      properties: {
        formId: form.id || undefined,
        formName: form.name || undefined,
        fieldCount,
        success,
        ...customProperties
      }
    };
  }

  /**
   * Track navigation events
   */
  static trackNavigation(
    fromUrl: string,
    toUrl: string,
    navigationMethod: 'click' | 'back' | 'forward' | 'programmatic' = 'click'
  ): AnalyticsEvent {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'navigation',
      action: 'view',
      label: toUrl,
      properties: {
        fromUrl,
        toUrl,
        navigationMethod,
        fromDomain: this.extractDomain(fromUrl),
        toDomain: this.extractDomain(toUrl),
        isExternalNavigation: this.extractDomain(fromUrl) !== this.extractDomain(toUrl)
      }
    };
  }

  /**
   * Track search events
   */
  static trackSearch(
    query: string,
    category: string,
    resultCount?: number,
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'user_interaction',
      action: 'search',
      label: category,
      value: resultCount,
      properties: {
        query: query.toLowerCase(),
        queryLength: query.length,
        category,
        resultCount,
        hasResults: resultCount !== undefined && resultCount > 0,
        ...customProperties
      }
    };
  }

  /**
   * Track voting events
   */
  static trackVote(
    proposalId: string,
    voteOption: string,
    voteWeight?: number,
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'voting',
      action: 'vote',
      label: proposalId,
      value: voteWeight,
      properties: {
        proposalId,
        voteOption,
        voteWeight,
        ...customProperties
      }
    };
  }

  /**
   * Track community interactions
   */
  static trackCommunityAction(
    action: 'join' | 'leave' | 'create' | 'update',
    communityId: string,
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'community',
      action,
      label: communityId,
      properties: {
        communityId,
        ...customProperties
      }
    };
  }

  /**
   * Track wallet interactions
   */
  static trackWalletAction(
    action: 'connect' | 'disconnect',
    walletType?: string,
    success: boolean = true,
    customProperties?: Record<string, any>
  ): AnalyticsEvent {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      category: 'wallet',
      action,
      label: walletType || 'unknown',
      value: success ? 1 : 0,
      properties: {
        walletType,
        success,
        ...customProperties
      }
    };
  }

  // Helper methods
  private static getElementLabel(element: HTMLElement): string {
    // Try to get meaningful label from element
    return element.getAttribute('data-track-label') ||
           element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.textContent?.trim().substring(0, 50) ||
           element.tagName.toLowerCase();
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Performance Monitoring Utilities
 */
export class PerformanceTracker {
  /**
   * Measure and track page load performance
   */
  static async trackPageLoad(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigation = entries[0] as PerformanceNavigationTiming;
        
        const metrics: PerformanceMetrics = {
          id: this.generateId(),
          timestamp: new Date(),
          sessionId: '', // Will be filled by service
          url: window.location.href,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: this.getFirstContentfulPaint(),
          customMetrics: {
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
            domProcessing: navigation.domComplete - navigation.responseEnd
          }
        };

        resolve(metrics);
        observer.disconnect();
      });

      observer.observe({ type: 'navigation', buffered: true });

      // Fallback in case observer doesn't work
      setTimeout(() => {
        resolve({
          id: this.generateId(),
          timestamp: new Date(),
          sessionId: '',
          url: window.location.href,
          loadComplete: performance.now()
        });
      }, 5000);
    });
  }

  /**
   * Track Core Web Vitals
   */
  static trackCoreWebVitals(): Promise<Partial<PerformanceMetrics>> {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {
        id: this.generateId(),
        timestamp: new Date(),
        url: window.location.href
      };

      // Track Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            metrics.largestContentfulPaint = lcp.startTime;
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (error) {
          console.warn('LCP tracking not supported');
        }

        // Track First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              metrics.firstInputDelay = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (error) {
          console.warn('FID tracking not supported');
        }

        // Track Cumulative Layout Shift
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let cls = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            });
            metrics.cumulativeLayoutShift = cls;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (error) {
          console.warn('CLS tracking not supported');
        }
      }

      // First Contentful Paint
      metrics.firstContentfulPaint = this.getFirstContentfulPaint();

      // Return metrics after a short delay to collect initial data
      setTimeout(() => resolve(metrics), 2000);
    });
  }

  /**
   * Track memory usage
   */
  static trackMemoryUsage(): Partial<PerformanceMetrics> {
    const memory = (performance as any).memory;
    
    if (memory) {
      return {
        memoryUsed: memory.usedJSHeapSize,
        memoryLimit: memory.totalJSHeapSize,
        customMetrics: {
          heapSizeLimit: memory.jsHeapSizeLimit
        }
      };
    }

    return {};
  }

  /**
   * Track network information
   */
  static trackNetworkInfo(): Partial<PerformanceMetrics> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        connectionType: connection.type,
        effectiveConnectionType: connection.effectiveType,
        customMetrics: {
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
      };
    }

    return {};
  }

  private static getFirstContentfulPaint(): number | undefined {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : undefined;
  }

  private static generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Device and Environment Detection Utilities
 */
export class DeviceDetector {
  /**
   * Get comprehensive device information
   */
  static getDeviceInfo(): DeviceInfo {
    return {
      type: this.getDeviceType(),
      browser: this.getBrowserInfo().name,
      browserVersion: this.getBrowserInfo().version,
      os: this.getOSInfo().name,
      osVersion: this.getOSInfo().version,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      touchEnabled: 'ontouchstart' in window,
      cookiesEnabled: navigator.cookieEnabled,
      jsEnabled: true
    };
  }

  /**
   * Get location information
   */
  static getLocationInfo(): LocationInfo {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      currency: this.getCurrencyFromLocale()
    };
  }

  /**
   * Detect device capabilities
   */
  static getDeviceCapabilities(): Record<string, boolean> {
    return {
      webgl: this.supportsWebGL(),
      webrtc: this.supportsWebRTC(),
      localStorage: this.supportsLocalStorage(),
      sessionStorage: this.supportsSessionStorage(),
      indexedDB: this.supportsIndexedDB(),
      serviceWorker: this.supportsServiceWorker(),
      pushNotifications: this.supportsPushNotifications(),
      geolocation: this.supportsGeolocation(),
      camera: this.supportsCamera(),
      microphone: this.supportsMicrophone()
    };
  }

  private static getDeviceType(): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private static getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return { name: 'Chrome', version: match ? match[1] : 'unknown' };
    }
    
    if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return { name: 'Firefox', version: match ? match[1] : 'unknown' };
    }
    
    return { name: 'unknown', version: 'unknown' };
  }

  private static getOSInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) {
      return { name: 'Windows', version: 'unknown' };
    }
    
    if (userAgent.includes('Mac OS')) {
      return { name: 'macOS', version: 'unknown' };
    }
    
    if (userAgent.includes('Linux')) {
      return { name: 'Linux', version: 'unknown' };
    }
    
    return { name: 'unknown', version: 'unknown' };
  }

  private static getCurrencyFromLocale(): string {
    try {
      const formatter = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: 'USD' // Default fallback
      });
      return formatter.resolvedOptions().currency;
    } catch {
      return 'USD';
    }
  }

  // Feature detection methods
  private static supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private static supportsWebRTC(): boolean {
    return !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection);
  }

  private static supportsLocalStorage(): boolean {
    try {
      return typeof Storage !== 'undefined' && window.localStorage !== undefined;
    } catch {
      return false;
    }
  }

  private static supportsSessionStorage(): boolean {
    try {
      return typeof Storage !== 'undefined' && window.sessionStorage !== undefined;
    } catch {
      return false;
    }
  }

  private static supportsIndexedDB(): boolean {
    return 'indexedDB' in window;
  }

  private static supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  private static supportsPushNotifications(): boolean {
    return 'Notification' in window && 'PushManager' in window;
  }

  private static supportsGeolocation(): boolean {
    return 'geolocation' in navigator;
  }

  private static supportsCamera(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private static supportsMicrophone(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

/**
 * Conversion Tracking Utilities
 */
export class ConversionTracker {
  /**
   * Track conversion events
   */
  static trackConversion(
    type: string,
    value?: number,
    currency: string = 'USD',
    properties?: Record<string, any>
  ): ConversionEvent {
    return {
      id: this.generateId(),
      sessionId: '', // Will be filled by service
      timestamp: new Date(),
      type,
      value,
      currency,
      properties
    };
  }

  /**
   * Track goal completions
   */
  static trackGoal(
    goalId: string,
    goalName: string,
    value?: number,
    properties?: Record<string, any>
  ): ConversionEvent {
    return this.trackConversion('goal_completion', value, 'USD', {
      goalId,
      goalName,
      ...properties
    });
  }

  /**
   * Track funnel step completion
   */
  static trackFunnelStep(
    funnelId: string,
    stepId: string,
    stepName: string,
    properties?: Record<string, any>
  ): ConversionEvent {
    return this.trackConversion('funnel_step', 1, 'USD', {
      funnelId,
      stepId,
      stepName,
      ...properties
    });
  }

  private static generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Utility functions for common tracking scenarios
 */
export const TrackingUtils = {
  /**
   * Automatically track clicks on elements with data-track attributes
   */
  setupAutoTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const trackElement = target.closest('[data-track]');
      
      if (trackElement) {
        const category = trackElement.getAttribute('data-track-category') as EventCategory || 'user_interaction';
        const action = trackElement.getAttribute('data-track-action') as EventAction || 'click';
        const label = trackElement.getAttribute('data-track-label') || undefined;
        const value = trackElement.getAttribute('data-track-value');
        
        // This would be sent to the analytics service
        console.log('Auto-tracked event:', {
          category,
          action,
          label,
          value: value ? parseFloat(value) : undefined
        });
      }
    });
  },

  /**
   * Track scroll depth
   */
  trackScrollDepth(): void {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track threshold milestones
        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            
            // This would be sent to the analytics service
            console.log('Scroll depth tracked:', {
              category: 'user_interaction',
              action: 'scroll',
              label: 'scroll_depth',
              value: threshold
            });
          }
        });
      }
    };

    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScroll, 100);
    });
  },

  /**
   * Track time on page
   */
  trackTimeOnPage(): () => void {
    const startTime = Date.now();
    let isActive = true;
    let totalTime = 0;
    let lastActiveTime = startTime;

    // Track when user becomes inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        totalTime += Date.now() - lastActiveTime;
        isActive = false;
      } else {
        lastActiveTime = Date.now();
        isActive = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      if (isActive) {
        totalTime += Date.now() - lastActiveTime;
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // This would be sent to the analytics service
      console.log('Time on page tracked:', {
        category: 'user_interaction',
        action: 'view',
        label: 'time_on_page',
        value: Math.round(totalTime / 1000) // Convert to seconds
      });
    };
  }
};

// Export main tracking classes
export { EventTracker, PerformanceTracker, DeviceDetector, ConversionTracker }; 