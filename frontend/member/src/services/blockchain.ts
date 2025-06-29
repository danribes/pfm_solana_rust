// Blockchain Integration Service
// Task 5.1.1 Sub-task 1: Smart Contract Integration Layer

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  ConfirmOptions,
  Commitment,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  SmartContractConfig,
  TransactionRequest,
  TransactionResponse,
  TransactionStatus,
  IntegrationError,
  PerformanceMetrics,
  CommunityContract,
  VotingContract,
} from "../types/integration";

export class BlockchainService {
  private connection: Connection;
  private config: SmartContractConfig;
  private metrics: PerformanceMetrics;
  private isConnected: boolean = false;

  constructor(config: SmartContractConfig) {
    this.config = config;
    this.connection = new Connection(config.endpoint, {
      commitment: config.commitment,
      confirmTransactionInitialTimeout: 60000,
    });
    
    this.metrics = {
      transactionLatency: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
    };

    this.initializeConnection();
  }

  /**
   * Initialize blockchain connection
   */
  private async initializeConnection(): Promise<void> {
    try {
      const version = await this.connection.getVersion();
      console.log("Connected to Solana cluster:", version);
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to connect to Solana cluster:", error);
      this.isConnected = false;
      throw new IntegrationError({
        type: "blockchain",
        code: "CONNECTION_FAILED",
        message: "Failed to connect to Solana cluster",
        details: { error: error.message },
        recoverable: true,
        retryAfter: 5000,
      });
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get network information
   */
  public async getNetworkInfo(): Promise<{
    network: string;
    version: any;
    slot: number;
    blockHeight: number;
  }> {
    try {
      const [version, slot, blockHeight] = await Promise.all([
        this.connection.getVersion(),
        this.connection.getSlot(),
        this.connection.getBlockHeight(),
      ]);

      return {
        network: this.config.network,
        version,
        slot,
        blockHeight,
      };
    } catch (error) {
      throw this.createIntegrationError("NETWORK_INFO_FAILED", error);
    }
  }

  /**
   * Build transaction from request
   */
  public async buildTransaction(request: TransactionRequest): Promise<Transaction> {
    try {
      const transaction = new Transaction();

      // Add instructions to transaction
      for (const instruction of request.instructions) {
        const txInstruction = new TransactionInstruction({
          programId: instruction.programId,
          keys: instruction.keys,
          data: instruction.data,
        });
        transaction.add(txInstruction);
      }

      // Set recent blockhash if not provided
      if (!request.recentBlockhash) {
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      } else {
        transaction.recentBlockhash = request.recentBlockhash;
      }

      // Set fee payer if provided
      if (request.feePayer) {
        transaction.feePayer = request.feePayer;
      }

      return transaction;
    } catch (error) {
      throw this.createIntegrationError("TRANSACTION_BUILD_FAILED", error);
    }
  }

  /**
   * Send and confirm transaction
   */
  public async sendTransaction(
    transaction: Transaction,
    signers: any[],
    options?: ConfirmOptions
  ): Promise<TransactionResponse> {
    const startTime = Date.now();
    
    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        signers,
        {
          commitment: this.config.commitment,
          preflightCommitment: this.config.commitment,
          ...options,
        }
      );

      const latency = Date.now() - startTime;
      this.updateMetrics({ transactionLatency: latency });

      // Get transaction status
      const signatureStatus = await this.connection.getSignatureStatus(signature);
      
      return {
        signature,
        status: this.mapSignatureStatus(signatureStatus.value),
        confirmations: signatureStatus.value?.confirmations || 0,
        slot: signatureStatus.context.slot,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateMetrics({ transactionLatency: latency, errorRate: 1 });
      
      throw this.createIntegrationError("TRANSACTION_SEND_FAILED", error);
    }
  }

  /**
   * Get transaction status
   */
  public async getTransactionStatus(signature: TransactionSignature): Promise<TransactionStatus> {
    try {
      const signatureStatus = await this.connection.getSignatureStatus(signature);
      return this.mapSignatureStatus(signatureStatus.value);
    } catch (error) {
      throw this.createIntegrationError("TRANSACTION_STATUS_FAILED", error);
    }
  }

  /**
   * Get account balance
   */
  public async getAccountBalance(pubkey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      throw this.createIntegrationError("ACCOUNT_BALANCE_FAILED", error);
    }
  }

  /**
   * Get community contract data
   */
  public async getCommunityContract(address: PublicKey): Promise<CommunityContract | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(address);
      
      if (!accountInfo) {
        return null;
      }

      // Parse community contract data (simplified for demo)
      return {
        address,
        owner: new PublicKey(accountInfo.data.slice(0, 32)),
        name: "Demo Community", // Would parse from contract data
        members: [], // Would parse from contract data
        votingPower: new Map(),
        treasury: new PublicKey(accountInfo.data.slice(32, 64)),
      };
    } catch (error) {
      throw this.createIntegrationError("COMMUNITY_CONTRACT_FAILED", error);
    }
  }

  /**
   * Get voting contract data
   */
  public async getVotingContract(address: PublicKey): Promise<VotingContract | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(address);
      
      if (!accountInfo) {
        return null;
      }

      // Parse voting contract data (simplified for demo)
      return {
        address,
        community: new PublicKey(accountInfo.data.slice(0, 32)),
        proposal: "Demo Proposal", // Would parse from contract data
        options: ["Yes", "No"], // Would parse from contract data
        votes: new Map(),
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        status: "active",
      };
    } catch (error) {
      throw this.createIntegrationError("VOTING_CONTRACT_FAILED", error);
    }
  }

  /**
   * Subscribe to account changes
   */
  public subscribeToAccount(
    pubkey: PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    try {
      return this.connection.onAccountChange(pubkey, callback, this.config.commitment);
    } catch (error) {
      throw this.createIntegrationError("ACCOUNT_SUBSCRIPTION_FAILED", error);
    }
  }

  /**
   * Unsubscribe from account changes
   */
  public async unsubscribeFromAccount(subscriptionId: number): Promise<void> {
    try {
      await this.connection.removeAccountChangeListener(subscriptionId);
    } catch (error) {
      throw this.createIntegrationError("ACCOUNT_UNSUBSCRIPTION_FAILED", error);
    }
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(update: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...update };
  }

  /**
   * Map signature status to transaction status
   */
  private mapSignatureStatus(status: any): TransactionStatus {
    if (!status) return TransactionStatus.PENDING;
    if (status.err) return TransactionStatus.FAILED;
    
    const confirmations = status.confirmations || 0;
    if (confirmations === 0) return TransactionStatus.PROCESSING;
    if (confirmations < 32) return TransactionStatus.CONFIRMED;
    return TransactionStatus.FINALIZED;
  }

  /**
   * Create standardized integration error
   */
  private createIntegrationError(code: string, error: any): IntegrationError {
    return {
      type: "blockchain",
      code,
      message: error.message || "Unknown blockchain error",
      details: { originalError: error },
      recoverable: this.isRecoverableError(error),
      retryAfter: 1000,
    } as IntegrationError;
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverableError(error: any): boolean {
    const recoverableErrors = [
      "Network request failed",
      "Timeout",
      "Rate limit exceeded",
      "Connection lost",
    ];
    
    return recoverableErrors.some(err => 
      error.message?.includes(err) || error.toString().includes(err)
    );
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    // Cleanup any active subscriptions or connections
    this.isConnected = false;
  }
}

export default BlockchainService;
