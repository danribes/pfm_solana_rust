import React, { useState, useEffect, useCallback } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import ChartWrapper from './ChartWrapper';
import { ChartData, ChartType } from '../types/results';

interface RealTimeChartWrapperProps {
  endpoint: string;
  type: ChartType;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTitle?: boolean;
  refreshInterval?: number;
  animationDuration?: number;
  interactive?: boolean;
  onDataUpdate?: (data: ChartData) => void;
}

const RealTimeChartWrapper: React.FC<RealTimeChartWrapperProps> = ({
  endpoint,
  type,
  height = 300,
  className = '',
  showLegend = true,
  showTitle = true,
  refreshInterval = 5000,
  animationDuration = 500,
  interactive = true,
  onDataUpdate
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousData, setPreviousData] = useState<ChartData | null>(null);

  const { 
    data, 
    loading, 
    connected, 
    error, 
    lastUpdated, 
    refresh 
  } = useRealTimeData<ChartData>({
    endpoint,
    pollInterval: refreshInterval,
    enableWebSocket: false, // Using polling for demo
    onDataUpdate: (newData) => {
      if (onDataUpdate) {
        onDataUpdate(newData);
      }
      
      // Trigger animation on data change
      if (previousData && JSON.stringify(previousData) !== JSON.stringify(newData)) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), animationDuration);
      }
      
      setPreviousData(newData);
    }
  });

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Render loading state
  if (loading && !data) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm text-center">
            Failed to load data: {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render chart with real-time indicators
  return (
    <div className={`relative ${className}`}>
      {/* Real-time status indicator */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
        {/* Connection status */}
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        
        {/* Loading indicator */}
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
        
        {/* Last updated timestamp */}
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        
        {/* Manual refresh button */}
        {interactive && (
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Chart component with animation */}
      <div className={`transition-opacity duration-${animationDuration} ${isAnimating ? 'opacity-75' : 'opacity-100'}`}>
        {data && (
          <ChartWrapper
            data={data}
            type={type}
            height={height}
            showLegend={showLegend}
            showTitle={showTitle}
          />
        )}
      </div>

      {/* Update notification */}
      {isAnimating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs animate-bounce">
          Data Updated
        </div>
      )}
    </div>
  );
};

export default RealTimeChartWrapper;
