/**
 * Notification Analytics Type Definitions
 * 
 * Comprehensive types for notification system integration, targeting,
 * delivery optimization, and analytics tracking in the PFM application.
 */

import { EventCategory, EventAction } from './analytics';

// Core Notification Analytics Types
export type NotificationChannel = 
  | 'push' 
  | 'email' 
  | 'sms' 
  | 'in_app' 
  | 'slack' 
  | 'discord' 
  | 'webhook'
  | 'browser';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 
  | 'scheduled' 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked' 
  | 'dismissed' 
  | 'failed' 
  | 'expired';

export type UserSegment = 
  | 'new_users' 
  | 'active_users' 
  | 'inactive_users' 
  | 'power_users' 
  | 'community_owners' 
  | 'community_members' 
  | 'voters' 
  | 'blockchain_users'
  | 'mobile_users'
  | 'desktop_users'
  | 'at_risk_users'
  | 'high_value_users';

export type TriggerType = 
  | 'time_based' 
  | 'event_based' 
  | 'behavior_based' 
  | 'location_based' 
  | 'engagement_based'
  | 'milestone_based'
  | 'anniversary_based'
  | 'predictive';

export type ContentType = 
  | 'text' 
  | 'rich_text' 
  | 'html' 
  | 'markdown' 
  | 'interactive'
  | 'templated'
  | 'dynamic';

// Notification Template
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  
  // Content
  subject?: string;
  title: string;
  body: string;
  contentType: ContentType;
  
  // Personalization
  personalizable: boolean;
  variables: NotificationVariable[];
  
  // Targeting
  targetSegments: UserSegment[];
  targetingRules: TargetingRule[];
  
  // Timing
  schedulingRules: SchedulingRule[];
  frequencyRules: FrequencyRule[];
  
  // A/B Testing
  abTestEnabled: boolean;
  variants?: NotificationVariant[];
  
  // Analytics
  trackingEnabled: boolean;
  conversionGoals: string[];
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface NotificationVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
  examples: string[];
}

export interface NotificationVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  title: string;
  body: string;
  subject?: string;
  isControl: boolean;
  isActive: boolean;
}

// User Segmentation
export interface UserSegmentDefinition {
  id: string;
  name: string;
  description: string;
  segment: UserSegment;
  
  // Criteria
  criteria: SegmentCriteria[];
  rules: SegmentRule[];
  
  // Analytics
  estimatedSize: number;
  actualSize: number;
  lastCalculated: Date;
  
  // Configuration
  isActive: boolean;
  autoUpdate: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  weight?: number;
}

export interface SegmentRule {
  id: string;
  name: string;
  type: 'inclusion' | 'exclusion';
  criteria: SegmentCriteria[];
  operator: 'and' | 'or';
  isActive: boolean;
}

// Behavioral Triggers
export interface BehaviorTrigger {
  id: string;
  name: string;
  description: string;
  type: TriggerType;
  
  // Trigger Conditions
  eventCriteria: TriggerEventCriteria[];
  timingCriteria: TriggerTimingCriteria;
  frequencyCriteria: TriggerFrequencyCriteria;
  
  // Actions
  notificationTemplateId: string;
  customizations: TriggerCustomization[];
  
  // Targeting
  targetSegments: UserSegment[];
  exclusionRules: ExclusionRule[];
  
  // Configuration
  isActive: boolean;
  priority: NotificationPriority;
  maxTriggersPerUser: number;
  cooldownPeriod: number; // in minutes
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TriggerEventCriteria {
  eventCategory: EventCategory;
  eventAction: EventAction;
  eventLabel?: string;
  eventValue?: { min?: number; max?: number };
  properties?: Record<string, any>;
  count?: { min?: number; max?: number };
  timeWindow?: number; // in minutes
}

export interface TriggerTimingCriteria {
  delay?: number; // in minutes
  timeOfDay?: { start: string; end: string }; // HH:MM format
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  timezone?: string;
  respectUserTimezone: boolean;
  respectQuietHours: boolean;
}

export interface TriggerFrequencyCriteria {
  maxPerDay?: number;
  maxPerWeek?: number;
  maxPerMonth?: number;
  minInterval?: number; // in minutes
}

export interface TriggerCustomization {
  variable: string;
  source: 'event_data' | 'user_data' | 'analytics_data' | 'static' | 'computed';
  mapping: string;
  fallback?: any;
}

export interface ExclusionRule {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  isActive: boolean;
}

// Targeting Rules
export interface TargetingRule {
  id: string;
  name: string;
  description: string;
  type: 'include' | 'exclude';
  criteria: SegmentCriteria[];
  priority: number;
  isActive: boolean;
}

// Scheduling and Timing
export interface SchedulingRule {
  id: string;
  name: string;
  type: 'immediate' | 'delayed' | 'scheduled' | 'optimal' | 'event_based';
  
