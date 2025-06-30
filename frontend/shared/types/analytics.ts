/**
 * Analytics Integration Type Definitions
 * 
 * Comprehensive types for analytics tracking, user behavior monitoring,
 * performance metrics, and data analysis in the PFM application.
 */

// Core Analytics Types
export type EventCategory = 
  | 'user_interaction' 
  | 'navigation' 
  | 'performance' 
  | 'error' 
  | 'conversion' 
  | 'blockchain' 
  | 'community' 
  | 'voting' 
  | 'wallet'
  | 'system';

export type EventAction = 
  | 'click' 
  | 'view' 
  | 'submit' 
  | 'load' 
  | 'error' 
  | 'connect' 
  | 'disconnect' 
  | 'create' 
  | 'update' 
  | 'delete'
  | 'vote'
  | 'join'
  | 'leave'
  | 'share'
  | 'export'
  | 'search'
  | 'filter'
  | 'scroll'
  | 'resize';

export type EventLabel = string;
export type EventValue = number;

// Event Tracking
export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  category: EventCategory;
  action: EventAction;
  label?: EventLabel;
  value?: EventValue;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  referrer?: string;
}

// User Behavior Tracking
export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // In milliseconds
  pageViews: number;
  events: number;
  bounced: boolean;
  converted: boolean;
  entryPage: string;
  exitPage?: string;
  device: DeviceInfo;
  location: LocationInfo;
}

export interface PageView {
  id: string;
  sessionId: string;
  userId?: string;
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage?: number; // In milliseconds
  scrollDepth?: number; // Percentage
  exitEvent?: boolean;
  referrer?: string;
}

export interface UserInteraction {
  id: string;
  sessionId: string;
  userId?: string;
  element: string;
  elementType: string;
  action: EventAction;
  timestamp: Date;
  coordinates?: { x: number; y: number };
  metadata?: Record<string, any>;
}

// Device and Environment Info
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  viewportSize: string;
  touchEnabled: boolean;
  cookiesEnabled: boolean;
  jsEnabled: boolean;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
  language: string;
  currency?: string;
}

// Performance Monitoring
export interface PerformanceMetrics {
  id: string;
  timestamp: Date;
  sessionId: string;
  url: string;
  
  // Core Web Vitals
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  
  // Additional Performance Metrics
  domContentLoaded?: number;
  loadComplete?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  
  // Memory Usage
  memoryUsed?: number;
  memoryLimit?: number;
  
  // Network
  connectionType?: string;
  effectiveConnectionType?: string;
  
  // Custom Metrics
  customMetrics?: Record<string, number>;
}

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  
  // Error Details
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  
  // Context
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'blockchain' | 'user' | 'system';
  
  // Additional Info
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolutionTime?: number;
}

// Business Intelligence
export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  timeframe: TimeFrame;
  filters?: AnalyticsFilter[];
}

export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  criteria: EventCriteria;
  order: number;
  required: boolean;
}

export interface EventCriteria {
  category?: EventCategory;
  action?: EventAction;
  label?: string;
  properties?: Record<string, any>;
  url?: string;
}

export interface ConversionData {
  funnelId: string;
  totalUsers: number;
  stepData: StepData[];
  conversionRate: number;
  averageTime: number;
  dropoffPoints: DropoffPoint[];
}

export interface StepData {
  stepId: string;
  users: number;
  percentage: number;
  averageTime: number;
  dropoffRate: number;
}

export interface DropoffPoint {
  fromStep: string;
  toStep: string;
  dropoffRate: number;
  commonExitPages: string[];
}

// Analytics Configuration
export interface AnalyticsConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  
  // Providers
  providers: AnalyticsProvider[];
  
  // Data Collection
  collectUserData: boolean;
  collectPerformanceData: boolean;
  collectErrorData: boolean;
  collectInteractionData: boolean;
  
  // Privacy Settings
  respectDoNotTrack: boolean;
  anonymizeIp: boolean;
  cookieConsent: boolean;
  gdprCompliant: boolean;
  
  // Sampling
  samplingRate: number; // 0.0 to 1.0
  performanceSamplingRate: number;
  errorSamplingRate: number;
  
  // Buffering
  bufferSize: number;
  flushInterval: number; // In milliseconds
  
  // Custom Settings
  customDimensions?: CustomDimension[];
  customMetrics?: CustomMetric[];
}

