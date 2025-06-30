/**
 * Notification Analytics Configuration
 * 
 * Environment-specific configuration for notification system integration,
 * targeting, delivery optimization, and analytics tracking.
 */

import {
  NotificationAnalyticsConfig,
  NotificationChannel,
  UserSegment,
  TriggerType,
  NotificationPriority,
  TimeWindow,
  SegmentCriteria
} from '../types/notificationAnalytics';

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTesting = process.env.NODE_ENV === 'test';

// API Endpoints Configuration
export const NOTIFICATION_ANALYTICS_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  
  // Notification Analytics API endpoints
  track: '/api/notifications/track',
  analytics: '/api/notifications/analytics',
  segments: '/api/notifications/segments',
  optimization: '/api/notifications/optimization',
  templates: '/api/notifications/templates',
  triggers: '/api/notifications/triggers',
  
  // Real-time endpoints
  realtime: '/api/notifications/realtime',
  
  // Configuration endpoints
  config: '/api/notifications/config'
};

// Channel Configuration
export const NOTIFICATION_CHANNELS: Record<NotificationChannel, {
  name: string;
  enabled: boolean;
  priority: number;
  config: Record<string, any>;
  limits: {
    daily?: number;
    hourly?: number;
    burstLimit?: number;
  };
  cost: number; // Cost per notification
  averageDeliveryTime: number; // in milliseconds
  reliability: number; // 0-1
}> = {
  push: {
    name: 'Push Notification',
    enabled: true,
    priority: 1,
    config: {
      icon: '/icons/notification.png',
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    },
    limits: {
      daily: 10,
      hourly: 3,
      burstLimit: 1
    },
    cost: 0.001, // $0.001 per notification
    averageDeliveryTime: 1000, // 1 second
    reliability: 0.95
  },

  in_app: {
    name: 'In-App Notification',
    enabled: true,
    priority: 2,
    config: {
      displayDuration: 5000, // 5 seconds
      position: 'top-right',
      showCloseButton: true,
      autoHide: true
    },
    limits: {
      daily: 20,
      hourly: 5,
      burstLimit: 2
    },
    cost: 0, // Free
    averageDeliveryTime: 100, // 100ms
    reliability: 0.99
  },

  email: {
    name: 'Email',
    enabled: isProduction,
    priority: 3,
    config: {
      provider: 'sendgrid',
      fromEmail: process.env.REACT_APP_FROM_EMAIL || 'noreply@pfm.com',
      fromName: 'PFM Community',
      trackOpens: true,
      trackClicks: true
    },
    limits: {
      daily: 5,
      hourly: 2,
      burstLimit: 1
    },
    cost: 0.0001, // $0.0001 per email
    averageDeliveryTime: 2000, // 2 seconds
    reliability: 0.98
  },

  sms: {
    name: 'SMS',
    enabled: false, // Disabled by default
    priority: 4,
    config: {
      provider: 'twilio',
      shortLinks: true,
      unicode: true
    },
    limits: {
      daily: 2,
      hourly: 1,
      burstLimit: 1
    },
    cost: 0.05, // $0.05 per SMS
    averageDeliveryTime: 3000, // 3 seconds
    reliability: 0.97
  },

  slack: {
    name: 'Slack',
    enabled: false,
    priority: 5,
    config: {
      webhook: process.env.REACT_APP_SLACK_WEBHOOK,
      channel: '#notifications',
      username: 'PFM Bot',
      iconEmoji: ':bell:'
    },
    limits: {
      daily: 100,
      hourly: 20,
      burstLimit: 5
    },
    cost: 0, // Free
    averageDeliveryTime: 1500, // 1.5 seconds
    reliability: 0.99
  },

  discord: {
    name: 'Discord',
    enabled: false,
    priority: 6,
    config: {
      webhook: process.env.REACT_APP_DISCORD_WEBHOOK,
      username: 'PFM Bot',
      avatarUrl: process.env.REACT_APP_BOT_AVATAR
    },
    limits: {
      daily: 100,
      hourly: 20,
      burstLimit: 5
    },
    cost: 0, // Free
    averageDeliveryTime: 1200, // 1.2 seconds
    reliability: 0.98
  },

  webhook: {
    name: 'Webhook',
    enabled: true,
    priority: 7,
    config: {
      timeout: 5000, // 5 seconds
      retries: 3,
      retryDelay: 1000 // 1 second
    },
    limits: {
      daily: 1000,
      hourly: 100,
      burstLimit: 10
    },
    cost: 0, // Free
    averageDeliveryTime: 500, // 500ms
    reliability: 0.95
  },

  browser: {
    name: 'Browser Notification',
    enabled: true,
    priority: 8,
    config: {
      requirePermission: true,
      icon: '/icons/notification.png',
      badge: '/icons/badge.png'
    },
    limits: {
      daily: 5,
      hourly: 2,
      burstLimit: 1
    },
    cost: 0, // Free
    averageDeliveryTime: 200, // 200ms
    reliability: 0.90
  }
};

