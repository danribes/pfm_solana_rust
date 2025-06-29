// Blockchain Service Unit Tests
// Task 5.1.1: Frontend-Backend Integration Tests

import { BlockchainService } from "../../services/blockchain";
import { SmartContractConfig, TransactionRequest } from "../../types/integration";

// Mock Solana Web3.js
jest.mock("@solana/web3.js", () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getVersion: jest.fn().mockResolvedValue({ "solana-core": "1.14.0" }),
    getBalance: jest.fn().mockResolvedValue(1000000000),
    getAccountInfo: jest.fn().mockResolvedValue(null),
    sendTransaction: jest.fn().mockResolvedValue("mock_signature"),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    onAccountChange: jest.fn().mockReturnValue(1),
    removeAccountChangeListener: jest.fn(),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({
    toString: () => key,
    toBase58: () => key,
  })),
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    compileMessage: jest.fn(),
  })),
  TransactionInstruction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({
      keys: [],
      programId: "11111111111111111111111111111112",
      data: Buffer.from([]),
    }),
  },
}));

describe("BlockchainService", () => {
  let blockchainService: BlockchainService;
  let mockConfig: SmartContractConfig;

  beforeEach(() => {
    mockConfig = {
      network: "devnet",
      endpoint: "https://api.devnet.solana.com",
      commitment: "confirmed",
      websocketEndpoint: "wss://api.devnet.solana.com/",
    };

    blockchainService = new BlockchainService(mockConfig);
  });

  afterEach(() => {
    blockchainService.disconnect();
    jest.clearAllMocks();
  });

  describe("Connection Management", () => {
    test("should initialize with config", () => {
      expect(blockchainService).toBeDefined();
      expect(blockchainService.getConnectionStatus()).toBe(false);
    });

    test("should connect successfully", async () => {
      await blockchainService.connect();
      expect(blockchainService.getConnectionStatus()).toBe(true);
    });

    test("should disconnect successfully", async () => {
      await blockchainService.connect();
      expect(blockchainService.getConnectionStatus()).toBe(true);
      
      blockchainService.disconnect();
      expect(blockchainService.getConnectionStatus()).toBe(false);
    });

    test("should get network information", async () => {
      await blockchainService.connect();
      const networkInfo = await blockchainService.getNetworkInfo();
      
      expect(networkInfo).toEqual({
        network: "devnet",
        endpoint: "https://api.devnet.solana.com",
        version: { "solana-core": "1.14.0" },
      });
    });
  });

  describe("Transaction Management", () => {
    beforeEach(async () => {
      await blockchainService.connect();
    });

    test("should build transaction from request", async () => {
      const request: TransactionRequest = {
        id: "test_tx_1",
        instructions: [
          {
            programId: "11111111111111111111111111111112",
            keys: [
              { pubkey: "sender_key", isSigner: true, isWritable: true },
              { pubkey: "recipient_key", isSigner: false, isWritable: true },
            ],
            data: "test_data_buffer",
          },
        ],
        signers: ["sender_key"],
        priority: "medium",
      };

      const transaction = await blockchainService.buildTransaction(request);
      expect(transaction).toBeDefined();
    });

    test("should send transaction successfully", async () => {
      const request: TransactionRequest = {
        id: "test_tx_2",
        instructions: [
          {
            programId: "11111111111111111111111111111112",
            keys: [
              { pubkey: "sender_key", isSigner: true, isWritable: true },
              { pubkey: "recipient_key", isSigner: false, isWritable: true },
            ],
            data: "test_data_buffer",
          },
        ],
        signers: ["sender_key"],
        priority: "high",
      };

      const response = await blockchainService.sendTransaction(request);
      
      expect(response.success).toBe(true);
      expect(response.signature).toBe("mock_signature");
      expect(response.requestId).toBe("test_tx_2");
    });

    test("should handle transaction errors", async () => {
      // Mock connection to throw error
      const mockConnection = blockchainService["connection"];
      mockConnection.sendTransaction = jest.fn().mockRejectedValue(
        new Error("Transaction failed")
      );

      const request: TransactionRequest = {
        id: "test_tx_error",
        instructions: [],
        signers: [],
        priority: "low",
      };

      const response = await blockchainService.sendTransaction(request);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain("Transaction failed");
    });
  });

  describe("Account Management", () => {
    beforeEach(async () => {
      await blockchainService.connect();
    });

    test("should get account balance", async () => {
      const balance = await blockchainService.getAccountBalance("test_account");
      expect(balance).toBe(1000000000);
    });

    test("should subscribe to account changes", async () => {
      const callback = jest.fn();
      const subscriptionId = await blockchainService.subscribeToAccount(
        "test_account",
        callback
      );

      expect(subscriptionId).toBe(1);
      expect(callback).toHaveBeenCalledTimes(0); // Not called initially
    });

    test("should unsubscribe from account changes", async () => {
      const callback = jest.fn();
      const subscriptionId = await blockchainService.subscribeToAccount(
        "test_account",
        callback
      );

      blockchainService.unsubscribeFromAccount(subscriptionId);
      // Should not throw error
    });
  });

  describe("Smart Contract Integration", () => {
    beforeEach(async () => {
      await blockchainService.connect();
    });

    test("should get community contract data", async () => {
      const communityData = await blockchainService.getCommunityContract("community_1");
      
      expect(communityData).toEqual({
        id: "community_1",
        name: "Mock Community",
        memberCount: 100,
        treasuryBalance: 5000,
        isActive: true,
      });
    });

    test("should get voting contract data", async () => {
      const votingData = await blockchainService.getVotingContract("proposal_1");
      
      expect(votingData).toEqual({
        proposalId: "proposal_1",
        title: "Mock Proposal",
        description: "Mock proposal description",
        voteCount: { yes: 75, no: 25 },
        status: "active",
        endTime: expect.any(Number),
      });
    });
  });

  describe("Performance Metrics", () => {
    beforeEach(async () => {
      await blockchainService.connect();
    });

    test("should track metrics", async () => {
      const initialMetrics = blockchainService.getMetrics();
      expect(initialMetrics.transactionCount).toBe(0);

      // Send a transaction to update metrics
      const request: TransactionRequest = {
        id: "metrics_test",
        instructions: [],
        signers: [],
        priority: "medium",
      };

      await blockchainService.sendTransaction(request);
      
      const updatedMetrics = blockchainService.getMetrics();
      expect(updatedMetrics.transactionCount).toBe(1);
      expect(updatedMetrics.successfulTransactions).toBe(1);
    });

    test("should calculate average latency", async () => {
      const metrics = blockchainService.getMetrics();
      expect(metrics.averageLatency).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error Handling", () => {
    test("should handle connection errors gracefully", async () => {
      const badConfig: SmartContractConfig = {
        network: "devnet",
        endpoint: "https://invalid-endpoint.com",
        commitment: "confirmed",
      };

      const badService = new BlockchainService(badConfig);
      
      // Should not throw, but should handle error internally
      await expect(badService.connect()).rejects.toThrow();
    });

    test("should detect recoverable errors", () => {
      const networkError = new Error("Network request failed");
      const isRecoverable = blockchainService["isRecoverableError"](networkError);
      expect(isRecoverable).toBe(true);

      const nonRecoverableError = new Error("Invalid program");
      const isNotRecoverable = blockchainService["isRecoverableError"](nonRecoverableError);
      expect(isNotRecoverable).toBe(false);
    });
  });
});
