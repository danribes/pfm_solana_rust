/**
 * Notification Analytics Service
 * 
 * Core service for notification system integration, user segmentation,
 * behavioral triggers, delivery optimization, and analytics tracking.
 */

import {
  NotificationAnalyticsService,
  NotificationAnalyticsConfig,
  NotificationAnalyticsEvent,
  UserSegment,
  NotificationChannel,
  NotificationAnalytics,
  AnalyticsFilters,
  NotificationAnalyticsError
} from '../types/notificationAnalytics';

import { 
  createNotificationAnalyticsConfig, 
  NOTIFICATION_ANALYTICS_ENDPOINTS
} from '../config/notificationAnalytics';

import analyticsService from './analytics';

/**
 * Notification Analytics Service Implementation
 * Singleton pattern for centralized notification analytics management
 */
class NotificationAnalyticsServiceImpl implements NotificationAnalyticsService {
  private static instance: NotificationAnalyticsServiceImpl;
  private config: NotificationAnalyticsConfig;
  private eventBuffer: NotificationAnalyticsEvent[] = [];
  private flushInterval?: NodeJS.Timeout;
  private isInitialized = false;
  private userSegmentCache: Map<string, UserSegment[]> = new Map();

  constructor() {
    this.config = createNotificationAnalyticsConfig();
  }

  public static getInstance(): NotificationAnalyticsServiceImpl {
    if (!NotificationAnalyticsServiceImpl.instance) {
      NotificationAnalyticsServiceImpl.instance = new NotificationAnalyticsServiceImpl();
    }
    return NotificationAnalyticsServiceImpl.instance;
  }

