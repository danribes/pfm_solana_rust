/**
 * Targeting Utilities
 * 
 * Comprehensive utilities for notification targeting, user segmentation,
 * behavioral analysis, and smart delivery optimization.
 */

import {
  UserSegment,
  NotificationChannel,
  UserSegmentDefinition,
  SegmentCriteria,
  BehaviorTrigger,
  TriggerEventCriteria,
  NotificationPriority,
  TimeWindow
} from '../types/notificationAnalytics';

import { USER_SEGMENT_DEFINITIONS, OPTIMIZATION_SETTINGS } from '../config/notificationAnalytics';

/**
 * User Segmentation Utilities
 */
export class UserSegmentationEngine {
  /**
   * Calculate user segments based on user data and analytics
   */
  static calculateUserSegments(userData: Record<string, any>): UserSegment[] {
    const segments: UserSegment[] = [];

    // Evaluate each segment definition
    for (const [segment, definition] of Object.entries(USER_SEGMENT_DEFINITIONS)) {
      if (this.evaluateSegmentCriteria(userData, definition.criteria)) {
        segments.push(segment as UserSegment);
      }
    }

    return segments;
  }

  /**
   * Evaluate segment criteria against user data
   */
  static evaluateSegmentCriteria(userData: Record<string, any>, criteria: SegmentCriteria[]): boolean {
    return criteria.every(criterion => {
      const fieldValue = this.getNestedValue(userData, criterion.field);
      return this.evaluateCriterion(fieldValue, criterion.operator, criterion.value);
    });
  }

  /**
   * Evaluate a single criterion
   */
  static evaluateCriterion(fieldValue: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue;
      case 'not_equals':
        return fieldValue !== targetValue;
      case 'greater_than':
        return Number(fieldValue) > Number(targetValue);
      case 'less_than':
        return Number(fieldValue) < Number(targetValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      case 'in':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get nested object value by path
   */
  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate segment overlap between multiple segments
   */
  static calculateSegmentOverlap(segments1: UserSegment[], segments2: UserSegment[]): {
    overlap: UserSegment[];
    unique1: UserSegment[];
    unique2: UserSegment[];
    overlapPercentage: number;
  } {
    const set1 = new Set(segments1);
    const set2 = new Set(segments2);
    
    const overlap = segments1.filter(s => set2.has(s));
    const unique1 = segments1.filter(s => !set2.has(s));
    const unique2 = segments2.filter(s => !set1.has(s));
    
    const totalUnique = new Set([...segments1, ...segments2]).size;
    const overlapPercentage = totalUnique > 0 ? (overlap.length / totalUnique) * 100 : 0;

    return {
      overlap,
      unique1,
      unique2,
      overlapPercentage
    };
  }

  /**
   * Get segment priority score for targeting
   */
  static getSegmentPriorityScore(segment: UserSegment): number {
    const definition = USER_SEGMENT_DEFINITIONS[segment];
    if (!definition) return 0;

    // Higher priority segments get higher scores
    const priorityScore = (5 - definition.priority) * 20; // 20-80 points
    
    // Smaller segments get bonus points (more targeted)
    const sizeBonus = Math.max(0, 100 - definition.estimatedSize) / 10; // 0-10 points
    
    return priorityScore + sizeBonus;
  }
}

/**
 * Behavioral Targeting Engine
 */
export class BehavioralTargetingEngine {
  /**
   * Analyze user behavior patterns for targeting
   */
  static analyzeBehaviorPatterns(userEvents: any[]): {
    engagementScore: number;
    preferredChannels: NotificationChannel[];
    optimalTimes: number[];
    interactionTypes: string[];
    frequencyTolerance: number;
  } {
    if (!userEvents || userEvents.length === 0) {
      return this.getDefaultBehaviorPattern();
    }

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(userEvents);
    
    // Determine preferred channels
    const preferredChannels = this.calculatePreferredChannels(userEvents);
    
    // Find optimal times
    const optimalTimes = this.calculateOptimalTimes(userEvents);
    
    // Analyze interaction types
    const interactionTypes = this.analyzeInteractionTypes(userEvents);
    
    // Calculate frequency tolerance
    const frequencyTolerance = this.calculateFrequencyTolerance(userEvents);

    return {
      engagementScore,
      preferredChannels,
      optimalTimes,
      interactionTypes,
      frequencyTolerance
    };
  }

  /**
   * Calculate user engagement score (0-1)
   */
  static calculateEngagementScore(userEvents: any[]): number {
    if (userEvents.length === 0) return 0;

    let totalScore = 0;
    let weightedActions = 0;

    userEvents.forEach(event => {
      let actionWeight = 0;
      
      switch (event.action) {
        case 'click':
          actionWeight = 3;
          break;
        case 'view':
          actionWeight = 1;
          break;
        case 'share':
          actionWeight = 4;
          break;
        case 'vote':
          actionWeight = 5;
          break;
        case 'create':
          actionWeight = 5;
          break;
        default:
          actionWeight = 1;
      }

      totalScore += actionWeight;
      weightedActions += actionWeight;
    });

    // Normalize to 0-1 scale
    const maxPossibleScore = userEvents.length * 5; // Max weight is 5
    return Math.min(1, totalScore / maxPossibleScore);
  }

  /**
   * Calculate preferred notification channels
   */
  static calculatePreferredChannels(userEvents: any[]): NotificationChannel[] {
    const channelEngagement: Record<string, { opens: number; clicks: number; total: number }> = {};

    // Analyze channel performance from events
    userEvents.forEach(event => {
      const channel = event.properties?.channel || 'in_app';
      
      if (!channelEngagement[channel]) {
        channelEngagement[channel] = { opens: 0, clicks: 0, total: 0 };
      }

      channelEngagement[channel].total++;
      
      if (event.action === 'view') {
        channelEngagement[channel].opens++;
      } else if (event.action === 'click') {
        channelEngagement[channel].clicks++;
      }
    });

    // Calculate engagement scores for each channel
    const channelScores = Object.entries(channelEngagement).map(([channel, data]) => {
      const openRate = data.total > 0 ? data.opens / data.total : 0;
      const clickRate = data.opens > 0 ? data.clicks / data.opens : 0;
      const score = (openRate * 0.3) + (clickRate * 0.7); // Weight clicks higher
      
      return { channel: channel as NotificationChannel, score };
    });

    // Sort by score and return top channels
    return channelScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.channel);
  }

  /**
   * Calculate optimal notification times (hours of day)
   */
  static calculateOptimalTimes(userEvents: any[]): number[] {
    const hourlyActivity = new Array(24).fill(0);

    // Analyze activity by hour
    userEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyActivity[hour]++;
    });

