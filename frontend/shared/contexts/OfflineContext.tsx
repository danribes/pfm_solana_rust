/**
 * Offline Context
 * 
 * React context for providing offline functionality across the application.
 * Manages global offline state and provides access to offline operations.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  OfflineState,
  NetworkStatus,
  SyncStatus,
  OfflineOperation,
  DataConflict,
  OfflineConfig,
  UseOfflineReturn
} from '../types/offline';

import { useOffline } from '../hooks/useOffline';

interface OfflineContextValue extends UseOfflineReturn {
  // Additional context-specific methods
  isInitialized: boolean;
  error: string | null;
}

interface OfflineProviderProps {
  children: ReactNode;
  config?: Partial<OfflineConfig>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children, config }: OfflineProviderProps) {
  const offlineHook = useOffline();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialization is handled in the useOffline hook
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsInitialized(false);
      }
    };

    initialize();
  }, []);

  const contextValue: OfflineContextValue = {
    ...offlineHook,
    isInitialized,
    error
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}

export { OfflineContext };
export default OfflineProvider; 