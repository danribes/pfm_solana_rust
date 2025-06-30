/**
 * Analytics Configuration
 * 
 * Environment-specific configuration for analytics integration,
 * tracking providers, privacy settings, and performance monitoring.
 */

import {
  AnalyticsConfig,
  AnalyticsPresets,
  AnalyticsProvider,
  CustomDimension,
  CustomMetric,
  ReportSchedule
} from '../types/analytics';

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTesting = process.env.NODE_ENV === 'test';

// Analytics Providers Configuration
export const ANALYTICS_PROVIDERS: Record<string, AnalyticsProvider> = {
  google_analytics: {
    name: 'Google Analytics',
    enabled: isProduction,
    config: {
      trackingId: process.env.REACT_APP_GA_TRACKING_ID || 'GA_MEASUREMENT_ID',
      cookieDomain: 'auto',
      siteSpeedSampleRate: 10,
      enableLinkid: true,
      anonymizeIp: true
    },
    trackPageViews: true,
    trackEvents: true,
    trackPerformance: true,
    trackErrors: true
  },

  google_tag_manager: {
    name: 'Google Tag Manager',
    enabled: isProduction,
    config: {
      containerId: process.env.REACT_APP_GTM_CONTAINER_ID || 'GTM-XXXXXXX',
      dataLayerName: 'dataLayer',
      auth: process.env.REACT_APP_GTM_AUTH,
      preview: process.env.REACT_APP_GTM_PREVIEW
    },
    trackPageViews: true,
    trackEvents: true,
    trackPerformance: false,
    trackErrors: true
  },

  amplitude: {
    name: 'Amplitude',
    enabled: isProduction,
    config: {
      apiKey: process.env.REACT_APP_AMPLITUDE_API_KEY || '',
      serverUrl: process.env.REACT_APP_AMPLITUDE_SERVER_URL,
      batchEvents: true,
      eventUploadThreshold: 30,
      eventUploadPeriodMillis: 30000
    },
    trackPageViews: true,
    trackEvents: true,
    trackPerformance: false,
    trackErrors: true
  },

  mixpanel: {
    name: 'Mixpanel',
    enabled: false, // Disabled by default
    config: {
      token: process.env.REACT_APP_MIXPANEL_TOKEN || '',
      api_host: 'https://api-eu.mixpanel.com',
      batch_requests: true,
      batch_size: 50,
      batch_flush_interval_ms: 5000
    },
    trackPageViews: true,
    trackEvents: true,
    trackPerformance: false,
    trackErrors: true
  },

  custom_api: {
    name: 'Custom Analytics API',
    enabled: true,
    config: {
      endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || '/api/analytics',
      apiKey: process.env.REACT_APP_ANALYTICS_API_KEY || '',
      batchSize: 20,
      flushInterval: 10000, // 10 seconds
      retryAttempts: 3,
      retryDelay: 1000
    },
    trackPageViews: true,
    trackEvents: true,
    trackPerformance: true,
    trackErrors: true
  }
};

// Custom Dimensions Configuration
export const CUSTOM_DIMENSIONS: CustomDimension[] = [
  {
    id: 'user_type',
    name: 'User Type',
    scope: 'user',
    getValue: (context) => context.user?.type || 'anonymous'
  },
  {
    id: 'wallet_connected',
    name: 'Wallet Connected',
    scope: 'session',
    getValue: (context) => context.wallet?.connected ? 'connected' : 'disconnected'
  },
  {
    id: 'community_id',
    name: 'Community ID',
    scope: 'hit',
    getValue: (context) => context.community?.id || 'none'
  },
  {
    id: 'device_type',
    name: 'Device Type',
    scope: 'session',
    getValue: (context) => context.device?.type || 'unknown'
  },
  {
    id: 'connection_type',
    name: 'Connection Type',
    scope: 'session',
    getValue: (context) => context.network?.effectiveType || 'unknown'
  }
];

// Custom Metrics Configuration
export const CUSTOM_METRICS: CustomMetric[] = [
  {
    id: 'page_load_time',
    name: 'Page Load Time',
    type: 'time',
    getValue: (context) => context.performance?.loadComplete || 0
  },
  {
    id: 'interaction_time',
    name: 'Time to First Interaction',
    type: 'time',
    getValue: (context) => context.performance?.firstInputDelay || 0
  },
  {
    id: 'scroll_depth',
    name: 'Scroll Depth',
    type: 'integer',
    getValue: (context) => context.page?.scrollDepth || 0
  },
  {
    id: 'session_value',
    name: 'Session Value',
    type: 'currency',
    getValue: (context) => context.session?.value || 0
  },
  {
    id: 'error_count',
    name: 'Error Count',
    type: 'integer',
    getValue: (context) => context.errors?.length || 0
  }
];

