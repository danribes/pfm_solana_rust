/**
 * Analytics Service
 * 
 * Core service for analytics integration, event tracking, performance monitoring,
 * and data analysis in the PFM application.
 */

import {
  AnalyticsService,
  AnalyticsConfig,
  AnalyticsEvent,
  PageView,
  ErrorEvent,
  PerformanceMetrics,
  UserSession,
  ConversionEvent,
  RealTimeMetrics,
  AnalyticsReport,
  AnalyticsEvents,
  AnalyticsError,
  EventCategory,
  EventAction,
  DeviceInfo,
  LocationInfo
} from '../types/analytics';

import { createAnalyticsConfig, ANALYTICS_ENDPOINTS } from '../config/analytics';

/**
 * Analytics Service Implementation
 * Singleton pattern for centralized analytics management
 */
class AnalyticsServiceImpl implements AnalyticsService {
  private static instance: AnalyticsServiceImpl;
  private config: AnalyticsConfig;
  private eventListeners: Map<keyof AnalyticsEvents, Set<Function>> = new Map();
  private eventBuffer: AnalyticsEvent[] = [];
  private flushInterval?: NodeJS.Timeout;
  private currentSession: UserSession | null = null;
  private currentUserId: string | null = null;
  private userProperties: Record<string, any> = {};
  private isInitialized = false;
  private deviceInfo: DeviceInfo | null = null;
  private locationInfo: LocationInfo | null = null;

  constructor() {
    this.config = createAnalyticsConfig();
  }

  public static getInstance(): AnalyticsServiceImpl {
    if (!AnalyticsServiceImpl.instance) {
      AnalyticsServiceImpl.instance = new AnalyticsServiceImpl();
    }
    return AnalyticsServiceImpl.instance;
  }