  // Initialization
  public async initialize(config?: Partial<NotificationAnalyticsConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Merge configuration
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Start auto-flush if enabled
      if (this.config.flushInterval > 0) {
        this.startAutoFlush();
      }

      // Set up behavioral triggers
      await this.setupBehavioralTriggers();

      this.isInitialized = true;
      console.log('Notification Analytics Service initialized successfully');
    } catch (error) {
      throw new NotificationAnalyticsError(
        `Failed to initialize notification analytics: ${error.message}`,
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

    // Clear caches
    this.userSegmentCache.clear();

    this.isInitialized = false;
  }

  // Event Tracking
  public async trackEvent(event: NotificationAnalyticsEvent): Promise<void> {
    if (!this.isEnabled()) return;

    // Validate event
    this.validateEvent(event);

    // Add to buffer
    this.eventBuffer.push(event);

    // Check buffer size
    if (this.eventBuffer.length >= this.config.bufferSize) {
      await this.flush();
    }

    // Also track in main analytics service for cross-referencing
    if (event.type === 'clicked' || event.type === 'opened') {
      await analyticsService.track({
        category: 'user_interaction',
        action: event.type === 'clicked' ? 'click' : 'view',
        label: 'notification',
        properties: {
          notificationId: event.notificationId,
          notificationData: event.data
        }
      });
    }
  }

  public async batchTrackEvents(events: NotificationAnalyticsEvent[]): Promise<void> {
    if (!this.isEnabled()) return;

    // Validate all events
    events.forEach(event => this.validateEvent(event));

    // Add to buffer
    this.eventBuffer.push(...events);

    // Check if we need to flush
    if (this.eventBuffer.length >= this.config.bufferSize) {
      await this.flush();
    }
  }

  // User Management
  public async identifyUser(userId: string, traits: Record<string, any>): Promise<void> {
    try {
      // Calculate user segments based on traits
      const segments = await this.calculateUserSegments(userId, traits);
      this.userSegmentCache.set(userId, segments);

      // Track identification event
      await this.trackEvent({
        id: this.generateId(),
        type: 'converted',
        notificationId: 'user_identification',
        userId,
        timestamp: new Date(),
        data: {
          traits,
          segments: segments.map(s => s.toString()),
          eventType: 'user_identification'
        }
      });
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  public async updateUserSegments(userId: string): Promise<UserSegment[]> {
    try {
      // Get user data
      const userData = await this.getUserData(userId);
      
      // Calculate segments
      const segments = await this.calculateUserSegments(userId, userData);
      
      // Update cache
      this.userSegmentCache.set(userId, segments);
      
      return segments;
    } catch (error) {
      console.error('Failed to update user segments:', error);
      return this.userSegmentCache.get(userId) || [];
    }
  }

  // Analytics
  public async generateAnalytics(filters: AnalyticsFilters): Promise<NotificationAnalytics> {
    try {
      const analytics: NotificationAnalytics = {
        id: this.generateId(),
        timeframe: filters.timeframe,
        deliveryMetrics: await this.calculateDeliveryMetrics(filters),
        engagementMetrics: await this.calculateEngagementMetrics(filters),
        conversionMetrics: await this.calculateConversionMetrics(filters),
        generatedAt: new Date()
      };

      return analytics;
    } catch (error) {
      throw new NotificationAnalyticsError(
        `Failed to generate analytics: ${error.message}`,
        'ANALYTICS_FAILED',
        { filters }
      );
    }
  }

  // Configuration
  public updateConfig(config: Partial<NotificationAnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart auto-flush if interval changed
    if (config.flushInterval !== undefined) {
      this.stopAutoFlush();
      if (this.config.flushInterval > 0) {
        this.startAutoFlush();
      }
    }
  }

  public getConfig(): NotificationAnalyticsConfig {
    return { ...this.config };
  }

  // User Segmentation
  public async getUserSegments(userId: string): Promise<UserSegment[]> {
    // Check cache first
    const cached = this.userSegmentCache.get(userId);
    if (cached) {
      return cached;
    }

    // Calculate segments
    return await this.updateUserSegments(userId);
  }

  // Optimization
  public async getOptimalSendTime(userId: string, templateId: string): Promise<Date> {
    try {
      // Get user engagement patterns
      const engagementPattern = await this.getUserEngagementPattern(userId);
      
      // Calculate optimal time based on patterns
      const optimalHour = this.calculateOptimalHour(engagementPattern);
      
      // Create date for optimal time
      const optimalTime = new Date();
      optimalTime.setHours(optimalHour, 0, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (optimalTime <= new Date()) {
        optimalTime.setDate(optimalTime.getDate() + 1);
      }

      return optimalTime;
    } catch (error) {
      console.error('Failed to calculate optimal send time:', error);
      return new Date(); // Fallback to immediate sending
    }
  }

  public async getOptimalChannel(userId: string, templateId: string): Promise<NotificationChannel> {
    try {
      // Get channel performance for user
      const channelPerformance = await this.getChannelPerformance(userId);

      // Find best performing channel
      let bestChannel: NotificationChannel = 'in_app';
      let bestScore = 0;

      for (const [channel, performance] of Object.entries(channelPerformance)) {
        const score = performance.openRate * 0.4 + performance.clickRate * 0.6;
        if (score > bestScore) {
          bestScore = score;
          bestChannel = channel as NotificationChannel;
        }
      }

      return bestChannel;
    } catch (error) {
      console.error('Failed to calculate optimal channel:', error);
      return 'in_app'; // Fallback to in-app notifications
    }
  }

  // Behavioral Triggers
  private async setupBehavioralTriggers(): Promise<void> {
    // Listen to analytics events for trigger conditions
    analyticsService.on('analytics:event', (event) => {
      this.evaluateTriggers(event);
    });
  }

  private async evaluateTriggers(event: any): Promise<void> {
    // Simple trigger evaluation for common scenarios
    try {
      // New user welcome trigger
      if (event.category === 'user_interaction' && event.action === 'create' && event.label === 'user_registration') {
        await this.executeTrigger('welcome_new_user', event);
      }

      // Community creation trigger
      if (event.category === 'community' && event.action === 'create') {
        await this.executeTrigger('community_created', event);
      }

      // Voting reminder trigger
      if (event.category === 'voting' && event.action === 'view') {
        await this.executeTrigger('vote_reminder', event);
      }
    } catch (error) {
      console.error('Failed to evaluate triggers:', error);
    }
  }

  private async executeTrigger(triggerName: string, event: any): Promise<void> {
    console.log(`Executing trigger: ${triggerName} for event:`, event);
    
    // Track trigger execution
    await this.trackEvent({
      id: this.generateId(),
      type: 'sent',
      notificationId: `triggered_${triggerName}_${Date.now()}`,
      userId: event.userId || 'unknown',
      timestamp: new Date(),
      data: {
        triggerName,
        sourceEvent: event
      }
    });
  }

  // Private Helper Methods
  private isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }

  private validateEvent(event: NotificationAnalyticsEvent): void {
    if (!event.id || !event.notificationId || !event.userId || !event.timestamp) {
      throw new NotificationAnalyticsError(
        'Invalid notification analytics event: missing required fields',
        'INVALID_EVENT',
        { event }
      );
    }

    const validTypes = ['sent', 'delivered', 'opened', 'clicked', 'dismissed', 'converted', 'failed'];
    if (!validTypes.includes(event.type)) {
      throw new NotificationAnalyticsError(
        `Invalid event type: ${event.type}`,
        'INVALID_EVENT_TYPE',
        { event }
      );
    }
  }

  private async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await this.sendEventsToAPI(events);
    } catch (error) {
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...events);
      throw new NotificationAnalyticsError(
        `Failed to flush events: ${error.message}`,
        'FLUSH_FAILED',
        { eventCount: events.length }
      );
    }
  }

