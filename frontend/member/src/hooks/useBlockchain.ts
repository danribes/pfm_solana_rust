// Blockchain Integration Hook
// Task 5.1.1 Sub-task 1: Smart Contract Integration Layer

import { useState, useEffect, useRef, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import BlockchainService from "../services/blockchain";
import {
  SmartContractConfig,
  TransactionRequest,
  TransactionResponse,
  TransactionStatus,
  IntegrationError,
  CommunityContract,
  VotingContract,
} from "../types/integration";

interface UseBlockchainState {
  isConnected: boolean;
  isLoading: boolean;
  error: IntegrationError | null;
  networkInfo: any;
  metrics: any;
}

interface UseBlockchainReturn extends UseBlockchainState {
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getConnectionStatus: () => boolean;
  
  // Transaction methods
  buildTransaction: (request: TransactionRequest) => Promise<Transaction>;
  sendTransaction: (transaction: Transaction, signers: any[]) => Promise<TransactionResponse>;
  getTransactionStatus: (signature: string) => Promise<TransactionStatus>;
  
  // Account methods
  getAccountBalance: (pubkey: PublicKey) => Promise<number>;
  subscribeToAccount: (pubkey: PublicKey, callback: (data: any) => void) => number | null;
  unsubscribeFromAccount: (subscriptionId: number) => Promise<void>;
  
  // Contract methods
  getCommunityContract: (address: PublicKey) => Promise<CommunityContract | null>;
  getVotingContract: (address: PublicKey) => Promise<VotingContract | null>;
  
  // Utility methods
  refreshNetworkInfo: () => Promise<void>;
  getMetrics: () => any;
  clearError: () => void;
}

const defaultConfig: SmartContractConfig = {
  programId: new PublicKey("11111111111111111111111111111111"), // Placeholder
  network: "devnet",
  endpoint: "https://api.devnet.solana.com",
  commitment: "confirmed",
};

export const useBlockchain = (config?: Partial<SmartContractConfig>): UseBlockchainReturn => {
  const [state, setState] = useState<UseBlockchainState>({
    isConnected: false,
    isLoading: false,
    error: null,
    networkInfo: null,
    metrics: null,
  });

  const serviceRef = useRef<BlockchainService | null>(null);
  const subscriptionsRef = useRef<Map<number, boolean>>(new Map());

  // Initialize blockchain service
  useEffect(() => {
    const finalConfig = { ...defaultConfig, ...config };
    serviceRef.current = new BlockchainService(finalConfig);
    
    // Auto-connect on initialization
    connect();

    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (serviceRef.current) {
      // Unsubscribe from all active subscriptions
      for (const [subscriptionId] of subscriptionsRef.current) {
        try {
          await serviceRef.current.unsubscribeFromAccount(subscriptionId);
        } catch (error) {
          console.warn("Failed to unsubscribe:", error);
        }
      }
      subscriptionsRef.current.clear();
      
      await serviceRef.current.cleanup();
      serviceRef.current = null;
    }
  }, []);

  // Connection methods
  const connect = useCallback(async () => {
    if (!serviceRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isConnected = serviceRef.current.getConnectionStatus();
      const networkInfo = await serviceRef.current.getNetworkInfo();
      const metrics = serviceRef.current.getMetrics();

      setState(prev => ({
        ...prev,
        isConnected,
        networkInfo,
        metrics,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error as IntegrationError,
        isLoading: false,
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    await cleanup();
    setState(prev => ({
      ...prev,
      isConnected: false,
      networkInfo: null,
      metrics: null,
    }));
  }, [cleanup]);

  const getConnectionStatus = useCallback(() => {
    return serviceRef.current?.getConnectionStatus() || false;
  }, []);

  // Transaction methods
  const buildTransaction = useCallback(async (request: TransactionRequest): Promise<Transaction> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const transaction = await serviceRef.current.buildTransaction(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return transaction;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as IntegrationError,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const sendTransaction = useCallback(async (
    transaction: Transaction,
    signers: any[]
  ): Promise<TransactionResponse> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await serviceRef.current.sendTransaction(transaction, signers);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        metrics: serviceRef.current?.getMetrics(),
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as IntegrationError,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const getTransactionStatus = useCallback(async (signature: string): Promise<TransactionStatus> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await serviceRef.current.getTransactionStatus(signature);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      throw error;
    }
  }, []);

  // Account methods
  const getAccountBalance = useCallback(async (pubkey: PublicKey): Promise<number> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await serviceRef.current.getAccountBalance(pubkey);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      throw error;
    }
  }, []);

  const subscribeToAccount = useCallback((
    pubkey: PublicKey,
    callback: (data: any) => void
  ): number | null => {
    if (!serviceRef.current) {
      console.error("Blockchain service not initialized");
      return null;
    }

    try {
      const subscriptionId = serviceRef.current.subscribeToAccount(pubkey, callback);
      subscriptionsRef.current.set(subscriptionId, true);
      return subscriptionId;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      return null;
    }
  }, []);

  const unsubscribeFromAccount = useCallback(async (subscriptionId: number): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      await serviceRef.current.unsubscribeFromAccount(subscriptionId);
      subscriptionsRef.current.delete(subscriptionId);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      throw error;
    }
  }, []);

  // Contract methods
  const getCommunityContract = useCallback(async (address: PublicKey): Promise<CommunityContract | null> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await serviceRef.current.getCommunityContract(address);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      throw error;
    }
  }, []);

  const getVotingContract = useCallback(async (address: PublicKey): Promise<VotingContract | null> => {
    if (!serviceRef.current) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await serviceRef.current.getVotingContract(address);
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
      throw error;
    }
  }, []);

  // Utility methods
  const refreshNetworkInfo = useCallback(async () => {
    if (!serviceRef.current) return;

    try {
      const networkInfo = await serviceRef.current.getNetworkInfo();
      const metrics = serviceRef.current.getMetrics();
      
      setState(prev => ({ ...prev, networkInfo, metrics }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as IntegrationError }));
    }
  }, []);

  const getMetrics = useCallback(() => {
    return serviceRef.current?.getMetrics() || null;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    getConnectionStatus,
    buildTransaction,
    sendTransaction,
    getTransactionStatus,
    getAccountBalance,
    subscribeToAccount,
    unsubscribeFromAccount,
    getCommunityContract,
    getVotingContract,
    refreshNetworkInfo,
    getMetrics,
    clearError,
  };
};

export default useBlockchain;