export interface AnalyticsProvider {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  trackPageViews: boolean;
  trackEvents: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
}

export interface CustomDimension {
  id: string;
  name: string;
  scope: 'hit' | 'session' | 'user';
  getValue: (context: any) => string;
}

export interface CustomMetric {
  id: string;
  name: string;
  type: 'integer' | 'currency' | 'time';
  getValue: (context: any) => number;
}

// Data Analysis and Reporting
export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  timeframe: TimeFrame;
  filters: AnalyticsFilter[];
  metrics: MetricDefinition[];
  dimensions: DimensionDefinition[];
  data: ReportData;
  generatedAt: Date;
  schedule?: ReportSchedule;
}

export type ReportType = 
  | 'overview' 
  | 'user_behavior' 
  | 'performance' 
  | 'conversion' 
  | 'content' 
  | 'technical'
  | 'custom';

export interface TimeFrame {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  timezone?: string;
}

export interface AnalyticsFilter {
  dimension: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[] | number[];
}

export interface MetricDefinition {
  id: string;
  name: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'ratio';
  format: 'number' | 'percentage' | 'currency' | 'time';
  calculation?: string;
}

export interface DimensionDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  groupable: boolean;
  filterable: boolean;
}

export interface ReportData {
  rows: ReportRow[];
  totals: Record<string, number>;
  summary: ReportSummary;
}

export interface ReportRow {
  dimensions: Record<string, any>;
  metrics: Record<string, number>;
}

export interface ReportSummary {
  totalRows: number;
  dateRange: TimeFrame;
  samplingLevel: number;
  containsSampledData: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  timezone: string;
  recipients: string[];
  format: 'json' | 'csv' | 'pdf';
}

// Real-time Analytics
export interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  pageViews: number;
  events: number;
  conversions: number;
  errors: number;
  averagePageLoadTime: number;
  topPages: PageStats[];
  topEvents: EventStats[];
  geographicData: GeographicStats[];
  deviceData: DeviceStats[];
}

export interface PageStats {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

export interface EventStats {
  category: EventCategory;
  action: EventAction;
  label?: string;
  count: number;
  uniqueCount: number;
  averageValue?: number;
}

export interface GeographicStats {
  country: string;
  users: number;
  sessions: number;
  pageViews: number;
  averageSessionDuration: number;
}

export interface DeviceStats {
  type: string;
  users: number;
  sessions: number;
  conversionRate: number;
  averageSessionDuration: number;
}

// Analytics Dashboard
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: AnalyticsFilter[];
  refreshInterval: number; // In seconds
  isPublic: boolean;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  config: WidgetConfig;
  position: WidgetPosition;
  dataSource: DataSource;
}

export type WidgetType = 
  | 'metric' 
  | 'chart' 
  | 'table' 
  | 'funnel' 
  | 'heatmap' 
  | 'gauge' 
  | 'counter'
  | 'trend';

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  timeframe: TimeFrame;
  metrics: string[];
  dimensions: string[];
  filters: AnalyticsFilter[];
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  showLegend?: boolean;
  showDataLabels?: boolean;
  color?: string;
  customOptions?: Record<string, any>;
}

export interface WidgetPosition {
  row: number;
  column: number;
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: number;
  padding: number;
  responsive: boolean;
}

export interface DataSource {
  type: 'analytics' | 'database' | 'api' | 'static';
  connection: string;
  query?: string;
  refreshRate: number; // In seconds
  cache: boolean;
  cacheTtl?: number; // In seconds
}

// Event System
export interface AnalyticsEvents {
  'analytics:event': AnalyticsEvent;
  'analytics:pageview': PageView;
  'analytics:error': ErrorEvent;
  'analytics:performance': PerformanceMetrics;
  'analytics:session_start': UserSession;
  'analytics:session_end': UserSession;
  'analytics:conversion': ConversionEvent;
  'analytics:flush': { events: number; timestamp: Date };
}

export interface ConversionEvent {
  id: string;
  sessionId: string;
  userId?: string;
  timestamp: Date;
  type: string;
  value?: number;
  currency?: string;
  properties?: Record<string, any>;
}