  private async sendEventsToAPI(events: NotificationAnalyticsEvent[]): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}${NOTIFICATION_ANALYTICS_ENDPOINTS.track}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ events }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send events to API:', error);
      throw error;
    }
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

  private async calculateUserSegments(userId: string, userData: Record<string, any>): Promise<UserSegment[]> {
    const segments: UserSegment[] = [];

    // Simple segmentation logic
    const user = userData.user || {};
    const analytics = userData.analytics || {};

    // New users (joined within last 7 days)
    if (user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      segments.push('new_users');
    }

    // Active users (active within last 7 days)
    if (user.lastActiveAt && new Date(user.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      segments.push('active_users');
    } else if (user.lastActiveAt && new Date(user.lastActiveAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      segments.push('inactive_users');
    }

    // Community owners
    if (user.role === 'community_owner') {
      segments.push('community_owners');
    }

    // Community members
    if (user.communities && user.communities.length > 0) {
      segments.push('community_members');
    }

    // Blockchain users
    if (user.walletConnected) {
      segments.push('blockchain_users');
    }

    // Power users
    if (analytics.sessionsLast30Days > 20 && analytics.avgSessionDuration > 300000) {
      segments.push('power_users');
    }

    // Voters
    if (analytics.votesLast30Days > 0) {
      segments.push('voters');
    }

    // Device-based segments
    if (analytics.primaryDeviceType === 'mobile') {
      segments.push('mobile_users');
    } else if (analytics.primaryDeviceType === 'desktop') {
      segments.push('desktop_users');
    }

    // At-risk users
    if (analytics.engagementScore < 0.3 && user.lastActiveAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
      segments.push('at_risk_users');
    }

    // High-value users
    if (analytics.engagementScore > 0.8 && analytics.communitiesOwned > 0) {
      segments.push('high_value_users');
    }

    return segments;
  }

  private async getUserData(userId: string): Promise<Record<string, any>> {
    // Mock user data - in real implementation, this would come from user service
    return {
      user: {
        id: userId,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        role: Math.random() > 0.8 ? 'community_owner' : 'member',
        walletConnected: Math.random() > 0.6,
        communities: Math.random() > 0.3 ? ['community1'] : []
      },
      analytics: {
        sessionsLast30Days: Math.floor(Math.random() * 50),
        avgSessionDuration: Math.floor(Math.random() * 600000),
        votesLast30Days: Math.floor(Math.random() * 10),
        engagementScore: Math.random(),
        primaryDeviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
        communitiesOwned: Math.floor(Math.random() * 3)
      }
    };
  }

  private async calculateDeliveryMetrics(filters: AnalyticsFilters): Promise<any> {
    return {
      totalSent: 1000,
      totalDelivered: 950,
      totalFailed: 50,
      deliveryRate: 0.95,
      failureRate: 0.05,
      averageDeliveryTime: 1200
    };
  }

  private async calculateEngagementMetrics(filters: AnalyticsFilters): Promise<any> {
    return {
      totalOpened: 400,
      totalClicked: 120,
      totalDismissed: 50,
      openRate: 0.42,
      clickRate: 0.13,
      clickThroughRate: 0.30,
      dismissalRate: 0.05,
      averageTimeToOpen: 15,
      averageTimeToClick: 5,
      averageEngagementDuration: 30
    };
  }

  private async calculateConversionMetrics(filters: AnalyticsFilters): Promise<any> {
    return {
      totalConversions: 25,
      conversionRate: 0.025,
      conversionValue: 1250,
      averageConversionTime: 120,
      attributedRevenue: 2500,
      costPerConversion: 2.5,
      returnOnInvestment: 5.0
    };
  }

  private async getUserEngagementPattern(userId: string): Promise<number[]> {
    // Mock hourly engagement pattern (24 hours)
    const pattern = new Array(24).fill(0).map(() => Math.random());
    
    // Make certain hours more likely (simulate peak hours)
    pattern[9] *= 1.5;  // 9 AM
    pattern[12] *= 1.3; // 12 PM
    pattern[15] *= 1.4; // 3 PM
    pattern[19] *= 1.6; // 7 PM
    
    return pattern;
  }

  private calculateOptimalHour(engagementPattern: number[]): number {
    let maxEngagement = 0;
    let optimalHour = 9; // Default to 9 AM
    
    engagementPattern.forEach((engagement, hour) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        optimalHour = hour;
      }
    });
    
    return optimalHour;
  }

  private async getChannelPerformance(userId: string): Promise<Record<string, any>> {
    // Mock channel performance data
    return {
      push: { openRate: 0.3, clickRate: 0.1 },
      in_app: { openRate: 0.8, clickRate: 0.2 },
      email: { openRate: 0.25, clickRate: 0.05 },
      sms: { openRate: 0.95, clickRate: 0.15 }
    };
  }

  private generateId(): string {
    return `na_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const notificationAnalyticsService = NotificationAnalyticsServiceImpl.getInstance();
export default notificationAnalyticsService; 