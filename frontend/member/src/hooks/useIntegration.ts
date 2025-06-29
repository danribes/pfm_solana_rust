// Comprehensive Integration Hook
// Task 5.1.1: Frontend-Backend Integration with Smart Contracts

import { useState, useEffect, useCallback, useRef } from "react";
import { useBlockchain } from "./useBlockchain";
import { useApi } from "./useApi";
import { transactionManager, TransactionUtils } from "../utils/transactions";
import { dataSyncService } from "../services/dataSync";
import {
  TransactionRequest,
  TransactionStatus,
  IntegrationError,
  SyncState,
} from "../types/integration";

interface IntegrationState {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  
  // Blockchain state
  blockchainConnected: boolean;
  walletAddress: string | null;
  
  // API state
  apiConnected: boolean;
  
  // Transaction state
  pendingTransactions: number;
  
  // Sync state
  syncStatus: "idle" | "syncing" | "error";
  lastSync: number | null;
  
  // Errors
  errors: IntegrationError[];
}

interface IntegrationOptions {
  autoConnect?: boolean;
  enableDataSync?: boolean;
  syncInterval?: number;
  enableMetrics?: boolean;
}

interface IntegrationReturn extends IntegrationState {
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Transaction methods
  submitTransaction: (request: TransactionRequest) => Promise<string>;
  getTransactionStatus: (txId: string) => TransactionStatus | null;
  subscribeToTransaction: (txId: string, callback: (status: TransactionStatus) => void) => () => void;
  
  // Data methods
  getData: <T>(key: string, fetchFn: () => Promise<T>) => Promise<T>;
  setData: <T>(key: string, data: T) => void;
  syncData: <T>(key: string, fetchFn: () => Promise<T>) => Promise<T>;
  
  // Community management methods
  getCommunities: () => Promise<any>;
  createCommunity: (data: any) => Promise<any>;
  updateCommunity: (id: string, data: any) => Promise<any>;
  deleteCommunity: (id: string) => Promise<any>;
  
  // Voting methods
  getProposals: (communityId: string) => Promise<any>;
  createProposal: (communityId: string, data: any) => Promise<any>;
  castVote: (proposalId: string, vote: any) => Promise<any>;
  
  // Metrics and monitoring
  getMetrics: () => any;
  clearErrors: () => void;
}

