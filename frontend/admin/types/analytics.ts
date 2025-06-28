// Analytics & Reporting Type Definitions
// Comprehensive interfaces for all analytics data models

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters extends DateRange {
  communityId?: string;
  limit?: number;
}

// Community Analytics
export interface CommunityAnalytics {
  total_communities: number;
  active_communities: number;
  member_growth: {
    current_period: number;
    previous_period: number;
    growth_rate: number;
  };
  engagement_metrics: {
    avg_participation_rate: number;
    avg_session_duration: number;
    retention_rate: number;
  };
  health_metrics: {
    healthy_communities: number;
    at_risk_communities: number;
    inactive_communities: number;
  };
}

// Voting Analytics
export interface VotingAnalytics {
  total_votes: number;
  active_questions: number;
  participation_rate: number;
  voting_trends: {
    daily_average: number;
    weekly_growth: number;
    peak_voting_hours: number[];
  };
  question_analytics: {
    total_questions: number;
    completed_questions: number;
    avg_completion_time: number;
  };
  engagement_patterns: {
    repeat_voters: number;
    new_voters: number;
    voter_retention: number;
  };
}

// User Analytics
export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_signups: {
    today: number;
    this_week: number;
    this_month: number;
  };
  user_activity: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
  retention_metrics: {
    day_1_retention: number;
    day_7_retention: number;
    day_30_retention: number;
  };
  geographic_distribution: {
    [country: string]: number;
  };
}

// System Analytics
export interface SystemAnalytics {
  uptime: number;
  performance_metrics: {
    avg_response_time: number;
    api_calls_per_hour: number;
    error_rate: number;
    cache_hit_rate: number;
  };
  resource_usage: {
    cpu_usage: number;
    memory_usage: number;
    storage_usage: number;
    bandwidth_usage: number;
  };
  security_metrics: {
    failed_login_attempts: number;
    suspicious_activities: number;
    blocked_ips: number;
  };
}

// Combined Analytics Overview
export interface AnalyticsOverview {
  community: CommunityAnalytics;
  voting: VotingAnalytics;
  users: UserAnalytics;
  system: SystemAnalytics;
  last_updated: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface TimeSeriesData {
  label: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  data: TimeSeriesData[];
  options?: {
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
    responsive?: boolean;
  };
}

// Report Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'compliance' | 'growth' | 'custom';
  sections: string[];
  default_filters: AnalyticsFilters;
}

export interface ReportRequest {
  template_id: string;
  filters: AnalyticsFilters;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  delivery_method: 'download' | 'email' | 'scheduled';
  email?: string;
  schedule?: 'daily' | 'weekly' | 'monthly';
}

export interface GeneratedReport {
  id: string;
  name: string;
  template_id: string;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  file_url?: string;
  file_size?: number;
  expires_at?: string;
}

// Dashboard Configuration
export interface DashboardWidget {
  id: string;
  type: 'metric_card' | 'chart' | 'table' | 'alert';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: {
    data_source: string;
    refresh_interval: number;
    filters?: AnalyticsFilters;
    chart_config?: ChartConfig;
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created_by: string;
  created_at: string;
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg';
  data_range: DateRange;
  include_charts: boolean;
  include_raw_data: boolean;
  email_delivery?: string;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  download_url?: string;
  error_message?: string;
}

// Real-time Metrics
export interface LiveMetrics {
  online_users: number;
  active_voters: number;
  current_votes: number;
  revenue_today: number;
  system_load: {
    cpu: number;
    memory: number;
    response_time: number;
  };
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  url?: string;
}

// Analytics API Response Types
export interface AnalyticsAPIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error Types
export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
} 