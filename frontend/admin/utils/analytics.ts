// Analytics Utility Functions
// Helper functions for analytics data manipulation, formatting, and chart configuration

import { 
  ChartDataPoint, 
  TimeSeriesData, 
  ChartConfig, 
  AnalyticsFilters,
  DateRange,
  AnalyticsOverview,
  CommunityAnalytics,
  VotingAnalytics,
  UserAnalytics,
  SystemAnalytics,
  LiveMetrics
} from '../types/analytics';

// Date utility functions
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const getDateRange = (period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom', customRange?: DateRange): DateRange => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'custom':
      if (customRange) {
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
      }
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Number formatting utilities
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Growth calculation utilities
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateChangeIndicator = (current: number, previous: number): {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
} => {
  const change = current - previous;
  const percentage = calculateGrowthRate(current, previous);
  
  return {
    value: change,
    percentage,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
};

// Chart data transformation utilities
export const transformToChartData = (data: Array<{ date: string; value: number }>, label: string): TimeSeriesData => {
  return {
    label,
    data: data.map(item => ({
      label: formatDate(item.date),
      value: item.value,
      date: item.date
    }))
  };
};

export const createChartConfig = (
  type: ChartConfig['type'],
  title: string,
  data: TimeSeriesData[],
  options?: ChartConfig['options']
): ChartConfig => {
  return {
    type,
    title,
    data,
    options: {
      showLegend: true,
      showGrid: true,
      animate: true,
      responsive: true,
      ...options
    }
  };
};

// Color utilities for charts
export const getChartColors = (index: number): string => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];
  return colors[index % colors.length];
};

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'healthy': '#10B981',
    'warning': '#F59E0B',
    'error': '#EF4444',
    'info': '#3B82F6',
    'success': '#10B981',
    'active': '#10B981',
    'inactive': '#6B7280',
    'pending': '#F59E0B',
    'completed': '#10B981',
    'failed': '#EF4444'
  };
  return statusColors[status.toLowerCase()] || '#6B7280';
};

// Analytics summary utilities
export const calculateEngagementScore = (analytics: CommunityAnalytics): number => {
  const participationWeight = 0.4;
  const retentionWeight = 0.3;
  const healthWeight = 0.3;
  
  const participationScore = Math.min(analytics.engagement_metrics.avg_participation_rate * 100, 100);
  const retentionScore = analytics.engagement_metrics.retention_rate;
  const healthScore = (analytics.health_metrics.healthy_communities / analytics.total_communities) * 100;
  
  return Math.round(
    (participationScore * participationWeight) +
    (retentionScore * retentionWeight) +
    (healthScore * healthWeight)
  );
};

export const getSystemHealthStatus = (analytics: SystemAnalytics): {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  color: string;
  message: string;
} => {
  const uptime = analytics.uptime;
  const responseTime = analytics.performance_metrics.avg_response_time;
  const errorRate = analytics.performance_metrics.error_rate;
  
  if (uptime >= 99.5 && responseTime <= 2000 && errorRate <= 0.1) {
    return {
      status: 'excellent',
      color: '#10B981',
      message: 'All systems operating optimally'
    };
  } else if (uptime >= 99.0 && responseTime <= 3000 && errorRate <= 0.5) {
    return {
      status: 'good',
      color: '#3B82F6',
      message: 'Systems operating normally'
    };
  } else if (uptime >= 98.0 && responseTime <= 5000 && errorRate <= 1.0) {
    return {
      status: 'warning',
      color: '#F59E0B',
      message: 'Some performance issues detected'
    };
  } else {
    return {
      status: 'critical',
      color: '#EF4444',
      message: 'Critical system issues require attention'
    };
  }
};

export const calculateRetentionTrend = (userAnalytics: UserAnalytics): {
  trend: 'improving' | 'stable' | 'declining';
  message: string;
} => {
  const { day_1_retention, day_7_retention, day_30_retention } = userAnalytics.retention_metrics;
  
  if (day_30_retention >= day_7_retention && day_7_retention >= day_1_retention) {
    return {
      trend: 'improving',
      message: 'User retention is improving over time'
    };
  } else if (Math.abs(day_30_retention - day_1_retention) <= 5) {
    return {
      trend: 'stable',
      message: 'User retention remains stable'
    };
  } else {
    return {
      trend: 'declining',
      message: 'User retention shows declining trend'
    };
  }
};