  // Timing Configuration
  delay?: number; // in minutes
  scheduledTime?: Date;
  timeZone?: string;
  
  // Optimal Timing
  useOptimalTiming?: boolean;
  optimizationMetric?: string;
  fallbackTime?: string; // HH:MM
  
  // Restrictions
  allowedTimeWindows?: TimeWindow[];
  blockedTimeWindows?: TimeWindow[];
  respectQuietHours?: boolean;
  respectUserPreferences?: boolean;
  
  // Frequency Control
  frequencyRules?: FrequencyRule[];
  
  isActive: boolean;
}

export interface TimeWindow {
  start: string; // HH:MM
  end: string; // HH:MM
  timezone?: string;
  daysOfWeek?: number[]; // 0-6
}

export interface FrequencyRule {
  id: string;
  name: string;
  type: 'global' | 'template' | 'category' | 'channel';
  
  // Limits
  maxPerHour?: number;
  maxPerDay?: number;
  maxPerWeek?: number;
  maxPerMonth?: number;
  
  // Intervals
  minInterval?: number; // in minutes
  respectCooldown?: boolean;
  
  // Priority Handling
  priorityOverride?: boolean;
  urgentOverride?: boolean;
  
  isActive: boolean;
}

// Notification Instance
export interface NotificationInstance {
  id: string;
  templateId: string;
  templateVersion: string;
  userId: string;
  
  // Content
  title: string;
  body: string;
  subject?: string;
  data?: Record<string, any>;
  
  // Delivery
  channel: NotificationChannel;
  priority: NotificationPriority;
  scheduledAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  
  // Status
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  
  // Targeting
  segment?: UserSegment;
  triggerId?: string;
  
  // A/B Testing
  variantId?: string;
  isControl?: boolean;
  
  // Analytics
  trackingData: NotificationTrackingData;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface NotificationTrackingData {
  // Delivery Tracking
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  
  // Engagement Tracking
  openedAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  
  // Interaction Tracking
  interactions: NotificationInteraction[];
  
  // Performance Tracking
  deliveryTime?: number; // in milliseconds
  renderTime?: number;
  
  // Context
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
    userAgent: string;
  };
  
  // Custom Events
  customEvents: NotificationCustomEvent[];
}

export interface NotificationInteraction {
  id: string;
  type: 'click' | 'dismiss' | 'action' | 'view' | 'share' | 'save';
  timestamp: Date;
  element?: string;
  value?: any;
  metadata?: Record<string, any>;
}

export interface NotificationCustomEvent {
  id: string;
  name: string;
  timestamp: Date;
  properties: Record<string, any>;
}

// Analytics and Metrics
export interface NotificationAnalytics {
  id: string;
  templateId?: string;
  campaignId?: string;
  timeframe: TimeFrame;
  
  // Metrics
  deliveryMetrics: DeliveryMetrics;
  engagementMetrics: EngagementMetrics;
  conversionMetrics: ConversionMetrics;
  
  generatedAt: Date;
}

export interface DeliveryMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number; // 0-1
  failureRate: number; // 0-1
  averageDeliveryTime: number; // in milliseconds
}

export interface EngagementMetrics {
  totalOpened: number;
  totalClicked: number;
  totalDismissed: number;
  
  // Rates
  openRate: number; // 0-1
  clickRate: number; // 0-1
  clickThroughRate: number; // clicks / opens
  dismissalRate: number; // 0-1
  
  // Timing
  averageTimeToOpen: number; // in minutes
  averageTimeToClick: number; // in minutes
  averageEngagementDuration: number; // in seconds
}

