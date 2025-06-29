import { useState, useEffect, useRef, useCallback } from 'react';

interface UseRealTimeDataOptions {
  endpoint: string;
  pollInterval?: number;
  enableWebSocket?: boolean;
  onDataUpdate?: (data: any) => void;
  onConnectionChange?: (connected: boolean) => void;
}

interface RealTimeDataState<T> {
  data: T | null;
  loading: boolean;
  connected: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useRealTimeData<T = any>(options: UseRealTimeDataOptions) {
  const [state, setState] = useState<RealTimeDataState<T>>({
    data: null,
    loading: true,
    connected: false,
    error: null,
    lastUpdated: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const {
    endpoint,
    pollInterval = 5000,
    enableWebSocket = true,
    onDataUpdate,
    onConnectionChange
  } = options;

  // Update data and trigger callbacks
  const updateData = useCallback((newData: T) => {
    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      data: newData,
      loading: false,
      error: null,
      lastUpdated: new Date()
    }));

    if (onDataUpdate) {
      onDataUpdate(newData);
    }
  }, [onDataUpdate]);

  // Handle connection status changes
  const updateConnectionStatus = useCallback((connected: boolean) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, connected }));
    
    if (onConnectionChange) {
      onConnectionChange(connected);
    }
  }, [onConnectionChange]);

  // Handle errors
  const handleError = useCallback((error: string) => {
    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      error,
      loading: false,
      connected: false
    }));
  }, []);

  // Fetch data via HTTP (polling fallback)
  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      updateData(data);
      updateConnectionStatus(true);
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to fetch data');
    }
  }, [endpoint, updateData, updateConnectionStatus, handleError]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    fetchData();
  }, [fetchData]);

  // Initialize connection on mount
  useEffect(() => {
    mountedRef.current = true;
    
    // For demo purposes, we'll primarily use polling
    const pollData = () => {
      fetchData();
    };

    // Initial fetch
    pollData();

    // Set up polling interval
    pollIntervalRef.current = setInterval(pollData, pollInterval);

    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchData, pollInterval]);

  return {
    ...state,
    refresh,
    isWebSocketEnabled: enableWebSocket,
    isPolling: true
  };
}