    // Find peak activity hours
    const maxActivity = Math.max(...hourlyActivity);
    const threshold = maxActivity * 0.7; // 70% of peak activity

    const optimalHours: number[] = [];
    hourlyActivity.forEach((activity, hour) => {
      if (activity >= threshold) {
        optimalHours.push(hour);
      }
    });

    // If no clear patterns, return common engagement hours
    if (optimalHours.length === 0) {
      return [9, 12, 15, 19]; // 9 AM, 12 PM, 3 PM, 7 PM
    }

    return optimalHours;
  }

  /**
   * Analyze interaction types to understand user preferences
   */
  static analyzeInteractionTypes(userEvents: any[]): string[] {
    const interactionCounts: Record<string, number> = {};

    userEvents.forEach(event => {
      const interaction = `${event.category}_${event.action}`;
      interactionCounts[interaction] = (interactionCounts[interaction] || 0) + 1;
    });

    return Object.entries(interactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([interaction]) => interaction);
  }

  /**
   * Calculate user's tolerance for notification frequency
   */
  static calculateFrequencyTolerance(userEvents: any[]): number {
    if (userEvents.length === 0) return 0.5; // Default moderate tolerance

    // Analyze notification-related events
    const notificationEvents = userEvents.filter(event => 
      event.label === 'notification' || event.category === 'notification'
    );

    if (notificationEvents.length === 0) return 0.5;

    // Calculate dismiss rate
    const dismissEvents = notificationEvents.filter(event => 
      event.action === 'dismiss' || event.properties?.dismissed
    );

    const dismissRate = dismissEvents.length / notificationEvents.length;

    // Lower dismiss rate = higher tolerance
    return Math.max(0.1, Math.min(1, 1 - dismissRate));
  }

  /**
   * Get default behavior pattern for new users
   */
  static getDefaultBehaviorPattern(): {
    engagementScore: number;
    preferredChannels: NotificationChannel[];
    optimalTimes: number[];
    interactionTypes: string[];
    frequencyTolerance: number;
  } {
    return {
      engagementScore: 0.5,
      preferredChannels: ['in_app', 'push', 'email'],
      optimalTimes: [9, 12, 15, 19],
      interactionTypes: ['user_interaction_view', 'navigation_view'],
      frequencyTolerance: 0.5
    };
  }
}