// User Segment Definitions
export const USER_SEGMENT_DEFINITIONS: Record<UserSegment, {
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  estimatedSize: number;
  priority: number;
  refreshFrequency: 'hourly' | 'daily' | 'weekly';
}> = {
  new_users: {
    name: 'New Users',
    description: 'Users who joined within the last 7 days',
    criteria: [
      {
        field: 'user.createdAt',
        operator: 'greater_than',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ],
    estimatedSize: 100,
    priority: 1,
    refreshFrequency: 'hourly'
  },

  active_users: {
    name: 'Active Users',
    description: 'Users with activity in the last 7 days',
    criteria: [
      {
        field: 'user.lastActiveAt',
        operator: 'greater_than',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ],
    estimatedSize: 500,
    priority: 2,
    refreshFrequency: 'daily'
  },

  inactive_users: {
    name: 'Inactive Users',
    description: 'Users with no activity in the last 30 days',
    criteria: [
      {
        field: 'user.lastActiveAt',
        operator: 'less_than',
        value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ],
    estimatedSize: 200,
    priority: 3,
    refreshFrequency: 'daily'
  },

  power_users: {
    name: 'Power Users',
    description: 'Highly engaged users with frequent activity',
    criteria: [
      {
        field: 'analytics.sessionsLast30Days',
        operator: 'greater_than',
        value: 20
      },
      {
        field: 'analytics.avgSessionDuration',
        operator: 'greater_than',
        value: 300000 // 5 minutes
      }
    ],
    estimatedSize: 50,
    priority: 1,
    refreshFrequency: 'weekly'
  },

  community_owners: {
    name: 'Community Owners',
    description: 'Users who own one or more communities',
    criteria: [
      {
        field: 'user.role',
        operator: 'equals',
        value: 'community_owner'
      }
    ],
    estimatedSize: 25,
    priority: 1,
    refreshFrequency: 'daily'
  },

  community_members: {
    name: 'Community Members',
    description: 'Users who are members of communities',
    criteria: [
      {
        field: 'user.communities',
        operator: 'exists',
        value: true
      }
    ],
    estimatedSize: 400,
    priority: 2,
    refreshFrequency: 'daily'
  },

  voters: {
    name: 'Voters',
    description: 'Users who have participated in voting',
    criteria: [
      {
        field: 'analytics.votesLast30Days',
        operator: 'greater_than',
        value: 0
      }
    ],
    estimatedSize: 150,
    priority: 2,
    refreshFrequency: 'weekly'
  },

  blockchain_users: {
    name: 'Blockchain Users',
    description: 'Users who have connected wallets',
    criteria: [
      {
        field: 'user.walletConnected',
        operator: 'equals',
        value: true
      }
    ],
    estimatedSize: 300,
    priority: 2,
    refreshFrequency: 'daily'
  },

  mobile_users: {
    name: 'Mobile Users',
    description: 'Users primarily accessing from mobile devices',
    criteria: [
      {
        field: 'analytics.primaryDeviceType',
        operator: 'equals',
        value: 'mobile'
      }
    ],
    estimatedSize: 250,
    priority: 3,
    refreshFrequency: 'weekly'
  },

  desktop_users: {
    name: 'Desktop Users',
    description: 'Users primarily accessing from desktop',
    criteria: [
      {
        field: 'analytics.primaryDeviceType',
        operator: 'equals',
        value: 'desktop'
      }
    ],
    estimatedSize: 350,
    priority: 3,
    refreshFrequency: 'weekly'
  },

  at_risk_users: {
    name: 'At Risk Users',
    description: 'Users at risk of churning',
    criteria: [
      {
        field: 'user.lastActiveAt',
        operator: 'less_than',
        value: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        field: 'analytics.engagementScore',
        operator: 'less_than',
        value: 0.3
      }
    ],
    estimatedSize: 75,
    priority: 1,
    refreshFrequency: 'daily'
  },

  high_value_users: {
    name: 'High Value Users',
    description: 'Users with high engagement and value',
    criteria: [
      {
        field: 'analytics.engagementScore',
        operator: 'greater_than',
        value: 0.8
      },
      {
        field: 'analytics.communitiesOwned',
        operator: 'greater_than',
        value: 0
      }
    ],
    estimatedSize: 30,
    priority: 1,
    refreshFrequency: 'weekly'
  }
};

// Notification Templates
export const DEFAULT_NOTIFICATION_TEMPLATES = {
  welcome: {
    name: 'Welcome New User',
    category: 'onboarding',
    priority: 'normal' as NotificationPriority,
    channels: ['in_app', 'email'] as NotificationChannel[],
    title: 'Welcome to PFM Community!',
    body: 'Thanks for joining us, {{user.firstName}}! Get started by exploring communities.',
    targetSegments: ['new_users'] as UserSegment[]
  },

  community_invite: {
    name: 'Community Invitation',
    category: 'community',
    priority: 'normal' as NotificationPriority,
    channels: ['push', 'in_app', 'email'] as NotificationChannel[],
    title: 'You\'re invited to join {{community.name}}',
    body: '{{inviter.name}} has invited you to join the {{community.name}} community.',
    targetSegments: ['active_users', 'community_members'] as UserSegment[]
  },

  vote_reminder: {
    name: 'Vote Reminder',
    category: 'voting',
    priority: 'high' as NotificationPriority,
    channels: ['push', 'in_app'] as NotificationChannel[],
    title: 'Don\'t forget to vote!',
    body: 'Voting closes in {{timeRemaining}} for "{{proposal.title}}"',
    targetSegments: ['voters', 'community_members'] as UserSegment[]
  },

  engagement_nudge: {
    name: 'Engagement Nudge',
    category: 'engagement',
    priority: 'low' as NotificationPriority,
    channels: ['in_app', 'email'] as NotificationChannel[],
    title: 'We miss you!',
    body: 'Check out what\'s new in your communities since your last visit.',
    targetSegments: ['inactive_users', 'at_risk_users'] as UserSegment[]
  }
};

// Trigger Configurations
export const DEFAULT_TRIGGERS: Record<string, {
  name: string;
  type: TriggerType;
  description: string;
  eventCriteria: any[];
  timingCriteria: any;
  targetSegments: UserSegment[];
}> = {
  user_signup: {
    name: 'User Signup',
    type: 'event_based',
    description: 'Triggered when a new user signs up',
    eventCriteria: [
      {
        eventCategory: 'user_interaction',
        eventAction: 'create',
        eventLabel: 'user_registration'
      }
    ],
    timingCriteria: {
      delay: 5, // 5 minutes after signup
      respectUserTimezone: true
    },
    targetSegments: ['new_users']
  },

  community_created: {
    name: 'Community Created',
    type: 'event_based',
    description: 'Triggered when a user creates a community',
    eventCriteria: [
      {
        eventCategory: 'community',
        eventAction: 'create'
      }
    ],
    timingCriteria: {
      delay: 1, // 1 minute after creation
      respectUserTimezone: true
    },
    targetSegments: ['community_owners']
  },

  inactivity_warning: {
    name: 'Inactivity Warning',
    type: 'time_based',
    description: 'Triggered for users who haven\'t been active',
    eventCriteria: [],
    timingCriteria: {
      delay: 0,
      respectUserTimezone: true,
      timeOfDay: { start: '09:00', end: '18:00' }
    },
    targetSegments: ['at_risk_users']
  }
};

// Optimization Settings
export const OPTIMIZATION_SETTINGS = {
  timing: {
    enabled: true,
    algorithm: 'ml_based',
    learningPeriod: 14, // days
    minDataPoints: 100,
    confidenceThreshold: 0.75,
    defaultTimeWindows: [
      { start: '09:00', end: '11:00', daysOfWeek: [1, 2, 3, 4, 5] },
      { start: '14:00', end: '16:00', daysOfWeek: [1, 2, 3, 4, 5] },
      { start: '19:00', end: '21:00', daysOfWeek: [0, 6] }
    ] as TimeWindow[]
  },

  channel: {
    enabled: true,
    algorithm: 'hybrid',
    learningPeriod: 7, // days
    minDataPoints: 50,
    confidenceThreshold: 0.70,
    fallbackStrategy: 'most_reliable'
  },

  frequency: {
    enabled: true,
    algorithm: 'rule_based',
    globalLimits: {
      maxPerDay: 5,
      maxPerWeek: 15,
      maxPerMonth: 50
    },
    categoryLimits: {
      onboarding: { maxPerDay: 2, maxPerWeek: 5 },
      community: { maxPerDay: 3, maxPerWeek: 10 },
      voting: { maxPerDay: 2, maxPerWeek: 8 },
      engagement: { maxPerDay: 1, maxPerWeek: 3 }
    }
  },

  content: {
    enabled: true,
    personalizationLevel: 'medium',
    abTestingEnabled: true,
    dynamicContentEnabled: true,
    sentimentAnalysis: false // Disabled by default
  }
};

// Environment-Specific Configurations
export const NOTIFICATION_ANALYTICS_CONFIGS: Record<string, NotificationAnalyticsConfig> = {
  development: {
    enabled: true,
    environment: 'development',
    
    // Tracking Configuration
    trackDelivery: true,
    trackEngagement: true,
    trackConversions: true,
    
    // Optimization Features
    enableSmartTiming: false, // Disabled in development
    enableChannelOptimization: false,
    enableContentOptimization: false,
    enableFrequencyOptimization: true,
    
    // Privacy Settings
    respectDoNotTrack: false,
    anonymizeData: false,
    gdprCompliant: false,
    
    // Performance Settings
    bufferSize: 10,
    flushInterval: 5000, // 5 seconds
    batchSize: 5,
    
    // API Configuration
    apiEndpoint: NOTIFICATION_ANALYTICS_ENDPOINTS.base,
    timeout: 10000 // 10 seconds
  },

  staging: {
    enabled: true,
    environment: 'staging',
    
    // Tracking Configuration
    trackDelivery: true,
    trackEngagement: true,
    trackConversions: true,
    
    // Optimization Features
    enableSmartTiming: true,
    enableChannelOptimization: true,
    enableContentOptimization: false,
    enableFrequencyOptimization: true,
    
    // Privacy Settings
    respectDoNotTrack: true,
    anonymizeData: true,
    gdprCompliant: true,
    
    // Performance Settings
    bufferSize: 50,
    flushInterval: 15000, // 15 seconds
    batchSize: 20,
    
    // API Configuration
    apiEndpoint: NOTIFICATION_ANALYTICS_ENDPOINTS.base,
    timeout: 8000 // 8 seconds
  },

  production: {
    enabled: true,
    environment: 'production',
    
    // Tracking Configuration
    trackDelivery: true,
    trackEngagement: true,
    trackConversions: true,
    
    // Optimization Features
    enableSmartTiming: true,
    enableChannelOptimization: true,
    enableContentOptimization: true,
    enableFrequencyOptimization: true,
    
    // Privacy Settings
    respectDoNotTrack: true,
    anonymizeData: true,
    gdprCompliant: true,
    
    // Performance Settings
    bufferSize: 100,
    flushInterval: 30000, // 30 seconds
    batchSize: 50,
    
    // API Configuration
    apiEndpoint: NOTIFICATION_ANALYTICS_ENDPOINTS.base,
    apiKey: process.env.REACT_APP_NOTIFICATION_API_KEY,
    timeout: 5000 // 5 seconds
  }
};

// Quiet Hours Configuration
export const QUIET_HOURS = {
  default: {
    start: '22:00',
    end: '08:00',
    timezone: 'user' // Use user's timezone
  },
  overrides: {
    weekend: {
      start: '23:00',
      end: '09:00'
    },
    holiday: {
      start: '21:00',
      end: '10:00'
    }
  }
};

// A/B Testing Configuration
export const AB_TESTING_CONFIG = {
  defaultDuration: 7, // days
  minSampleSize: 100,
  confidenceLevel: 0.95,
  maxVariants: 5,
  trafficAllocation: {
    min: 0.1, // 10%
    max: 0.9  // 90%
  },
  earlyStoppingEnabled: true,
  earlyStoppingThreshold: 0.99 // 99% confidence
};

// Configuration Factory Functions
export function createNotificationAnalyticsConfig(
  environment: keyof typeof NOTIFICATION_ANALYTICS_CONFIGS = isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
  overrides: Partial<NotificationAnalyticsConfig> = {}
): NotificationAnalyticsConfig {
  const baseConfig = NOTIFICATION_ANALYTICS_CONFIGS[environment];
  
  return {
    ...baseConfig,
    ...overrides
  };
}

export function getCurrentConfig(): NotificationAnalyticsConfig {
  return createNotificationAnalyticsConfig();
}

// Export default configuration
export default getCurrentConfig(); 