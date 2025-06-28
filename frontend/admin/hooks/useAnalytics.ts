// Analytics Hooks
// React hooks for analytics state management and API interactions

import { useState, useEffect, useCallback, useRef } from 'react';
import analyticsService from '../services/analytics';
import {
  AnalyticsOverview,
  CommunityAnalytics,
  VotingAnalytics,
  UserAnalytics,
  SystemAnalytics,
  LiveMetrics,
  ReportTemplate,
  GeneratedReport,
  ExportJob,
  AnalyticsFilters,
  SystemAlert,
  DashboardLayout,
  ExportOptions,
  ReportRequest
} from '../types/analytics';

// Hook for analytics overview
export const useAnalyticsOverview = (filters?: AnalyticsFilters) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getAnalyticsOverview(filters);
      setOverview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics overview');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refreshOverview: fetchOverview
  };
};

// Hook for community analytics
export const useCommunityAnalytics = (filters?: AnalyticsFilters) => {
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getCommunityAnalytics(filters);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch community analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Hook for voting analytics
export const useVotingAnalytics = (filters?: AnalyticsFilters) => {
  const [analytics, setAnalytics] = useState<VotingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getVotingAnalytics(filters);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voting analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Hook for user analytics
export const useUserAnalytics = (filters?: AnalyticsFilters) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getUserAnalytics(filters);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Hook for system analytics
export const useSystemAnalytics = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getSystemAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Hook for live metrics with auto-refresh
export const useLiveMetrics = (refreshInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getLiveMetrics();
      setMetrics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch live metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(fetchMetrics, refreshInterval);
    setIsAutoRefresh(true);
  }, [fetchMetrics, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoRefresh(false);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    if (isAutoRefresh) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  }, [isAutoRefresh, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    fetchMetrics();
    if (isAutoRefresh) {
      startAutoRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMetrics, startAutoRefresh, isAutoRefresh]);

  return {
    metrics,
    loading,
    error,
    isAutoRefresh,
    refreshMetrics: fetchMetrics,
    toggleAutoRefresh,
    startAutoRefresh,
    stopAutoRefresh
  };
};

// Hook for report management
export const useReports = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getReportTemplates();
      setTemplates(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getReports();
      setReports(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (request: ReportRequest): Promise<GeneratedReport> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.generateReport(request);
      // Refresh reports list to include the new report
      await fetchReports();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  const downloadReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      const blob = await analyticsService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await analyticsService.deleteReport(reportId);
      // Refresh reports list to remove the deleted report
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  useEffect(() => {
    fetchTemplates();
    fetchReports();
  }, [fetchTemplates, fetchReports]);

  return {
    templates,
    reports,
    loading,
    error,
    generateReport,
    downloadReport,
    deleteReport,
    refreshTemplates: fetchTemplates,
    refreshReports: fetchReports
  };
};

// Hook for data export functionality
export const useDataExport = () => {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExport = useCallback(async (options: ExportOptions): Promise<ExportJob> => {
    setLoading(true);
    setError(null);
    
    try {
      const job = await analyticsService.exportData(options);
      setExportJobs(prev => [...prev, job]);
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start export';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getExportStatus = useCallback(async (jobId: string): Promise<ExportJob> => {
    try {
      const job = await analyticsService.getExportJob(jobId);
      // Update the job in the list
      setExportJobs(prev => 
        prev.map(j => j.id === jobId ? job : j)
      );
      return job;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get export status');
    }
  }, []);

  const downloadExport = useCallback(async (jobId: string): Promise<void> => {
    try {
      const blob = await analyticsService.downloadExport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download export');
    }
  }, []);

  return {
    exportJobs,
    loading,
    error,
    startExport,
    getExportStatus,
    downloadExport
  };
};

// Hook for system alerts
export const useSystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getSystemAlerts();
      setAlerts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await analyticsService.acknowledgeAlert(alertId);
      // Update the alert in the list
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: true } 
            : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    acknowledgeAlert,
    refreshAlerts: fetchAlerts
  };
};

// Hook for dashboard layouts
export const useDashboardLayouts = () => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getDashboardLayouts();
      setLayouts(result);
      // Set default layout as current
      const defaultLayout = result.find(layout => layout.is_default);
      if (defaultLayout && !currentLayout) {
        setCurrentLayout(defaultLayout);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard layouts');
    } finally {
      setLoading(false);
    }
  }, [currentLayout]);

  const saveLayout = useCallback(async (layout: Omit<DashboardLayout, 'id' | 'created_at' | 'created_by'>): Promise<DashboardLayout> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.saveDashboardLayout(layout);
      setLayouts(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save dashboard layout';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLayout = useCallback(async (layoutId: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.updateDashboardLayout(layoutId, updates);
      setLayouts(prev => 
        prev.map(layout => layout.id === layoutId ? result : layout)
      );
      if (currentLayout?.id === layoutId) {
        setCurrentLayout(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dashboard layout';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentLayout]);

  const deleteLayout = useCallback(async (layoutId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await analyticsService.deleteDashboardLayout(layoutId);
      setLayouts(prev => prev.filter(layout => layout.id !== layoutId));
      if (currentLayout?.id === layoutId) {
        const remainingLayouts = layouts.filter(layout => layout.id !== layoutId);
        const defaultLayout = remainingLayouts.find(layout => layout.is_default);
        setCurrentLayout(defaultLayout || remainingLayouts[0] || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dashboard layout');
    } finally {
      setLoading(false);
    }
  }, [currentLayout, layouts]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  return {
    layouts,
    currentLayout,
    loading,
    error,
    setCurrentLayout,
    saveLayout,
    updateLayout,
    deleteLayout,
    refreshLayouts: fetchLayouts
  };
};

// Hook for cache management
export const useCacheManagement = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCacheStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getCacheStats();
      setCacheStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(async (pattern?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await analyticsService.clearCache(pattern);
      // Refresh cache stats after clearing
      await fetchCacheStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      setLoading(false);
    }
  }, [fetchCacheStats]);

  useEffect(() => {
    fetchCacheStats();
  }, [fetchCacheStats]);

  return {
    cacheStats,
    loading,
    error,
    clearCache,
    refreshCacheStats: fetchCacheStats
  };
}; 