// Privacy and Compliance Settings
export const PRIVACY_SETTINGS = {
  // GDPR Compliance
  gdpr: {
    enabled: true,
    consentRequired: true,
    consentTypes: ['analytics', 'performance', 'marketing'],
    dataRetentionPeriod: 26, // months
    rightToErasure: true,
    dataPortability: true
  },

  // CCPA Compliance
  ccpa: {
    enabled: true,
    doNotSellOptOut: true,
    categories: ['analytics', 'advertising', 'performance']
  },

  // General Privacy
  general: {
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookielessTracking: false,
    dataMinimization: true,
    purposeLimitation: true
  }
};

// Sampling Rates by Environment
export const SAMPLING_RATES = {
  development: {
    analytics: 1.0, // 100% sampling in development
    performance: 1.0,
    errors: 1.0
  },
  staging: {
    analytics: 0.5, // 50% sampling in staging
    performance: 0.3,
    errors: 1.0
  },
  production: {
    analytics: 0.1, // 10% sampling in production
    performance: 0.05, // 5% for performance
    errors: 1.0 // 100% for errors
  }
};

// Environment-Specific Presets
export const ANALYTICS_PRESETS: AnalyticsPresets = {
  development: {
    enabled: true,
    environment: 'development',
    providers: [ANALYTICS_PROVIDERS.custom_api],
    collectUserData: true,
    collectPerformanceData: true,
    collectErrorData: true,
    collectInteractionData: true,
    respectDoNotTrack: false,
    anonymizeIp: false,
    cookieConsent: false,
    gdprCompliant: false,
    samplingRate: SAMPLING_RATES.development.analytics,
    performanceSamplingRate: SAMPLING_RATES.development.performance,
    errorSamplingRate: SAMPLING_RATES.development.errors,
    bufferSize: 50,
    flushInterval: 5000, // 5 seconds
    customDimensions: CUSTOM_DIMENSIONS,
    customMetrics: CUSTOM_METRICS
  },

  staging: {
    enabled: true,
    environment: 'staging',
    providers: [
      ANALYTICS_PROVIDERS.custom_api,
      { ...ANALYTICS_PROVIDERS.google_analytics, enabled: true }
    ],
    collectUserData: true,
    collectPerformanceData: true,
    collectErrorData: true,
    collectInteractionData: true,
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookieConsent: true,
    gdprCompliant: true,
    samplingRate: SAMPLING_RATES.staging.analytics,
    performanceSamplingRate: SAMPLING_RATES.staging.performance,
    errorSamplingRate: SAMPLING_RATES.staging.errors,
    bufferSize: 30,
    flushInterval: 10000, // 10 seconds
    customDimensions: CUSTOM_DIMENSIONS,
    customMetrics: CUSTOM_METRICS
  },

  production: {
    enabled: true,
    environment: 'production',
    providers: [
      ANALYTICS_PROVIDERS.custom_api,
      ANALYTICS_PROVIDERS.google_analytics,
      ANALYTICS_PROVIDERS.google_tag_manager,
      ANALYTICS_PROVIDERS.amplitude
    ],
    collectUserData: true,
    collectPerformanceData: true,
    collectErrorData: true,
    collectInteractionData: true,
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookieConsent: true,
    gdprCompliant: true,
    samplingRate: SAMPLING_RATES.production.analytics,
    performanceSamplingRate: SAMPLING_RATES.production.performance,
    errorSamplingRate: SAMPLING_RATES.production.errors,
    bufferSize: 100,
    flushInterval: 30000, // 30 seconds
    customDimensions: CUSTOM_DIMENSIONS,
    customMetrics: CUSTOM_METRICS
  }
};

// API Endpoints Configuration
export const ANALYTICS_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  
  // Analytics API endpoints
  events: '/api/analytics/events',
  pageviews: '/api/analytics/pageviews',
  errors: '/api/analytics/errors',
  performance: '/api/analytics/performance',
  sessions: '/api/analytics/sessions',
  
  // Reporting endpoints
  reports: '/api/analytics/reports',
  realtime: '/api/analytics/realtime',
  dashboard: '/api/analytics/dashboard',
  
  // Data export endpoints
  export: '/api/analytics/export',
  
  // Configuration endpoints
  config: '/api/analytics/config'
};

// Event Categories Configuration
export const EVENT_CATEGORIES = {
  // User Interactions
  user_interaction: {
    click: ['button', 'link', 'menu_item', 'card', 'tab'],
    submit: ['form', 'vote', 'comment', 'application'],
    view: ['page', 'modal', 'tooltip', 'notification'],
    scroll: ['page_bottom', 'section', 'infinite_scroll'],
    search: ['communities', 'votes', 'users', 'content']
  },

  // Navigation
  navigation: {
    view: ['page_view', 'route_change'],
    click: ['menu', 'breadcrumb', 'pagination', 'back_button'],
    load: ['page_load', 'component_load', 'lazy_load']
  },

  // Blockchain Operations
  blockchain: {
    connect: ['wallet_connect', 'network_connect'],
    disconnect: ['wallet_disconnect', 'network_disconnect'],
    error: ['transaction_failed', 'connection_failed', 'signature_failed'],
    submit: ['transaction', 'signature', 'vote_on_chain']
  },

  // Community Management
  community: {
    create: ['community_created', 'proposal_created'],
    update: ['community_updated', 'settings_changed'],
    delete: ['community_deleted', 'proposal_deleted'],
    join: ['member_joined', 'application_submitted'],
    leave: ['member_left', 'membership_cancelled']
  },

  // Voting System
  voting: {
    vote: ['vote_cast', 'vote_changed'],
    view: ['proposal_viewed', 'results_viewed'],
    create: ['proposal_created', 'poll_created'],
    share: ['proposal_shared', 'results_shared']
  },

  // Performance Monitoring
  performance: {
    load: ['page_load', 'component_mount', 'api_response'],
    error: ['render_error', 'network_error', 'script_error']
  }
};