export const useIntegration = (options: IntegrationOptions = {}): IntegrationReturn => {
  const {
    autoConnect = true,
    enableDataSync = true,
    syncInterval = 30000,
    enableMetrics = true,
  } = options;

  // State management
  const [state, setState] = useState<IntegrationState>({
    isConnected: false,
    isConnecting: false,
    blockchainConnected: false,
    walletAddress: null,
    apiConnected: false,
    pendingTransactions: 0,
    syncStatus: "idle",
    lastSync: null,
    errors: [],
  });

  // Hooks
  const blockchain = useBlockchain();
  const api = useApi({ enableMetrics });

  // Refs for cleanup
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<() => void>>(new Set());

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [autoConnect]);

  // Monitor blockchain connection
  useEffect(() => {
    setState(prev => ({
      ...prev,
      blockchainConnected: blockchain.isConnected,
      walletAddress: blockchain.walletAddress,
      isConnected: blockchain.isConnected && prev.apiConnected,
    }));
  }, [blockchain.isConnected, blockchain.walletAddress]);

  // Monitor API connection
  useEffect(() => {
    const apiConnected = !api.isLoading && !api.error;
    setState(prev => ({
      ...prev,
      apiConnected,
      isConnected: prev.blockchainConnected && apiConnected,
    }));
  }, [api.isLoading, api.error]);

  // Monitor errors
  useEffect(() => {
    const errors: IntegrationError[] = [];
    
    if (blockchain.error) {
      errors.push(blockchain.error);
    }
    
    if (api.error) {
      errors.push(api.error);
    }

    setState(prev => ({ ...prev, errors }));
  }, [blockchain.error, api.error]);

  // Setup data sync
  useEffect(() => {
    if (enableDataSync && state.isConnected) {
      startDataSync();
    } else {
      stopDataSync();
    }

    return stopDataSync;
  }, [enableDataSync, state.isConnected, syncInterval]);

  // Connection methods
  const connect = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Connect to blockchain
      await blockchain.connect();
      
      // API connection is automatic via useApi hook
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        errors: [...prev.errors, {
          type: "integration",
          code: "CONNECTION_FAILED",
          message: "Failed to establish connection",
          recoverable: true,
        } as IntegrationError],
      }));
      throw error;
    }
  }, [blockchain]);

  const disconnect = useCallback(async (): Promise<void> => {
    await blockchain.disconnect();
    api.cancelRequests();
    cleanup();
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      blockchainConnected: false,
      apiConnected: false,
      walletAddress: null,
    }));
  }, [blockchain, api]);

  // Transaction methods
  const submitTransaction = useCallback(async (request: TransactionRequest): Promise<string> => {
    if (!state.isConnected) {
      throw new Error("Not connected to blockchain or API");
    }

    // Validate transaction
    if (!TransactionUtils.validateTransactionRequest(request)) {
      throw new Error("Invalid transaction request");
    }

    // Add to transaction queue
    const transactionId = transactionManager.addToQueue(
      "default",
      request,
      TransactionUtils.calculatePriority(request)
    );

    // Update pending count
    setState(prev => ({
      ...prev,
      pendingTransactions: prev.pendingTransactions + 1,
    }));

    // Subscribe to transaction updates
    const unsubscribe = transactionManager.subscribeToTransaction(
      transactionId,
      (status) => {
        if (status === TransactionStatus.CONFIRMED || status === TransactionStatus.FAILED) {
          setState(prev => ({
            ...prev,
            pendingTransactions: Math.max(0, prev.pendingTransactions - 1),
          }));
        }
      }
    );

    subscriptionsRef.current.add(unsubscribe);

    return transactionId;
  }, [state.isConnected]);

  const getTransactionStatus = useCallback((txId: string): TransactionStatus | null => {
    return transactionManager.getTransactionStatus(txId);
  }, []);

  const subscribeToTransaction = useCallback((
    txId: string,
    callback: (status: TransactionStatus) => void
  ): (() => void) => {
    const unsubscribe = transactionManager.subscribeToTransaction(txId, callback);
    subscriptionsRef.current.add(unsubscribe);
    return unsubscribe;
  }, []);

  // Data methods
  const getData = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    return dataSyncService.getData(key, fetchFn);
  }, []);

  const setData = useCallback(<T>(key: string, data: T): void => {
    dataSyncService.setData(key, data);
  }, []);

  const syncData = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    setState(prev => ({ ...prev, syncStatus: "syncing" }));
    
    try {
      const data = await dataSyncService.syncData(key, fetchFn);
      setState(prev => ({ 
        ...prev, 
        syncStatus: "idle",
        lastSync: Date.now(),
      }));
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, syncStatus: "error" }));
      throw error;
    }
  }, []);

  // Community management methods
  const getCommunities = useCallback(async (): Promise<any> => {
    return getData("communities", () => api.getCommunities());
  }, [getData, api]);

  const createCommunity = useCallback(async (data: any): Promise<any> => {
    const response = await api.createCommunity(data);
    
    if (response.success) {
      // Invalidate communities cache
      dataSyncService.invalidate("communities");
      
      // Create optimistic update for UI
      const optimisticId = `temp_${Date.now()}`;
      transactionManager.createOptimisticUpdate(
        optimisticId,
        null,
        { ...data, id: response.data.id },
        () => dataSyncService.invalidate("communities"),
        async () => {
          await syncData("communities", () => api.getCommunities());
        }
      );
    }
    
    return response;
  }, [api, syncData]);

  const updateCommunity = useCallback(async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/api/communities/${id}`, data);
    
    if (response.success) {
      dataSyncService.invalidate("communities");
      dataSyncService.invalidate(`community_${id}`);
    }
    
    return response;
  }, [api]);

  const deleteCommunity = useCallback(async (id: string): Promise<any> => {
    const response = await api.delete(`/api/communities/${id}`);
    
    if (response.success) {
      dataSyncService.invalidate("communities");
      dataSyncService.removeKey(`community_${id}`);
    }
    
    return response;
  }, [api]);

  // Voting methods
  const getProposals = useCallback(async (communityId: string): Promise<any> => {
    return getData(`proposals_${communityId}`, () => api.getVotingProposals(communityId));
  }, [getData, api]);

  const createProposal = useCallback(async (communityId: string, data: any): Promise<any> => {
    const response = await api.createVotingProposal(communityId, data);
    
    if (response.success) {
      dataSyncService.invalidate(`proposals_${communityId}`);
    }
    
    return response;
  }, [api]);

  const castVote = useCallback(async (proposalId: string, vote: any): Promise<any> => {
    // Create transaction for on-chain voting
    const transactionRequest: TransactionRequest = {
      id: `vote_${proposalId}_${Date.now()}`,
      instructions: [], // Would be populated with actual vote instructions
      signers: [state.walletAddress!],
      priority: "high",
      metadata: {
        type: "vote",
        proposalId,
        vote,
      },
    };

    // Submit blockchain transaction
    const txId = await submitTransaction(transactionRequest);
    
    // Also update via API
    const response = await api.castVote(proposalId, vote);
    
    return { transactionId: txId, apiResponse: response };
  }, [api, submitTransaction, state.walletAddress]);

  // Metrics and monitoring
  const getMetrics = useCallback(() => {
    return {
      blockchain: blockchain.getMetrics(),
      api: api.metrics,
      transactions: transactionManager.getMetrics(),
      dataSync: dataSyncService.getStats(),
      integration: {
        connectedTime: state.isConnected ? Date.now() - (state.lastSync || 0) : 0,
        pendingTransactions: state.pendingTransactions,
        errorCount: state.errors.length,
      },
    };
  }, [blockchain, api, state]);

  const clearErrors = useCallback(() => {
    blockchain.clearError();
    api.clearError();
    setState(prev => ({ ...prev, errors: [] }));
  }, [blockchain, api]);

  // Data sync management
  const startDataSync = useCallback(() => {
    if (syncIntervalRef.current) return;

    syncIntervalRef.current = setInterval(async () => {
      try {
        // Sync critical data
        await Promise.all([
          syncData("communities", () => api.getCommunities()),
          // Add more sync operations as needed
        ]);
      } catch (error) {
        console.error("Data sync failed:", error);
      }
    }, syncInterval);
  }, [api, syncData, syncInterval]);

  const stopDataSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopDataSync();
    
    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
    
    // Cancel pending requests
    api.cancelRequests();
  }, [stopDataSync, api]);

  return {
    ...state,
    connect,
    disconnect,
    submitTransaction,
    getTransactionStatus,
    subscribeToTransaction,
    getData,
    setData,
    syncData,
    getCommunities,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    getProposals,
    createProposal,
    castVote,
    getMetrics,
    clearErrors,
  };
};

export default useIntegration;
