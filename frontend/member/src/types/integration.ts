// Integration Types for Frontend-Backend Smart Contract Integration
// Task 5.1.1 Sub-task 1: Smart Contract Integration Layer

import { PublicKey, Transaction, TransactionSignature } from "@solana/web3.js";

// Smart Contract Integration Types
export interface SmartContractConfig {
  programId: PublicKey;
  network: "localnet" | "devnet" | "testnet" | "mainnet";
  endpoint: string;
  commitment: "processed" | "confirmed" | "finalized";
}

export interface TransactionInstruction {
  programId: PublicKey;
  keys: Array<{
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: Buffer;
}

export interface TransactionRequest {
  id: string;
  instructions: TransactionInstruction[];
  feePayer?: PublicKey;
  recentBlockhash?: string;
  priority: "low" | "medium" | "high";
  metadata?: Record<string, any>;
}

export interface TransactionResponse {
  signature: TransactionSignature;
  status: TransactionStatus;
  confirmations: number;
  slot: number;
  blockTime?: number;
  error?: string;
}

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing", 
  CONFIRMED = "confirmed",
  FINALIZED = "finalized",
  FAILED = "failed",
  TIMEOUT = "timeout"
}

// API Integration Types
export interface ApiRequestConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Transaction Management Types
export interface TransactionQueue {
  id: string;
  transactions: QueuedTransaction[];
  priority: "low" | "medium" | "high";
  maxRetries: number;
  status: QueueStatus;
}

export interface QueuedTransaction {
  id: string;
  transaction: TransactionRequest;
  status: TransactionStatus;
  attempts: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

export enum QueueStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  PAUSED = "paused",
  ERROR = "error"
}

// Data Synchronization Types
export interface SyncState<T = any> {
  data: T;
  lastSync: number;
  version: number;
  isStale: boolean;
  isSyncing: boolean;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  evictionPolicy: "lru" | "fifo" | "ttl";
}

export interface OptimisticUpdate<T = any> {
  id: string;
  originalData: T;
  optimisticData: T;
  rollbackFn: () => void;
  commitFn: () => Promise<void>;
  timestamp: number;
}

// Community Management Integration Types
export interface CommunityContract {
  address: PublicKey;
  owner: PublicKey;
  name: string;
  members: PublicKey[];
  votingPower: Map<string, number>;
  treasury: PublicKey;
}

export interface VotingContract {
  address: PublicKey;
  community: PublicKey;
  proposal: string;
  options: string[];
  votes: Map<string, number>;
  endTime: number;
  status: "active" | "ended" | "cancelled";
}

// Wallet Integration Types
export interface WalletTransaction {
  wallet: PublicKey;
  transaction: Transaction;
  signature?: TransactionSignature;
  status: TransactionStatus;
  timestamp: number;
}

export interface WalletIntegrationConfig {
  supportedWallets: string[];
  autoConnect: boolean;
  network: string;
  onConnect?: (wallet: any) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// Error Handling Types
export interface IntegrationError {
  type: "blockchain" | "api" | "network" | "validation" | "timeout";
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  retryAfter?: number;
}

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

// Performance and Monitoring Types
export interface PerformanceMetrics {
  transactionLatency: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  metricsInterval: number;
  alertThresholds: {
    errorRate: number;
    latency: number;
    throughput: number;
  };
}