// Report Templates Configuration
export const REPORT_TEMPLATES = {
  overview: {
    name: 'Overview Report',
    metrics: ['sessions', 'pageviews', 'users', 'bounce_rate', 'avg_session_duration'],
    dimensions: ['date', 'source', 'device_type'],
    defaultTimeframe: 'last_30_days'
  },

  user_behavior: {
    name: 'User Behavior Report',
    metrics: ['pageviews', 'unique_pageviews', 'time_on_page', 'exits', 'bounce_rate'],
    dimensions: ['page_path', 'page_title', 'user_type'],
    defaultTimeframe: 'last_7_days'
  },

  performance: {
    name: 'Performance Report',
    metrics: ['avg_page_load_time', 'page_load_sample', 'avg_server_response_time'],
    dimensions: ['page_path', 'device_type', 'connection_type'],
    defaultTimeframe: 'last_24_hours'
  },

  conversion: {
    name: 'Conversion Report',
    metrics: ['goal_completions', 'goal_conversion_rate', 'goal_value'],
    dimensions: ['goal_completion_location', 'source', 'medium'],
    defaultTimeframe: 'last_30_days'
  }
};

// Default Report Schedules
export const DEFAULT_SCHEDULES: Record<string, ReportSchedule> = {
  daily_summary: {
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
    recipients: ['admin@pfm.com'],
    format: 'json'
  },

  weekly_overview: {
    frequency: 'weekly',
    time: '08:00',
    timezone: 'UTC',
    recipients: ['team@pfm.com'],
    format: 'pdf'
  },

  monthly_insights: {
    frequency: 'monthly',
    time: '10:00',
    timezone: 'UTC',
    recipients: ['leadership@pfm.com'],
    format: 'pdf'
  }
};

// Error Categorization
export const ERROR_CATEGORIES = {
  javascript: {
    types: ['TypeError', 'ReferenceError', 'SyntaxError', 'RangeError'],
    severity: 'medium',
    autoReport: true
  },

  network: {
    types: ['NetworkError', 'TimeoutError', 'AbortError'],
    severity: 'high',
    autoReport: true
  },

  blockchain: {
    types: ['TransactionError', 'WalletError', 'ContractError'],
    severity: 'high',
    autoReport: true
  },

  user: {
    types: ['ValidationError', 'AuthenticationError', 'AuthorizationError'],
    severity: 'low',
    autoReport: false
  },

  system: {
    types: ['ConfigurationError', 'DatabaseError', 'ServiceError'],
    severity: 'critical',
    autoReport: true
  }
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  firstContentfulPaint: { good: 1800, poor: 3000 }, // milliseconds
  largestContentfulPaint: { good: 2500, poor: 4000 },
  firstInputDelay: { good: 100, poor: 300 },
  cumulativeLayoutShift: { good: 0.1, poor: 0.25 },

  // Custom Thresholds
  pageLoadTime: { good: 2000, poor: 5000 },
  apiResponseTime: { good: 500, poor: 2000 },
  memoryUsage: { good: 50, poor: 100 }, // MB
  errorRate: { good: 0.01, poor: 0.05 } // percentage
};

// Configuration Factory Functions
export function createAnalyticsConfig(
  environment: keyof AnalyticsPresets = isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
  overrides: Partial<AnalyticsConfig> = {}
): AnalyticsConfig {
  const baseConfig = ANALYTICS_PRESETS[environment];
  
  return {
    ...baseConfig,
    ...overrides,
    providers: overrides.providers || baseConfig.providers.filter(p => p.enabled)
  };
}

export function getCurrentConfig(): AnalyticsConfig {
  return createAnalyticsConfig();
}

// Configuration Validator
export function validateAnalyticsConfig(config: AnalyticsConfig): string[] {
  const errors: string[] = [];
  
  if (config.samplingRate < 0 || config.samplingRate > 1) {
    errors.push('Sampling rate must be between 0 and 1');
  }
  
  if (config.bufferSize <= 0) {
    errors.push('Buffer size must be greater than 0');
  }
  
  if (config.flushInterval <= 0) {
    errors.push('Flush interval must be greater than 0');
  }
  
  if (config.providers.length === 0) {
    errors.push('At least one analytics provider must be enabled');
  }
  
  return errors;
}

// Export default configuration
export default getCurrentConfig(); 