  // Initialization
  public async initialize(config?: Partial<AnalyticsConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Merge configuration
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize device and location info
      await this.initializeDeviceInfo();
      await this.initializeLocationInfo();

      // Start auto-flush if enabled
      if (this.config.flushInterval > 0) {
        this.startAutoFlush();
      }

      // Initialize providers
      await this.initializeProviders();

      // Start session tracking
      await this.startSession();

      // Set up page visibility listener
      this.setupPageVisibilityListener();

      // Set up performance monitoring
      if (this.config.collectPerformanceData) {
        this.setupPerformanceMonitoring();
      }

      // Set up error tracking
      if (this.config.collectErrorData) {
        this.setupErrorTracking();
      }

      this.isInitialized = true;
      this.emit('analytics:session_start', this.currentSession!);
    } catch (error) {
      throw new AnalyticsError(
        `Failed to initialize analytics: ${error.message}`,
        'INIT_FAILED',
        { config: this.config }
      );
    }
  }

  public async shutdown(): Promise<void> {
    // Flush remaining events
    await this.flush();

    // Stop auto-flush
    this.stopAutoFlush();

    // End session
    await this.endSession();

    // Clear event listeners
    this.eventListeners.clear();

    // Shutdown providers
    await this.shutdownProviders();

    this.isInitialized = false;
  }

  // Event Tracking
  public async track(event: Partial<AnalyticsEvent>): Promise<void> {
    if (!this.isEnabled()) return;

    const fullEvent: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      sessionId: this.currentSession?.sessionId || '',
      userId: this.currentUserId || undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || undefined,
      ...event,
      category: event.category || 'user_interaction',
      action: event.action || 'click'
    };

    // Add to buffer
    this.eventBuffer.push(fullEvent);

    // Check buffer size
    if (this.eventBuffer.length >= this.config.bufferSize) {
      await this.flush();
    }

    // Emit event
    this.emit('analytics:event', fullEvent);

    // Update session
    if (this.currentSession) {
      this.currentSession.events++;
    }
  }

  public async trackPageView(pageView: Partial<PageView>): Promise<void> {
    if (!this.isEnabled()) return;

    const fullPageView: PageView = {
      id: this.generateId(),
      sessionId: this.currentSession?.sessionId || '',
      userId: this.currentUserId || undefined,
      url: window.location.href,
      title: document.title,
      timestamp: new Date(),
      referrer: document.referrer || undefined,
      ...pageView
    };

    // Track as event
    await this.track({
      category: 'navigation',
      action: 'view',
      label: fullPageView.url,
      properties: {
        title: fullPageView.title,
        referrer: fullPageView.referrer
      }
    });

    // Emit page view event
    this.emit('analytics:pageview', fullPageView);

    // Update session
    if (this.currentSession) {
      this.currentSession.pageViews++;
      if (this.currentSession.pageViews === 1) {
        this.currentSession.entryPage = fullPageView.url;
      }
      this.currentSession.exitPage = fullPageView.url;
    }
  }

  public async trackError(error: Partial<ErrorEvent>): Promise<void> {
    if (!this.isEnabled() || !this.config.collectErrorData) return;

    const fullError: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      sessionId: this.currentSession?.sessionId || '',
      userId: this.currentUserId || undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: 'medium',
      category: 'javascript',
      ...error,
      message: error.message || 'Unknown error'
    };

    // Track as event
    await this.track({
      category: 'error',
      action: 'error',
      label: fullError.category,
      value: this.getSeverityValue(fullError.severity),
      properties: {
        message: fullError.message,
        stack: fullError.stack,
        source: fullError.source
      }
    });

    // Emit error event
    this.emit('analytics:error', fullError);
  }

  public async trackPerformance(metrics: Partial<PerformanceMetrics>): Promise<void> {
    if (!this.isEnabled() || !this.config.collectPerformanceData) return;

    const fullMetrics: PerformanceMetrics = {
      id: this.generateId(),
      timestamp: new Date(),
      sessionId: this.currentSession?.sessionId || '',
      url: window.location.href,
      ...metrics
    };

    // Track as event
    await this.track({
      category: 'performance',
      action: 'load',
      label: 'page_performance',
      value: fullMetrics.loadComplete,
      properties: {
        firstContentfulPaint: fullMetrics.firstContentfulPaint,
        largestContentfulPaint: fullMetrics.largestContentfulPaint,
        firstInputDelay: fullMetrics.firstInputDelay,
        cumulativeLayoutShift: fullMetrics.cumulativeLayoutShift
      }
    });

    // Emit performance event
    this.emit('analytics:performance', fullMetrics);
  }

  // User Management
  public async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    this.currentUserId = userId;
    
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
    }

    // Update current session
    if (this.currentSession) {
      this.currentSession.userId = userId;
    }

    // Track identification event
    await this.track({
      category: 'user_interaction',
      action: 'identify',
      label: 'user_identified',
      properties: {
        userId,
        ...properties
      }
    });
  }

  public async setUserProperties(properties: Record<string, any>): Promise<void> {
    this.userProperties = { ...this.userProperties, ...properties };

    // Track user properties update
    await this.track({
      category: 'user_interaction',
      action: 'update',
      label: 'user_properties',
      properties
    });
  }

  // Session Management
  public async startSession(): Promise<void> {
    if (this.currentSession) {
      await this.endSession();
    }

    this.currentSession = {
      sessionId: this.generateSessionId(),
      userId: this.currentUserId || undefined,
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      bounced: true,
      converted: false,
      entryPage: window.location.href,
      device: this.deviceInfo!,
      location: this.locationInfo!
    };

    // Track session start
    await this.track({
      category: 'system',
      action: 'start',
      label: 'session_start',
      properties: {
        sessionId: this.currentSession.sessionId,
        entryPage: this.currentSession.entryPage
      }
    });
  }

  public async endSession(): Promise<void> {
    if (!this.currentSession) return;

    const endTime = new Date();
    this.currentSession.endTime = endTime;
    this.currentSession.duration = endTime.getTime() - this.currentSession.startTime.getTime();

    // Determine if session bounced (single page, short duration)
    this.currentSession.bounced = this.currentSession.pageViews <= 1 && 
                                  this.currentSession.duration < 30000; // 30 seconds

    // Track session end
    await this.track({
      category: 'system',
      action: 'end',
      label: 'session_end',
      value: this.currentSession.duration,
      properties: {
        sessionId: this.currentSession.sessionId,
        duration: this.currentSession.duration,
        pageViews: this.currentSession.pageViews,
        events: this.currentSession.events,
        bounced: this.currentSession.bounced
      }
    });

    this.emit('analytics:session_end', this.currentSession);
    this.currentSession = null;
  }

  public getCurrentSession(): UserSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  // Data Collection
  public async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Send to enabled providers
      await Promise.all(
        this.config.providers
          .filter(provider => provider.enabled)
          .map(provider => this.sendToProvider(provider, events))
      );

      // Send to custom API
      await this.sendToCustomAPI(events);

      this.emit('analytics:flush', { events: events.length, timestamp: new Date() });
    } catch (error) {
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...events);
      throw new AnalyticsError(
        `Failed to flush events: ${error.message}`,
        'FLUSH_FAILED',
        { eventCount: events.length }
      );
    }
  }

  public getBufferedEvents(): AnalyticsEvent[] {
    return [...this.eventBuffer];
  }

  public clearBuffer(): void {
    this.eventBuffer = [];
  }

  // Configuration
  public updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart auto-flush if interval changed
    if (config.flushInterval !== undefined) {
      this.stopAutoFlush();
      if (this.config.flushInterval > 0) {
        this.startAutoFlush();
      }
    }
  }

  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // Reporting
  public async generateReport(config: Partial<AnalyticsReport>): Promise<AnalyticsReport> {
    try {
      const response = await fetch(`${ANALYTICS_ENDPOINTS.base}${ANALYTICS_ENDPOINTS.reports}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new AnalyticsError(
        `Failed to generate report: ${error.message}`,
        'REPORT_FAILED',
        { config }
      );
    }
  }

  public async getRealtimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(`${ANALYTICS_ENDPOINTS.base}${ANALYTICS_ENDPOINTS.realtime}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new AnalyticsError(
        `Failed to get realtime metrics: ${error.message}`,
        'REALTIME_FAILED'
      );
    }
  }

  // Events
  public on<K extends keyof AnalyticsEvents>(
    event: K, 
    handler: (data: AnalyticsEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  public off<K extends keyof AnalyticsEvents>(
    event: K, 
    handler: (data: AnalyticsEvents[K]) => void
  ): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public emit<K extends keyof AnalyticsEvents>(event: K, data: AnalyticsEvents[K]): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in analytics event handler for ${event}:`, error);
        }
      });
    }
  }

  // Private Methods
  private isEnabled(): boolean {
    if (!this.config.enabled || !this.isInitialized) return false;
    
    // Respect Do Not Track
    if (this.config.respectDoNotTrack && navigator.doNotTrack === '1') return false;
    
    // Apply sampling rate
    return Math.random() < this.config.samplingRate;
  }

  private async initializeDeviceInfo(): Promise<void> {
    this.deviceInfo = {
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

  private async initializeLocationInfo(): Promise<void> {
    this.locationInfo = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };

    // Get additional location info from API if available
    try {
      const response = await fetch('/api/location');
      if (response.ok) {
        const locationData = await response.json();
        this.locationInfo = { ...this.locationInfo, ...locationData };
      }
    } catch (error) {
      // Silently fail - location info is optional
    }
  }

  private async initializeProviders(): Promise<void> {
    // Initialize each enabled provider
    for (const provider of this.config.providers) {
      if (!provider.enabled) continue;

      try {
        await this.initializeProvider(provider);
      } catch (error) {
        console.error(`Failed to initialize provider ${provider.name}:`, error);
      }
    }
  }

  private async initializeProvider(provider: any): Promise<void> {
    // Provider-specific initialization logic would go here
    // This is a simplified version
    console.log(`Initializing analytics provider: ${provider.name}`);
  }

  private async shutdownProviders(): Promise<void> {
    // Shutdown logic for providers
  }

  private setupPageVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush(); // Flush events when page becomes hidden
      }
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          
          this.trackPerformance({
            largestContentfulPaint: lcp.startTime
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackPerformance({
              firstInputDelay: entry.processingStart - entry.startTime
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (error) {
        console.warn('FID observer not supported');
      }
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.trackPerformance({
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: this.getFirstContentfulPaint()
        });
      }, 0);
    });
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        severity: 'high',
        category: 'javascript'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'high',
        category: 'javascript'
      });
    });
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch(error => {
        console.error('Auto-flush failed:', error);
      });
    }, this.config.flushInterval);
  }

  private stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = undefined;
    }
  }

  private async sendToCustomAPI(events: AnalyticsEvent[]): Promise<void> {
    try {
      const response = await fetch(`${ANALYTICS_ENDPOINTS.base}${ANALYTICS_ENDPOINTS.events}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send events to custom API:', error);
      throw error;
    }
  }

  private async sendToProvider(provider: any, events: AnalyticsEvent[]): Promise<void> {
    // Provider-specific sending logic would go here
    console.log(`Sending ${events.length} events to ${provider.name}`);
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return { name: 'Chrome', version: match ? match[1] : 'unknown' };
    }
    
    if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return { name: 'Firefox', version: match ? match[1] : 'unknown' };
    }
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/(\d+)/);
      return { name: 'Safari', version: match ? match[1] : 'unknown' };
    }
    
    return { name: 'unknown', version: 'unknown' };
  }

  private getOSInfo(): { name: string; version: string } {
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
    
    if (userAgent.includes('Android')) {
      return { name: 'Android', version: 'unknown' };
    }
    
    if (userAgent.includes('iOS')) {
      return { name: 'iOS', version: 'unknown' };
    }
    
    return { name: 'unknown', version: 'unknown' };
  }

  private getFirstContentfulPaint(): number | undefined {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : undefined;
  }

  private getSeverityValue(severity: string): number {
    const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
    return severityMap[severity] || 2;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const analyticsService = AnalyticsServiceImpl.getInstance();
export default analyticsService; 