/**
 * Smart Targeting Engine
 */
export class SmartTargetingEngine {
  /**
   * Calculate optimal notification delivery parameters
   */
  static calculateOptimalDelivery(
    userSegments: UserSegment[],
    behaviorPattern: any,
    notificationContext: {
      priority: NotificationPriority;
      category: string;
      urgency?: boolean;
    }
  ): {
    optimalChannel: NotificationChannel;
    optimalTime: Date;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    let confidence = 0.5;

    // Channel optimization
    const optimalChannel = this.selectOptimalChannel(
      userSegments,
      behaviorPattern,
      notificationContext
    );
    reasoning.push(`Selected ${optimalChannel} based on user preferences and behavior`);

    // Time optimization
    const optimalTime = this.selectOptimalTime(
      behaviorPattern,
      notificationContext
    );
    reasoning.push(`Scheduled for ${optimalTime.toLocaleTimeString()} based on user activity patterns`);

    // Calculate confidence based on data quality
    confidence = this.calculateDeliveryConfidence(userSegments, behaviorPattern);
    reasoning.push(`Confidence: ${Math.round(confidence * 100)}% based on available user data`);

    return {
      optimalChannel,
      optimalTime,
      confidence,
      reasoning
    };
  }

  /**
   * Select optimal channel based on user data and context
   */
  static selectOptimalChannel(
    userSegments: UserSegment[],
    behaviorPattern: any,
    context: { priority: NotificationPriority; category: string; urgency?: boolean }
  ): NotificationChannel {
    // For urgent notifications, prefer immediate channels
    if (context.urgency || context.priority === 'urgent') {
      return 'push';
    }

    // Use behavioral preferences if available
    if (behaviorPattern.preferredChannels?.length > 0) {
      return behaviorPattern.preferredChannels[0];
    }

    // Segment-based channel selection
    if (userSegments.includes('mobile_users')) {
      return 'push';
    }
    
    if (userSegments.includes('desktop_users')) {
      return 'in_app';
    }

    if (userSegments.includes('power_users')) {
      return 'email'; // Power users may prefer detailed notifications
    }

    // Default fallback
    return 'in_app';
  }

  /**
   * Select optimal time for notification delivery
   */
  static selectOptimalTime(
    behaviorPattern: any,
    context: { priority: NotificationPriority; urgency?: boolean }
  ): Date {
    const now = new Date();

    // For urgent notifications, send immediately
    if (context.urgency || context.priority === 'urgent') {
      return now;
    }

    // Use behavioral optimal times if available
    if (behaviorPattern.optimalTimes?.length > 0) {
      const currentHour = now.getHours();
      const nearestOptimalHour = behaviorPattern.optimalTimes.reduce((nearest: number, hour: number) => {
        return Math.abs(hour - currentHour) < Math.abs(nearest - currentHour) ? hour : nearest;
      });

      const optimalTime = new Date(now);
      optimalTime.setHours(nearestOptimalHour, 0, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (optimalTime <= now) {
        optimalTime.setDate(optimalTime.getDate() + 1);
      }

      return optimalTime;
    }

    // Default to next optimal hour (9 AM if before, or next business hour)
    const optimalTime = new Date(now);
    
    if (now.getHours() < 9) {
      optimalTime.setHours(9, 0, 0, 0);
    } else if (now.getHours() >= 18) {
      optimalTime.setDate(optimalTime.getDate() + 1);
      optimalTime.setHours(9, 0, 0, 0);
    } else {
      // Send in next hour during business hours
      optimalTime.setHours(optimalTime.getHours() + 1, 0, 0, 0);
    }

    return optimalTime;
  }

  /**
   * Calculate confidence score for delivery optimization
   */
  static calculateDeliveryConfidence(
    userSegments: UserSegment[],
    behaviorPattern: any
  ): number {
    let confidence = 0.3; // Base confidence

    // Boost confidence based on available data
    if (userSegments.length > 0) {
      confidence += 0.2; // +20% for segmentation data
    }

    if (behaviorPattern.engagementScore > 0) {
      confidence += 0.2; // +20% for engagement data
    }

    if (behaviorPattern.preferredChannels?.length > 0) {
      confidence += 0.15; // +15% for channel preferences
    }

    if (behaviorPattern.optimalTimes?.length > 0) {
      confidence += 0.15; // +15% for timing data
    }

    return Math.min(1, confidence);
  }
}

/**
 * A/B Testing Utilities
 */
export class ABTestingEngine {
  /**
   * Assign user to A/B test variant
   */
  static assignVariant(
    userId: string,
    testId: string,
    variants: { id: string; weight: number }[]
  ): string {
    // Create deterministic hash from userId and testId
    const hash = this.simpleHash(userId + testId);
    const normalizedHash = (hash % 100) / 100; // 0-1 range

    // Assign based on cumulative weights
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight / 100;
      if (normalizedHash <= cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return variants[0]?.id || 'control';
  }

  /**
   * Simple hash function for consistent user assignment
   */
  static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if A/B test results are statistically significant
   */
  static isStatisticallySignificant(
    controlMetrics: { conversions: number; total: number },
    variantMetrics: { conversions: number; total: number },
    confidenceLevel: number = 0.95
  ): boolean {
    // Simple chi-square test implementation
    const controlRate = controlMetrics.conversions / controlMetrics.total;
    const variantRate = variantMetrics.conversions / variantMetrics.total;
    
    const pooledRate = (controlMetrics.conversions + variantMetrics.conversions) / 
                      (controlMetrics.total + variantMetrics.total);
    
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * 
      (1 / controlMetrics.total + 1 / variantMetrics.total)
    );
    
    const zScore = Math.abs(controlRate - variantRate) / standardError;
    const criticalValue = this.getZCriticalValue(confidenceLevel);
    
    return zScore > criticalValue;
  }

