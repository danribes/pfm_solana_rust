// Integration Tests for Frontend-Backend Smart Contract Integration
// Task 5.1.1: Frontend-Backend Integration with Smart Contracts

import { renderHook, act } from "@testing-library/react";
import { useIntegration } from "../../hooks/useIntegration";
import { TransactionRequest, TransactionStatus } from "../../types/integration";

// Mock dependencies
jest.mock("../../hooks/useBlockchain");
jest.mock("../../hooks/useApi");
jest.mock("../../utils/transactions");
jest.mock("../../services/dataSync");

const mockUseBlockchain = require("../../hooks/useBlockchain").useBlockchain as jest.Mock;
const mockUseApi = require("../../hooks/useApi").useApi as jest.Mock;
const mockTransactionManager = require("../../utils/transactions").transactionManager;
const mockDataSyncService = require("../../services/dataSync").dataSyncService;

describe("Frontend-Backend Integration", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock blockchain hook
    mockUseBlockchain.mockReturnValue({
      isConnected: true,
      walletAddress: "mock_wallet_address",
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      error: null,
      clearError: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({
        transactionCount: 5,
        successfulTransactions: 4,
        averageLatency: 1200,
      }),
    });

    // Mock API hook
    mockUseApi.mockReturnValue({
      isLoading: false,
      error: null,
      getCommunities: jest.fn().mockResolvedValue({
        success: true,
        data: [
          { id: "community_1", name: "Test Community 1" },
          { id: "community_2", name: "Test Community 2" },
        ],
      }),
      createCommunity: jest.fn().mockResolvedValue({
        success: true,
        data: { id: "new_community", name: "New Community" },
      }),
      getVotingProposals: jest.fn().mockResolvedValue({
        success: true,
        data: [
          { id: "proposal_1", title: "Test Proposal 1" },
          { id: "proposal_2", title: "Test Proposal 2" },
        ],
      }),
      castVote: jest.fn().mockResolvedValue({
        success: true,
        data: { voteId: "vote_123" },
      }),
      cancelRequests: jest.fn(),
      clearError: jest.fn(),
      metrics: {
        requestCount: 10,
        successCount: 9,
        errorCount: 1,
        averageResponseTime: 850,
      },
    });

    // Mock transaction manager
    mockTransactionManager.addToQueue = jest.fn().mockReturnValue("tx_123");
    mockTransactionManager.getTransactionStatus = jest.fn().mockReturnValue(TransactionStatus.CONFIRMED);
    mockTransactionManager.subscribeToTransaction = jest.fn().mockReturnValue(jest.fn());
    mockTransactionManager.getMetrics = jest.fn().mockReturnValue({
      totalTransactions: 15,
      successfulTransactions: 12,
      failedTransactions: 3,
      queueLength: 2,
    });

    // Mock data sync service
    mockDataSyncService.getData = jest.fn().mockResolvedValue({ data: "cached_data" });
    mockDataSyncService.setData = jest.fn();
    mockDataSyncService.syncData = jest.fn().mockResolvedValue({ data: "synced_data" });
    mockDataSyncService.invalidate = jest.fn();
    mockDataSyncService.getStats = jest.fn().mockReturnValue({
      totalKeys: 25,
      staleKeys: 3,
      syncingKeys: 1,
      averageAge: 45000,
    });
  });

  describe("Integration Hook Initialization", () => {
    test("should initialize with default state", () => {
      const { result } = renderHook(() => useIntegration());

      expect(result.current.isConnected).toBe(true);
      expect(result.current.blockchainConnected).toBe(true);
      expect(result.current.walletAddress).toBe("mock_wallet_address");
      expect(result.current.pendingTransactions).toBe(0);
      expect(result.current.errors).toEqual([]);
    });

    test("should handle connection state changes", async () => {
      const { result } = renderHook(() => useIntegration({ autoConnect: false }));

      expect(result.current.isConnected).toBe(true);

      await act(async () => {
        await result.current.connect();
      });

      expect(mockUseBlockchain().connect).toHaveBeenCalled();
    });
  });

  describe("Transaction Management Integration", () => {
    test("should submit transaction successfully", async () => {
      const { result } = renderHook(() => useIntegration());

      const transactionRequest: TransactionRequest = {
        id: "test_tx_1",
        instructions: [
          {
            programId: "11111111111111111111111111111112",
            keys: [
              { pubkey: "sender", isSigner: true, isWritable: true },
              { pubkey: "recipient", isSigner: false, isWritable: true },
            ],
            data: "test_data",
          },
        ],
        signers: ["sender"],
        priority: "high",
        metadata: { type: "transfer", amount: 1000 },
      };

      let transactionId: string;
      await act(async () => {
        transactionId = await result.current.submitTransaction(transactionRequest);
      });

      expect(transactionId).toBe("tx_123");
      expect(mockTransactionManager.addToQueue).toHaveBeenCalledWith(
        "default",
        transactionRequest,
        "high"
      );
    });

    test("should track transaction status", async () => {
      const { result } = renderHook(() => useIntegration());

      const status = result.current.getTransactionStatus("tx_123");
      expect(status).toBe(TransactionStatus.CONFIRMED);
      expect(mockTransactionManager.getTransactionStatus).toHaveBeenCalledWith("tx_123");
    });

    test("should subscribe to transaction updates", async () => {
      const { result } = renderHook(() => useIntegration());
      const callback = jest.fn();

      let unsubscribe: () => void;
      await act(async () => {
        unsubscribe = result.current.subscribeToTransaction("tx_123", callback);
      });

      expect(mockTransactionManager.subscribeToTransaction).toHaveBeenCalledWith(
        "tx_123",
        callback
      );
      expect(unsubscribe).toBeDefined();
    });
  });

  describe("Data Synchronization Integration", () => {
    test("should get cached data", async () => {
      const { result } = renderHook(() => useIntegration());
      const fetchFn = jest.fn().mockResolvedValue({ fresh: "data" });

      let data: any;
      await act(async () => {
        data = await result.current.getData("test_key", fetchFn);
      });

      expect(data).toEqual({ data: "cached_data" });
      expect(mockDataSyncService.getData).toHaveBeenCalledWith("test_key", fetchFn);
    });

    test("should sync data from remote", async () => {
      const { result } = renderHook(() => useIntegration());
      const fetchFn = jest.fn().mockResolvedValue({ fresh: "data" });

      let data: any;
      await act(async () => {
        data = await result.current.syncData("test_key", fetchFn);
      });

      expect(data).toEqual({ data: "synced_data" });
      expect(mockDataSyncService.syncData).toHaveBeenCalledWith("test_key", fetchFn);
    });

    test("should handle sync errors", async () => {
      const { result } = renderHook(() => useIntegration());
      const fetchFn = jest.fn().mockRejectedValue(new Error("Sync failed"));
      
      mockDataSyncService.syncData.mockRejectedValue(new Error("Sync failed"));

      await act(async () => {
        try {
          await result.current.syncData("test_key", fetchFn);
        } catch (error) {
          expect(error.message).toBe("Sync failed");
        }
      });

      expect(result.current.syncStatus).toBe("error");
    });
  });

  describe("Community Management Integration", () => {
    test("should get communities with caching", async () => {
      const { result } = renderHook(() => useIntegration());

      let communities: any;
      await act(async () => {
        communities = await result.current.getCommunities();
      });

      expect(communities).toEqual({ data: "cached_data" });
      expect(mockDataSyncService.getData).toHaveBeenCalledWith(
        "communities",
        expect.any(Function)
      );
    });

    test("should create community with optimistic updates", async () => {
      const { result } = renderHook(() => useIntegration());
      const communityData = { name: "New Test Community", description: "Test description" };

      let response: any;
      await act(async () => {
        response = await result.current.createCommunity(communityData);
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toBe("new_community");
      expect(mockDataSyncService.invalidate).toHaveBeenCalledWith("communities");
    });

    test("should update community and invalidate cache", async () => {
      const { result } = renderHook(() => useIntegration());
      const updateData = { name: "Updated Community Name" };

      const mockPut = jest.fn().mockResolvedValue({ success: true });
      mockUseApi().put = mockPut;

      let response: any;
      await act(async () => {
        response = await result.current.updateCommunity("community_1", updateData);
      });

      expect(mockPut).toHaveBeenCalledWith("/api/communities/community_1", updateData);
      expect(mockDataSyncService.invalidate).toHaveBeenCalledWith("communities");
      expect(mockDataSyncService.invalidate).toHaveBeenCalledWith("community_community_1");
    });
  });

  describe("Voting Integration", () => {
    test("should get voting proposals with caching", async () => {
      const { result } = renderHook(() => useIntegration());

      let proposals: any;
      await act(async () => {
        proposals = await result.current.getProposals("community_1");
      });

      expect(proposals).toEqual({ data: "cached_data" });
      expect(mockDataSyncService.getData).toHaveBeenCalledWith(
        "proposals_community_1",
        expect.any(Function)
      );
    });

    test("should cast vote with blockchain transaction", async () => {
      const { result } = renderHook(() => useIntegration());
      const voteData = { choice: "yes", amount: 100 };

      let response: any;
      await act(async () => {
        response = await result.current.castVote("proposal_1", voteData);
      });

      expect(response.transactionId).toBe("tx_123");
      expect(response.apiResponse.success).toBe(true);
      expect(mockTransactionManager.addToQueue).toHaveBeenCalled();
    });
  });

  describe("Metrics and Monitoring", () => {
    test("should aggregate metrics from all services", () => {
      const { result } = renderHook(() => useIntegration());

      const metrics = result.current.getMetrics();

      expect(metrics.blockchain).toBeDefined();
      expect(metrics.api).toBeDefined();
      expect(metrics.transactions).toBeDefined();
      expect(metrics.dataSync).toBeDefined();
      expect(metrics.integration).toBeDefined();
      
      expect(metrics.integration.pendingTransactions).toBe(0);
      expect(metrics.integration.errorCount).toBe(0);
    });

    test("should clear errors from all services", async () => {
      const { result } = renderHook(() => useIntegration());

      await act(async () => {
        result.current.clearErrors();
      });

      expect(mockUseBlockchain().clearError).toHaveBeenCalled();
      expect(mockUseApi().clearError).toHaveBeenCalled();
    });
  });

  describe("Error Handling and Recovery", () => {
    test("should handle blockchain connection errors", () => {
      mockUseBlockchain.mockReturnValue({
        ...mockUseBlockchain(),
        isConnected: false,
        error: {
          type: "blockchain",
          code: "CONNECTION_FAILED",
          message: "Failed to connect to blockchain",
          recoverable: true,
        },
      });

      const { result } = renderHook(() => useIntegration());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0].code).toBe("CONNECTION_FAILED");
    });

    test("should handle API errors", () => {
      mockUseApi.mockReturnValue({
        ...mockUseApi(),
        error: {
          type: "api",
          code: "API_ERROR",
          message: "API request failed",
          recoverable: true,
        },
      });

      const { result } = renderHook(() => useIntegration());

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0].code).toBe("API_ERROR");
    });

    test("should handle transaction submission errors", async () => {
      const { result } = renderHook(() => useIntegration());

      // Simulate disconnected state
      mockUseBlockchain.mockReturnValue({
        ...mockUseBlockchain(),
        isConnected: false,
      });

      const transactionRequest: TransactionRequest = {
        id: "error_tx",
        instructions: [],
        signers: [],
        priority: "low",
      };

      await act(async () => {
        try {
          await result.current.submitTransaction(transactionRequest);
        } catch (error) {
          expect(error.message).toContain("Not connected");
        }
      });
    });
  });

  describe("Cleanup and Resource Management", () => {
    test("should cleanup resources on unmount", () => {
      const { unmount } = renderHook(() => useIntegration());

      unmount();

      expect(mockUseApi().cancelRequests).toHaveBeenCalled();
    });

    test("should handle graceful disconnection", async () => {
      const { result } = renderHook(() => useIntegration());

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockUseBlockchain().disconnect).toHaveBeenCalled();
      expect(mockUseApi().cancelRequests).toHaveBeenCalled();
    });
  });
});
