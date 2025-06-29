// Charts Hook for Data Visualization
// Task 4.4.4 - Specialized hook for chart management and rendering

import { useState, useCallback } from 'react';
import {
  ChartType,
  ChartData,
  VotingResult,
  TimeSeriesData,
  CommunityAnalytics,
  PersonalAnalytics
} from '../types/results';

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export interface ChartConfig {
  type: ChartType;
  responsive: boolean;
  animationEnabled: boolean;
  showLegend: boolean;
  colorScheme: string[];
  theme: 'light' | 'dark';
}

const defaultChartConfig: ChartConfig = {
  type: 'bar',
  responsive: true,
  animationEnabled: true,
  showLegend: true,
  colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  theme: 'light'
};

// ============================================================================
// CHARTS HOOK
// ============================================================================

export interface UseChartsReturn {
  chartData: ChartData | null;
  config: ChartConfig;
  loading: boolean;
  error: string | null;
  
  generateVotingResultChart: (result: VotingResult, type?: ChartType) => ChartData;
  generateTimeSeriesChart: (data: TimeSeriesData[], title: string) => ChartData;
  generateCommunityAnalyticsChart: (analytics: CommunityAnalytics, metric: string) => ChartData;
  generatePersonalAnalyticsChart: (analytics: PersonalAnalytics, metric: string) => ChartData;
  setChartType: (type: ChartType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateConfig: (newConfig: Partial<ChartConfig>) => void;
  exportChartData: (format: 'json' | 'csv') => string;
}

export const useCharts = (): UseChartsReturn => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [config, setConfig] = useState<ChartConfig>(defaultChartConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVotingResultChart = useCallback((
    result: VotingResult,
    type: ChartType = config.type
  ): ChartData => {
    try {
      setLoading(true);
      setError(null);

      const data: ChartData = {
        labels: result.results.map(r => r.optionText),
        datasets: [{
          label: 'Votes',
          data: result.results.map(r => r.voteCount),
          backgroundColor: config.colorScheme.slice(0, result.results.length)
        }],
        title: result.question.title,
        subtitle: `Total Votes: ${result.totalVotes}`
      };

      setChartData(data);
      setLoading(false);
      return data;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [config]);

  const generateTimeSeriesChart = useCallback((
    data: TimeSeriesData[],
    title: string
  ): ChartData => {
    try {
      setLoading(true);
      setError(null);

      const labels = Array.from(new Set(data.map(d => d.timestamp))).sort();
      const values = labels.map(label => {
        const item = data.find(d => d.timestamp === label);
        return item ? item.value : 0;
      });

      const chartData: ChartData = {
        labels,
        datasets: [{
          label: title,
          data: values,
          borderColor: config.colorScheme[0],
          backgroundColor: config.colorScheme[0] + '20',
          fill: true
        }],
        title
      };

      setChartData(chartData);
      setLoading(false);
      return chartData;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [config]);

  const generateCommunityAnalyticsChart = useCallback((
    analytics: CommunityAnalytics,
    metric: string
  ): ChartData => {
    try {
      setLoading(true);
      setError(null);

      let chartData: ChartData;

      switch (metric) {
        case 'participation':
          chartData = {
            labels: ['Active Members', 'Inactive Members'],
            datasets: [{
              label: 'Member Activity',
              data: [analytics.activeMembers, analytics.totalMembers - analytics.activeMembers],
              backgroundColor: [config.colorScheme[0], config.colorScheme[3]]
            }],
            title: 'Community Participation'
          };
          break;

        case 'top_voters':
          chartData = {
            labels: analytics.mostActiveVoters.slice(0, 5).map(v => v.memberName || 'Anonymous'),
            datasets: [{
              label: 'Total Votes',
              data: analytics.mostActiveVoters.slice(0, 5).map(v => v.totalVotes),
              backgroundColor: config.colorScheme.slice(0, 5)
            }],
            title: 'Most Active Voters'
          };
          break;

        default:
          throw new Error(`Unknown metric: ${metric}`);
      }

      setChartData(chartData);
      setLoading(false);
      return chartData;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [config]);

  const generatePersonalAnalyticsChart = useCallback((
    analytics: PersonalAnalytics,
    metric: string
  ): ChartData => {
    try {
      setLoading(true);
      setError(null);

      let chartData: ChartData;

      switch (metric) {
        case 'community_contributions':
          chartData = {
            labels: analytics.communityContributions.map(c => c.communityName),
            datasets: [{
              label: 'Votes per Community',
              data: analytics.communityContributions.map(c => c.votesInCommunity),
              backgroundColor: config.colorScheme.slice(0, analytics.communityContributions.length)
            }],
            title: 'Community Contributions'
          };
          break;

        case 'achievements':
          const achievementsByCategory = analytics.achievements.reduce((acc, achievement) => {
            acc[achievement.category] = (acc[achievement.category] || 0) + achievement.points;
            return acc;
          }, {} as Record<string, number>);

          chartData = {
            labels: Object.keys(achievementsByCategory),
            datasets: [{
              label: 'Achievement Points',
              data: Object.values(achievementsByCategory),
              backgroundColor: config.colorScheme.slice(0, Object.keys(achievementsByCategory).length)
            }],
            title: 'Achievement Points by Category'
          };
          break;

        default:
          throw new Error(`Unknown metric: ${metric}`);
      }

      setChartData(chartData);
      setLoading(false);
      return chartData;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [config]);

  const setChartType = useCallback((type: ChartType): void => {
    setConfig(prev => ({ ...prev, type }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark'): void => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ChartConfig>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const exportChartData = useCallback((format: 'json' | 'csv'): string => {
    if (!chartData) {
      throw new Error('No chart data available to export');
    }

    if (format === 'json') {
      return JSON.stringify(chartData, null, 2);
    } else {
      const { labels, datasets } = chartData;
      let csv = 'Label,' + datasets.map(d => d.label).join(',') + '\n';
      
      labels.forEach((label, index) => {
        const row = [label, ...datasets.map(d => d.data[index] || 0)];
        csv += row.join(',') + '\n';
      });

      return csv;
    }
  }, [chartData]);

  return {
    chartData,
    config,
    loading,
    error,
    generateVotingResultChart,
    generateTimeSeriesChart,
    generateCommunityAnalyticsChart,
    generatePersonalAnalyticsChart,
    setChartType,
    setTheme,
    updateConfig,
    exportChartData
  };
};

export default useCharts;