// Export utilities
export const generateReportData = (analytics: AnalyticsOverview): any => {
  return {
    summary: {
      total_communities: analytics.community.total_communities,
      total_users: analytics.users.total_users,
      total_votes: analytics.voting.total_votes,
      system_uptime: analytics.system.uptime
    },
    community_health: calculateEngagementScore(analytics.community),
    system_status: getSystemHealthStatus(analytics.system),
    retention_trend: calculateRetentionTrend(analytics.users),
    generated_at: new Date().toISOString()
  };
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Validation utilities
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && start <= new Date() && end <= new Date();
};

export const validateAnalyticsFilters = (filters: AnalyticsFilters): string[] => {
  const errors: string[] = [];
  
  if (filters.startDate && filters.endDate) {
    if (!validateDateRange(filters.startDate, filters.endDate)) {
      errors.push('Start date must be before end date and not in the future');
    }
  }
  
  if (filters.limit && (filters.limit < 1 || filters.limit > 1000)) {
    errors.push('Limit must be between 1 and 1000');
  }
  
  return errors;
};

// Mock data generators for development/testing
export const generateMockTimeSeriesData = (days: number, label: string, baseValue: number = 100): TimeSeriesData => {
  const data: ChartDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate some realistic variation
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const trend = i * 2; // Small upward trend
    const value = Math.max(0, Math.round(baseValue + (baseValue * variation) + trend));
    
    data.push({
      label: formatDate(date),
      value,
      date: date.toISOString().split('T')[0]
    });
  }
  
  return { label, data };
};

export const generateMockAnalyticsOverview = (): AnalyticsOverview => {
  return {
    community: {
      total_communities: 24,
      active_communities: 22,
      member_growth: {
        current_period: 1247,
        previous_period: 1199,
        growth_rate: 4.0
      },
      engagement_metrics: {
        avg_participation_rate: 0.78,
        avg_session_duration: 1470, // 24.5 minutes in seconds
        retention_rate: 82.5
      },
      health_metrics: {
        healthy_communities: 20,
        at_risk_communities: 3,
        inactive_communities: 1
      }
    },
    voting: {
      total_votes: 5432,
      active_questions: 12,
      participation_rate: 78.5,
      voting_trends: {
        daily_average: 145,
        weekly_growth: 8.2,
        peak_voting_hours: [14, 15, 16, 19, 20] // 2-4 PM and 7-8 PM
      },
      question_analytics: {
        total_questions: 89,
        completed_questions: 76,
        avg_completion_time: 432000 // 5 days in seconds
      },
      engagement_patterns: {
        repeat_voters: 892,
        new_voters: 355,
        voter_retention: 71.5
      }
    },
    users: {
      total_users: 1247,
      active_users: 892,
      new_signups: {
        today: 12,
        this_week: 48,
        this_month: 186
      },
      user_activity: {
        daily_active_users: 324,
        weekly_active_users: 756,
        monthly_active_users: 1089
      },
      retention_metrics: {
        day_1_retention: 85.2,
        day_7_retention: 68.9,
        day_30_retention: 42.3
      },
      geographic_distribution: {
        'United States': 456,
        'Canada': 234,
        'United Kingdom': 187,
        'Germany': 123,
        'Australia': 89,
        'Other': 158
      }
    },
    system: {
      uptime: 99.8,
      performance_metrics: {
        avg_response_time: 1800, // 1.8 seconds in milliseconds
        api_calls_per_hour: 12450,
        error_rate: 0.02,
        cache_hit_rate: 94.5
      },
      resource_usage: {
        cpu_usage: 34.2,
        memory_usage: 68.7,
        storage_usage: 45.3,
        bandwidth_usage: 23.8
      },
      security_metrics: {
        failed_login_attempts: 23,
        suspicious_activities: 2,
        blocked_ips: 15
      }
    },
    last_updated: new Date().toISOString()
  };
};

// Chart configuration presets
export const getMetricCardConfig = (title: string, current: number, previous: number, format: 'number' | 'currency' | 'percentage' = 'number') => {
  const change = calculateChangeIndicator(current, previous);
  
  let formattedCurrent: string;
  let formattedChange: string;
  
  switch (format) {
    case 'currency':
      formattedCurrent = formatCurrency(current);
      formattedChange = formatCurrency(Math.abs(change.value));
      break;
    case 'percentage':
      formattedCurrent = formatPercentage(current);
      formattedChange = formatPercentage(Math.abs(change.percentage));
      break;
    default:
      formattedCurrent = formatNumber(current);
      formattedChange = formatNumber(Math.abs(change.value));
  }
  
  return {
    title,
    value: formattedCurrent,
    change: {
      value: `${change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}${formattedChange}`,
      trend: change.trend,
      percentage: formatPercentage(Math.abs(change.percentage))
    }
  };
}; 