/**
 * useOffline Hook
 * 
 * React hook for accessing offline functionality in components.
 * Provides state management and utility functions for offline operations.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  UseOfflineReturn,
  OfflineState,
  NetworkStatus,
  SyncStatus,
  OfflineOperation,
  DataConflict,
  OfflineEvents,
  ConflictResolution
} from '../types/offline';

import offlineService from '../services/offline';

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(offlineService.getNetworkStatus());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineService.getSyncStatus());
  const [operationQueue, setOperationQueue] = useState<OfflineOperation[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  
  const eventHandlersRef = useRef<Map<keyof OfflineEvents, Function>>(new Map());

  // Initialize on mount
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await offlineService.initialize();
        
        // Set up event listeners
        const handlers = {
          'connection:online': (status: NetworkStatus) => {
            setIsOnline(true);
            setNetworkStatus(status);
          },
          'connection:offline': (status: NetworkStatus) => {
            setIsOnline(false);
            setNetworkStatus(status);
          },
          'connection:unstable': (status: NetworkStatus) => {
            setNetworkStatus(status);
          },
          'operation:queued': () => {
            setOperationQueue(offlineService.getQueuedOperations());
          },
          'operation:synced': () => {
            setOperationQueue(offlineService.getQueuedOperations());
          },
          'operation:failed': () => {
            setOperationQueue(offlineService.getQueuedOperations());
          },
          'sync:started': (status: SyncStatus) => {
            setSyncStatus(status);
          },
          'sync:completed': (status: SyncStatus) => {
            setSyncStatus(status);
          },
          'sync:failed': (status: SyncStatus) => {
            setSyncStatus(status);
          },
          'conflict:detected': () => {
            setConflicts(offlineService.getConflicts());
          },
          'conflict:resolved': () => {
            setConflicts(offlineService.getConflicts());
          }
        };

        // Register event handlers
        Object.entries(handlers).forEach(([event, handler]) => {
          offlineService.on(event as keyof OfflineEvents, handler);
          eventHandlersRef.current.set(event as keyof OfflineEvents, handler);
        });

        // Initial state sync
        setNetworkStatus(offlineService.getNetworkStatus());
        setSyncStatus(offlineService.getSyncStatus());
        setOperationQueue(offlineService.getQueuedOperations());
        setConflicts(offlineService.getConflicts());
        
      } catch (error) {
        console.error('Failed to initialize offline service:', error);
      }
    };

    initializeOffline();

    // Cleanup on unmount
    return () => {
      eventHandlersRef.current.forEach((handler, event) => {
        offlineService.off(event, handler);
      });
      eventHandlersRef.current.clear();
    };
  }, []);

  // Queue operation
  const queueOperation = useCallback(async (
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>
  ): Promise<string> => {
    try {
      return await offlineService.queueOperation(operation);
    } catch (error) {
      console.error('Failed to queue operation:', error);
      throw error;
    }
  }, []);

  // Manual sync
  const syncNow = useCallback(async (): Promise<void> => {
    try {
      await offlineService.syncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  }, []);

  // Clear operation queue
  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      await offlineService.clearQueue();
      setOperationQueue([]);
    } catch (error) {
      console.error('Failed to clear queue:', error);
      throw error;
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: ConflictResolution,
    data?: any
  ): Promise<void> => {
    try {
      await offlineService.resolveConflict(conflictId, resolution, data);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }, []);

  // Cache management
  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      return await offlineService.getCachedData<T>(key);
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, []);

  const setCachedData = useCallback(async <T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<void> => {
    try {
      await offlineService.setCachedData(key, data, ttl);
    } catch (error) {
      console.error('Failed to set cached data:', error);
      throw error;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await offlineService.clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }, []);

  // Utility functions
  const isFeatureAvailable = useCallback((feature: string): boolean => {
    const currentConfig = offlineService.getSyncStatus();
    // Check if feature is available based on network status and configuration
    if (!isOnline) {
      // Check if feature works offline
      const offlineFeatures = ['view_communities', 'view_votes', 'cache_data', 'queue_operations'];
      return offlineFeatures.includes(feature);
    }
    return true; // All features available when online
  }, [isOnline]);

  const getDataAge = useCallback(async (key: string): Promise<number | null> => {
    try {
      const entry = await offlineService.getCachedData(key);
      if (!entry) return null;
      
      // This would need to be implemented in the service to return metadata
      return Date.now() - new Date().getTime(); // Placeholder
    } catch (error) {
      console.error('Failed to get data age:', error);
      return null;
    }
  }, []);

  const getStorageUsage = useCallback(async (): Promise<number> => {
    try {
      return await offlineService.getStorageUsage();
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return 0;
    }
  }, []);

  // Event listener management
  const addEventListener = useCallback(<K extends keyof OfflineEvents>(
    event: K,
    handler: (data: OfflineEvents[K]) => void
  ): void => {
    offlineService.on(event, handler);
  }, []);

  const removeEventListener = useCallback(<K extends keyof OfflineEvents>(
    event: K,
    handler: (data: OfflineEvents[K]) => void
  ): void => {
    offlineService.off(event, handler);
  }, []);

  return {
    // State
    isOnline,
    isOffline: !isOnline,
    networkStatus,
    syncStatus,
    operationQueue,
    conflicts,
    
    // Actions
    queueOperation,
    syncNow,
    clearQueue,
    resolveConflict,
    
    // Cache Management
    getCachedData,
    setCachedData,
    clearCache,
    
    // Utilities
    isFeatureAvailable,
    getDataAge,
    getStorageUsage,
    
    // Event Handlers
    addEventListener,
    removeEventListener
  };
}

export default useOffline; 