export interface ConversionMetrics {
  totalConversions: number;
  conversionRate: number; // 0-1
  conversionValue: number;
  averageConversionTime: number; // in minutes
  
  // Attribution
  attributedRevenue: number;
  costPerConversion: number;
  returnOnInvestment: number;
}

export interface TimeFrame {
  start: Date;
  end: Date;
  timezone?: string;
}

// Hook Interface
export interface UseNotificationAnalyticsReturn {
  // Tracking
  trackNotificationSent: (notification: NotificationInstance) => Promise<void>;
  trackNotificationDelivered: (notificationId: string, deliveryTime: number) => Promise<void>;
  trackNotificationOpened: (notificationId: string, context?: Record<string, any>) => Promise<void>;
  trackNotificationClicked: (notificationId: string, element?: string, context?: Record<string, any>) => Promise<void>;
  trackNotificationDismissed: (notificationId: string, reason?: string) => Promise<void>;
  trackNotificationConversion: (notificationId: string, goalId: string, value?: number) => Promise<void>;
  
  // User Segmentation
  identifyUserSegment: (userId: string) => Promise<UserSegment[]>;
  updateUserSegment: (userId: string, segment: UserSegment) => Promise<void>;
  
  // Optimization
  getOptimalSendTime: (userId: string, templateId: string) => Promise<Date>;
  getOptimalChannel: (userId: string, templateId: string) => Promise<NotificationChannel>;
  
  // Analytics
  getNotificationAnalytics: (filters: AnalyticsFilters) => Promise<NotificationAnalytics>;
  
  // State
  isInitialized: boolean;
  error: Error | null;
}

export interface AnalyticsFilters {
  templateIds?: string[];
  userSegments?: UserSegment[];
  channels?: NotificationChannel[];
  timeframe: TimeFrame;
  includeFailed?: boolean;
}

// Service Interface
export interface NotificationAnalyticsService {
  // Initialization
  initialize: (config?: Partial<NotificationAnalyticsConfig>) => Promise<void>;
  shutdown: () => Promise<void>;
  
  // Event Tracking
  trackEvent: (event: NotificationAnalyticsEvent) => Promise<void>;
  batchTrackEvents: (events: NotificationAnalyticsEvent[]) => Promise<void>;
  
  // User Management
  identifyUser: (userId: string, traits: Record<string, any>) => Promise<void>;
  updateUserSegments: (userId: string) => Promise<UserSegment[]>;
  
  // Analytics
  generateAnalytics: (filters: AnalyticsFilters) => Promise<NotificationAnalytics>;
  
  // Configuration
  updateConfig: (config: Partial<NotificationAnalyticsConfig>) => void;
  getConfig: () => NotificationAnalyticsConfig;
}

export interface NotificationAnalyticsEvent {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed' | 'converted' | 'failed';
  notificationId: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface NotificationAnalyticsConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  
  // Tracking Configuration
  trackDelivery: boolean;
  trackEngagement: boolean;
  trackConversions: boolean;
  
  // Optimization Features
  enableSmartTiming: boolean;
  enableChannelOptimization: boolean;
  enableContentOptimization: boolean;
  enableFrequencyOptimization: boolean;
  
  // Privacy Settings
  respectDoNotTrack: boolean;
  anonymizeData: boolean;
  gdprCompliant: boolean;
  
  // Performance Settings
  bufferSize: number;
  flushInterval: number; // in milliseconds
  batchSize: number;
  
  // API Configuration
  apiEndpoint: string;
  apiKey?: string;
  timeout: number; // in milliseconds
}

// Error Types
export class NotificationAnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'NotificationAnalyticsError';
  }
}

// Utility Types
export type NotificationAnalyticsActionType = 
  | 'INITIALIZE'
  | 'TRACK_EVENT'
  | 'UPDATE_SEGMENT'
  | 'GENERATE_ANALYTICS'
  | 'UPDATE_CONFIG'
  | 'SET_ERROR'
  | 'CLEAR_ERROR';

export interface NotificationAnalyticsAction {
  type: NotificationAnalyticsActionType;
  payload?: any;
} 