// Hook Return Types
export interface UseAnalyticsReturn {
  // Tracking Methods
  track: (category: EventCategory, action: EventAction, label?: string, value?: number, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (url?: string, title?: string, properties?: Record<string, any>) => Promise<void>;
  trackError: (error: Error, metadata?: Record<string, any>) => Promise<void>;
  trackPerformance: (metrics: Partial<PerformanceMetrics>) => Promise<void>;
  trackConversion: (type: string, value?: number, properties?: Record<string, any>) => Promise<void>;
  
  // User Management
  identify: (userId: string, properties?: Record<string, any>) => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  
  // Session Management
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  
  // Configuration
  setConfig: (config: Partial<AnalyticsConfig>) => void;
  getConfig: () => AnalyticsConfig;
  
  // State
  isEnabled: boolean;
  isInitialized: boolean;
  sessionId: string | null;
  userId: string | null;
  
  // Data Access
  getRealtimeMetrics: () => Promise<RealTimeMetrics>;
  generateReport: (config: Partial<AnalyticsReport>) => Promise<AnalyticsReport>;
  
  // Event Listeners
  addEventListener: <K extends keyof AnalyticsEvents>(event: K, handler: (data: AnalyticsEvents[K]) => void) => void;
  removeEventListener: <K extends keyof AnalyticsEvents>(event: K, handler: (data: AnalyticsEvents[K]) => void) => void;
}

// Service Interface
export interface AnalyticsService {
  // Initialization
  initialize: (config?: Partial<AnalyticsConfig>) => Promise<void>;
  shutdown: () => Promise<void>;
  
  // Event Tracking
  track: (event: Partial<AnalyticsEvent>) => Promise<void>;
  trackPageView: (pageView: Partial<PageView>) => Promise<void>;
  trackError: (error: Partial<ErrorEvent>) => Promise<void>;
  trackPerformance: (metrics: Partial<PerformanceMetrics>) => Promise<void>;
  
  // User Management
  identify: (userId: string, properties?: Record<string, any>) => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  
  // Session Management
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  getCurrentSession: () => UserSession | null;
  
  // Data Collection
  flush: () => Promise<void>;
  getBufferedEvents: () => AnalyticsEvent[];
  clearBuffer: () => void;
  
  // Configuration
  updateConfig: (config: Partial<AnalyticsConfig>) => void;
  getConfig: () => AnalyticsConfig;
  
  // Reporting
  generateReport: (config: Partial<AnalyticsReport>) => Promise<AnalyticsReport>;
  getRealtimeMetrics: () => Promise<RealTimeMetrics>;
  
  // Events
  on: <K extends keyof AnalyticsEvents>(event: K, handler: (data: AnalyticsEvents[K]) => void) => void;
  off: <K extends keyof AnalyticsEvents>(event: K, handler: (data: AnalyticsEvents[K]) => void) => void;
  emit: <K extends keyof AnalyticsEvents>(event: K, data: AnalyticsEvents[K]) => void;
}

// Utility Types
export type AnalyticsActionType = 
  | 'INITIALIZE'
  | 'SET_CONFIG'
  | 'START_SESSION'
  | 'END_SESSION'
  | 'TRACK_EVENT'
  | 'TRACK_PAGEVIEW'
  | 'TRACK_ERROR'
  | 'TRACK_PERFORMANCE'
  | 'SET_USER'
  | 'FLUSH_EVENTS'
  | 'SET_ERROR'
  | 'CLEAR_ERROR';

export interface AnalyticsAction {
  type: AnalyticsActionType;
  payload?: any;
}

// Error Types
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

// Configuration Presets
export interface AnalyticsPresets {
  development: AnalyticsConfig;
  staging: AnalyticsConfig;
  production: AnalyticsConfig;
}

// Export utility type helpers
export type TrackingFunction = (category: EventCategory, action: EventAction, label?: string, value?: number, properties?: Record<string, any>) => Promise<void>;
export type PageViewFunction = (url?: string, title?: string, properties?: Record<string, any>) => Promise<void>;
export type ErrorTrackingFunction = (error: Error, metadata?: Record<string, any>) => Promise<void>; 