  /**
   * Get Z critical value for confidence level
   */
  static getZCriticalValue(confidenceLevel: number): number {
    // Simplified mapping for common confidence levels
    const zValues: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    
    return zValues[confidenceLevel] || 1.96;
  }
}

/**
 * Frequency Management Utilities
 */
export class FrequencyManager {
  /**
   * Check if user can receive notification based on frequency rules
   */
  static canSendNotification(
    userId: string,
    category: string,
    recentNotifications: Array<{ timestamp: Date; category: string }>,
    rules: {
      maxPerDay?: number;
      maxPerWeek?: number;
      maxPerMonth?: number;
      minInterval?: number; // minutes
    }
  ): { canSend: boolean; reason?: string; nextAvailableTime?: Date } {
    const now = new Date();

    // Check minimum interval
    if (rules.minInterval) {
      const lastNotification = recentNotifications
        .filter(n => n.category === category)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      if (lastNotification) {
        const timeSinceLastMs = now.getTime() - lastNotification.timestamp.getTime();
        const minIntervalMs = rules.minInterval * 60 * 1000;

        if (timeSinceLastMs < minIntervalMs) {
          const nextAvailableTime = new Date(lastNotification.timestamp.getTime() + minIntervalMs);
          return {
            canSend: false,
            reason: `Minimum interval not met (${rules.minInterval} minutes)`,
            nextAvailableTime
          };
        }
      }
    }

    // Check daily limit
    if (rules.maxPerDay) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayNotifications = recentNotifications.filter(
        n => n.category === category && n.timestamp >= todayStart
      );

      if (todayNotifications.length >= rules.maxPerDay) {
        const nextAvailableTime = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        return {
          canSend: false,
          reason: `Daily limit reached (${rules.maxPerDay} per day)`,
          nextAvailableTime
        };
      }
    }

    // Check weekly limit
    if (rules.maxPerWeek) {
      const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
      weekStart.setHours(0, 0, 0, 0);
      const weekNotifications = recentNotifications.filter(
        n => n.category === category && n.timestamp >= weekStart
      );

      if (weekNotifications.length >= rules.maxPerWeek) {
        const nextAvailableTime = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
          canSend: false,
          reason: `Weekly limit reached (${rules.maxPerWeek} per week)`,
          nextAvailableTime
        };
      }
    }

    // Check monthly limit
    if (rules.maxPerMonth) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthNotifications = recentNotifications.filter(
        n => n.category === category && n.timestamp >= monthStart
      );

      if (monthNotifications.length >= rules.maxPerMonth) {
        const nextAvailableTime = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return {
          canSend: false,
          reason: `Monthly limit reached (${rules.maxPerMonth} per month)`,
          nextAvailableTime
        };
      }
    }

    return { canSend: true };
  }
}

// Export all utilities
export {
  UserSegmentationEngine,
  BehavioralTargetingEngine,
  SmartTargetingEngine,
  ABTestingEngine,
  FrequencyManager
}; 