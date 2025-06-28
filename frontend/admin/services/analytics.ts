// Analytics Service
// Handles all API calls to backend analytics endpoints

import {
  AnalyticsOverview,
  CommunityAnalytics,
  VotingAnalytics,
  UserAnalytics,
  SystemAnalytics,
  LiveMetrics,
  ReportTemplate,
  ReportRequest,
  GeneratedReport,
  ExportJob,
  ExportOptions,
  AnalyticsFilters,
  AnalyticsAPIResponse,
  SystemAlert,
  DashboardLayout,
  DashboardWidget
} from '../types/analytics';

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  // Analytics Overview
  async getAnalyticsOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('start_date', filters.startDate);
    if (filters?.endDate) queryParams.append('end_date', filters.endDate);
    if (filters?.communityId) queryParams.append('community_id', filters.communityId);

    const response = await fetch(
      `${this.baseUrl}/analytics/overview?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics overview: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<AnalyticsOverview> = await response.json();
    return result.data;
  }

  // Community Analytics
  async getCommunityAnalytics(filters?: AnalyticsFilters): Promise<CommunityAnalytics> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('start_date', filters.startDate);
    if (filters?.endDate) queryParams.append('end_date', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(
      `${this.baseUrl}/analytics/communities?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch community analytics: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<CommunityAnalytics> = await response.json();
    return result.data;
  }

  // Voting Analytics
  async getVotingAnalytics(filters?: AnalyticsFilters): Promise<VotingAnalytics> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('start_date', filters.startDate);
    if (filters?.endDate) queryParams.append('end_date', filters.endDate);
    if (filters?.communityId) queryParams.append('community_id', filters.communityId);

    const response = await fetch(
      `${this.baseUrl}/analytics/voting/participation?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch voting analytics: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<VotingAnalytics> = await response.json();
    return result.data;
  }

  // User Analytics
  async getUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('start_date', filters.startDate);
    if (filters?.endDate) queryParams.append('end_date', filters.endDate);

    const response = await fetch(
      `${this.baseUrl}/analytics/users/activity?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user analytics: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<UserAnalytics> = await response.json();
    return result.data;
  }

  // System Analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    const response = await fetch(
      `${this.baseUrl}/analytics/system/health`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch system analytics: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<SystemAnalytics> = await response.json();
    return result.data;
  }

  // Live Metrics
  async getLiveMetrics(): Promise<LiveMetrics> {
    const response = await fetch(
      `${this.baseUrl}/analytics/live`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch live metrics: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<LiveMetrics> = await response.json();
    return result.data;
  }

  // Report Management
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await fetch(
      `${this.baseUrl}/analytics/reports/templates`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch report templates: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<ReportTemplate[]> = await response.json();
    return result.data;
  }

  async generateReport(reportRequest: ReportRequest): Promise<GeneratedReport> {
    const response = await fetch(
      `${this.baseUrl}/analytics/reports/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reportRequest),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<GeneratedReport> = await response.json();
    return result.data;
  }

  async getReports(): Promise<GeneratedReport[]> {
    const response = await fetch(
      `${this.baseUrl}/analytics/reports`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<GeneratedReport[]> = await response.json();
    return result.data;
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/analytics/reports/${reportId}/download`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return await response.blob();
  }

  async deleteReport(reportId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/analytics/reports/${reportId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete report: ${response.statusText}`);
    }
  }

  // Export Functionality
  async exportData(options: ExportOptions): Promise<ExportJob> {
    const response = await fetch(
      `${this.baseUrl}/analytics/export`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to start export: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<ExportJob> = await response.json();
    return result.data;
  }

  async getExportJob(jobId: string): Promise<ExportJob> {
    const response = await fetch(
      `${this.baseUrl}/analytics/export/${jobId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch export job: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<ExportJob> = await response.json();
    return result.data;
  }

  async downloadExport(jobId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/analytics/export/${jobId}/download`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download export: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Cache Management
  async getCacheStats(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/analytics/cache/stats`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<any> = await response.json();
    return result.data;
  }

  async clearCache(pattern?: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/analytics/cache/clear`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pattern }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to clear cache: ${response.statusText}`);
    }
  }

  // Alert Management
  async getSystemAlerts(): Promise<SystemAlert[]> {
    const response = await fetch(
      `${this.baseUrl}/analytics/alerts`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch system alerts: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<SystemAlert[]> = await response.json();
    return result.data;
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/analytics/alerts/${alertId}/acknowledge`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
    }
  }

  // Dashboard Configuration
  async getDashboardLayouts(): Promise<DashboardLayout[]> {
    const response = await fetch(
      `${this.baseUrl}/analytics/dashboard/layouts`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard layouts: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<DashboardLayout[]> = await response.json();
    return result.data;
  }

  async saveDashboardLayout(layout: Omit<DashboardLayout, 'id' | 'created_at' | 'created_by'>): Promise<DashboardLayout> {
    const response = await fetch(
      `${this.baseUrl}/analytics/dashboard/layouts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(layout),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to save dashboard layout: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<DashboardLayout> = await response.json();
    return result.data;
  }

  async updateDashboardLayout(layoutId: string, layout: Partial<DashboardLayout>): Promise<DashboardLayout> {
    const response = await fetch(
      `${this.baseUrl}/analytics/dashboard/layouts/${layoutId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(layout),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update dashboard layout: ${response.statusText}`);
    }

    const result: AnalyticsAPIResponse<DashboardLayout> = await response.json();
    return result.data;
  }

  async deleteDashboardLayout(layoutId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/analytics/dashboard/layouts/${layoutId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete dashboard layout: ${response.statusText}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(
      `${this.baseUrl}/analytics/health`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Analytics service health check failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService; 