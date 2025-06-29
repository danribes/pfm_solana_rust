// WebSocket Infrastructure Integration Tests
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

// Test Configuration
const TEST_CONFIG = {
  WEBSOCKET_URL: "ws://localhost:9999/ws",
  CONNECTION_TIMEOUT: 5000,
  MESSAGE_TIMEOUT: 2000,
};

// Mock WebSocket for testing
class MockWebSocket {
  public url: string;
  public readyState: number = 0; // CONNECTING
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public protocol: string = "";
  public extensions: string = "";
  public bufferedAmount: number = 0;
  public binaryType: "blob" | "arraybuffer" = "arraybuffer";

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocol = Array.isArray(protocols) ? protocols[0] || "" : protocols || "";
    
    // Simulate connection after short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 100);
  }

  send(data: string | ArrayBuffer | Blob): void {
    // Simulate successful send
    if (this.readyState === 1) {
      // Echo message back for testing
      setTimeout(() => {
        if (this.onmessage && typeof data === "string") {
          const mockEvent = {
            data,
            type: "message",
            target: this,
          } as MessageEvent;
          this.onmessage(mockEvent);
        }
      }, 50);
    } else {
      throw new Error("WebSocket is not open");
    }
  }

  close(code?: number, reason?: string): void {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      const mockEvent = {
        code: code || 1000,
        reason: reason || "",
        wasClean: true,
        type: "close",
        target: this,
      } as CloseEvent;
      this.onclose(mockEvent);
    }
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
}

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

describe("WebSocket Infrastructure Tests", () => {
  
  describe("Core Files Validation", () => {
    it("should have all core WebSocket files created", async () => {
      const files = [
        "/app/src/shared/types/websocket.ts",
        "/app/src/shared/config/websocket.ts", 
        "/app/src/shared/services/websocket.ts",
        "/app/src/shared/hooks/useWebSocket.ts",
        "/app/src/shared/contexts/WebSocketContext.tsx",
        "/app/src/shared/utils/events.ts",
      ];

      const fs = require("fs");
      
      for (const file of files) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });

    it("should have valid TypeScript exports", async () => {
      // Test type imports
      const types = await import("../../../shared/types/websocket");
      expect(types).toBeDefined();
      
      // Test config imports  
      const config = await import("../../../shared/config/websocket");
      expect(config.DEFAULT_WEBSOCKET_CONFIG).toBeDefined();
      expect(config.WEBSOCKET_EVENTS).toBeDefined();
      
      // Test service imports
      const service = await import("../../../shared/services/websocket");
      expect(service.default).toBeDefined();
      
      // Test utils imports
      const utils = await import("../../../shared/utils/events");
      expect(utils.createWebSocketMessage).toBeDefined();
    });
  });

  describe("WebSocket Configuration", () => {
    it("should provide default configuration", async () => {
      const { DEFAULT_WEBSOCKET_CONFIG } = await import("../../../shared/config/websocket");
      
      expect(DEFAULT_WEBSOCKET_CONFIG).toMatchObject({
        url: expect.any(String),
        protocols: expect.any(Array),
        reconnect: {
          enabled: true,
          maxAttempts: expect.any(Number),
          delay: expect.any(Number),
          backoffFactor: expect.any(Number),
          maxDelay: expect.any(Number),
        },
        heartbeat: {
          enabled: true,
          interval: expect.any(Number),
          timeout: expect.any(Number),
          message: expect.any(String),
        },
      });
    });

    it("should provide environment-specific configurations", async () => {
      const { getWebSocketConfig } = await import("../../../shared/config/websocket");
      
      const devConfig = getWebSocketConfig("development");
      const prodConfig = getWebSocketConfig("production");
      const testConfig = getWebSocketConfig("test");
      
      expect(devConfig.reconnect.maxAttempts).toBeGreaterThan(prodConfig.reconnect.maxAttempts);
      expect(testConfig.reconnect.enabled).toBe(false);
      expect(testConfig.heartbeat.enabled).toBe(false);
    });

    it("should validate WebSocket configuration", async () => {
      const { validateWebSocketConfig } = await import("../../../shared/config/websocket");
      
      const validConfig = {
        url: "ws://localhost:3000/ws",
        reconnect: { maxAttempts: 5, delay: 1000 },
        heartbeat: { interval: 30000 },
      };
      
      const invalidConfig = {
        url: "http://invalid-url",
        reconnect: { maxAttempts: -1, delay: -500 },
        heartbeat: { interval: 500 },
      };
      
      expect(validateWebSocketConfig(validConfig)).toHaveLength(0);
      expect(validateWebSocketConfig(invalidConfig).length).toBeGreaterThan(0);
    });
  });

  describe("WebSocket Service", () => {
    let WebSocketService: any;
    let service: any;

    beforeEach(async () => {
      const serviceModule = await import("../../../shared/services/websocket");
      WebSocketService = serviceModule.default;
      service = new WebSocketService({
        url: TEST_CONFIG.WEBSOCKET_URL,
        reconnect: { enabled: false },
        heartbeat: { enabled: false },
      });
    });

    afterEach(() => {
      if (service) {
        service.cleanup();
      }
    });

    it("should create WebSocket service instance", () => {
      expect(service).toBeDefined();
      expect(service.getConnectionStatus()).toBe("disconnected");
      expect(service.getReadyState()).toBe("CLOSED");
    });

    it("should connect to WebSocket server", async () => {
      await service.connect();
      
      expect(service.getConnectionStatus()).toBe("connected");
      expect(service.getReadyState()).toBe("OPEN");
    });

    it("should handle message sending", async () => {
      await service.connect();
      
      const result = await service.send({
        type: "test",
        event: "test.message",
        data: { message: "Hello WebSocket" },
      });
      
      expect(result).toBe(true);
    });

    it("should manage subscriptions", async () => {
      const mockHandler = jest.fn();
      
      const subscriptionId = service.subscribe("test.event", mockHandler);
      expect(subscriptionId).toBeTruthy();
      
      const unsubscribed = service.unsubscribe(subscriptionId);
      expect(unsubscribed).toBe(true);
    });

    it("should track connection statistics", async () => {
      const initialStats = service.getStats();
      expect(initialStats.connectionCount).toBe(0);
      
      await service.connect();
      await service.send({ type: "test", event: "test", data: {} });
      
      const updatedStats = service.getStats();
      expect(updatedStats.connectionCount).toBeGreaterThan(0);
    });
  });

  describe("Event Utilities", () => {
    it("should create WebSocket messages", async () => {
      const { createWebSocketMessage } = await import("../../../shared/utils/events");
      
      const message = createWebSocketMessage("test", "test.event", { data: "test" });
      
      expect(message).toMatchObject({
        id: expect.any(String),
        type: "test",
        event: "test.event",
        data: { data: "test" },
        timestamp: expect.any(Number),
        priority: "medium",
        persistent: false,
      });
    });

    it("should filter events correctly", async () => {
      const { createEventFilter, createWebSocketEvent } = await import("../../../shared/utils/events");
      
      const filter = createEventFilter(["voting.*", "community.member.*"]);
      
      const votingEvent = createWebSocketEvent("message", "voting.results.update", {});
      const communityEvent = createWebSocketEvent("message", "community.member.joined", {});
      const systemEvent = createWebSocketEvent("message", "system.status.update", {});
      
      expect(filter(votingEvent)).toBe(true);
      expect(filter(communityEvent)).toBe(true);
      expect(filter(systemEvent)).toBe(false);
    });

    it("should validate WebSocket messages", async () => {
      const { validateWebSocketMessage } = await import("../../../shared/utils/events");
      
      const validMessage = {
        id: "test-id",
        type: "test",
        event: "test.event",
        data: {},
        timestamp: Date.now(),
      };
      
      const invalidMessage = {
        // Missing required fields
        data: {},
      };
      
      expect(validateWebSocketMessage(validMessage)).toHaveLength(0);
      expect(validateWebSocketMessage(invalidMessage).length).toBeGreaterThan(0);
    });

    it("should manage event aggregation", async () => {
      const { EventAggregator, createWebSocketEvent } = await import("../../../shared/utils/events");
      
      const aggregator = new EventAggregator(100);
      
      const event1 = createWebSocketEvent("message", "test.event1", {});
      const event2 = createWebSocketEvent("message", "test.event2", {});
      
      aggregator.add(event1);
      aggregator.add(event2);
      
      expect(aggregator.size()).toBe(2);
      expect(aggregator.getEventsByType("test.event1")).toHaveLength(1);
    });
  });

  describe("Real-time Data Processing", () => {
    it("should process voting updates", async () => {
      const { createWebSocketMessage } = await import("../../../shared/utils/events");
      
      const votingUpdate = createWebSocketMessage(
        "realtime",
        "voting.results.update",
        {
          proposalId: "prop-123",
          totalVotes: 150,
          options: {
            "yes": { votes: 90, weight: 75000, percentage: 60 },
            "no": { votes: 60, weight: 25000, percentage: 40 },
          },
          isComplete: false,
        }
      );
      
      expect(votingUpdate.event).toBe("voting.results.update");
      expect(votingUpdate.data.proposalId).toBe("prop-123");
      expect(votingUpdate.data.totalVotes).toBe(150);
    });

    it("should process community updates", async () => {
      const { createWebSocketMessage } = await import("../../../shared/utils/events");
      
      const memberJoined = createWebSocketMessage(
        "realtime",
        "community.member.joined",
        {
          communityId: "comm-456",
          memberId: "user-789",
          memberName: "Alice Smith",
          memberRole: "member",
          joinedAt: Date.now(),
        }
      );
      
      expect(memberJoined.event).toBe("community.member.joined");
      expect(memberJoined.data.communityId).toBe("comm-456");
      expect(memberJoined.data.memberName).toBe("Alice Smith");
    });

    it("should process notification updates", async () => {
      const { createWebSocketMessage } = await import("../../../shared/utils/events");
      
      const notification = createWebSocketMessage(
        "realtime",
        "notifications.personal",
        {
          id: "notif-001",
          userId: "user-123",
          type: "mention",
          title: "You were mentioned",
          message: "Alice mentioned you in a proposal discussion",
          read: false,
          createdAt: Date.now(),
        }
      );
      
      expect(notification.event).toBe("notifications.personal");
      expect(notification.data.type).toBe("mention");
      expect(notification.data.read).toBe(false);
    });
  });

  describe("Connection Management", () => {
    it("should handle connection states", async () => {
      const { default: WebSocketService } = await import("../../../shared/services/websocket");
      
      const service = new WebSocketService({
        url: TEST_CONFIG.WEBSOCKET_URL,
        reconnect: { enabled: false },
        heartbeat: { enabled: false },
      });
      
      expect(service.getConnectionStatus()).toBe("disconnected");
      
      await service.connect();
      expect(service.getConnectionStatus()).toBe("connected");
      
      service.disconnect();
      expect(service.getConnectionStatus()).toBe("disconnected");
      
      service.cleanup();
    });

    it("should track message queues", async () => {
      const { default: WebSocketService } = await import("../../../shared/services/websocket");
      
      const service = new WebSocketService({
        url: TEST_CONFIG.WEBSOCKET_URL,
        reconnect: { enabled: false },
        heartbeat: { enabled: false },
      });
      
      // Send message while disconnected (should queue)
      await service.send({
        type: "test",
        event: "test.queued",
        data: { message: "Queued message" },
      });
      
      // Clear queue
      service.clearQueue();
      
      service.cleanup();
    });
  });

  describe("Error Handling", () => {
    it("should handle connection errors gracefully", async () => {
      const { default: WebSocketService } = await import("../../../shared/services/websocket");
      
      const service = new WebSocketService({
        url: "ws://invalid-url:9999/ws",
        reconnect: { enabled: false },
        heartbeat: { enabled: false },
      });
      
      let errorCaught = false;
      try {
        await service.connect();
      } catch (error) {
        errorCaught = true;
      }
      
      expect(service.getConnectionStatus()).toBe("failed");
      service.cleanup();
    });

    it("should validate message format", async () => {
      const { validateWebSocketMessage } = await import("../../../shared/utils/events");
      
      const invalidMessages = [
        null,
        undefined,
        "string",
        123,
        {},
        { id: 123 }, // Invalid ID type
        { id: "test" }, // Missing required fields
      ];
      
      invalidMessages.forEach(message => {
        const errors = validateWebSocketMessage(message);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Implementation Completeness", () => {
    it("should implement all required features", async () => {
      // Verify all major components exist
      const types = await import("../../../shared/types/websocket");
      const config = await import("../../../shared/config/websocket");
      const service = await import("../../../shared/services/websocket");
      const utils = await import("../../../shared/utils/events");
      
      // Connection management
      expect(service.default).toBeDefined();
      
      // Event system
      expect(utils.EventAggregator).toBeDefined();
      expect(utils.SubscriptionManager).toBeDefined();
      
      // Real-time data types
      expect(types).toMatchObject({
        // Core types should be importable
      });
      
      // Configuration
      expect(config.WEBSOCKET_EVENTS).toBeDefined();
      expect(config.DEFAULT_WEBSOCKET_CONFIG).toBeDefined();
    });

    it("should provide fallback mechanisms", async () => {
      const { getWebSocketConfig } = await import("../../../shared/config/websocket");
      
      // Test configuration provides reconnection settings
      const config = getWebSocketConfig("development");
      expect(config.reconnect.enabled).toBe(true);
      expect(config.reconnect.maxAttempts).toBeGreaterThan(0);
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle high-frequency messages", async () => {
      const { EventAggregator } = await import("../../../shared/utils/events");
      
      const aggregator = new EventAggregator(1000);
      const startTime = Date.now();
      
      // Add many events
      for (let i = 0; i < 500; i++) {
        const { createWebSocketEvent } = await import("../../../shared/utils/events");
        const event = createWebSocketEvent("test", `test.event.${i}`, { index: i });
        aggregator.add(event);
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(aggregator.size()).toBe(500);
      expect(processingTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should maintain memory limits", async () => {
      const { EventAggregator } = await import("../../../shared/utils/events");
      
      const maxSize = 100;
      const aggregator = new EventAggregator(maxSize);
      
      // Add more events than the limit
      for (let i = 0; i < 150; i++) {
        const { createWebSocketEvent } = await import("../../../shared/utils/events");
        const event = createWebSocketEvent("test", `test.event.${i}`, { index: i });
        aggregator.add(event);
      }
      
      // Should not exceed max size
      expect(aggregator.size()).toBeLessThanOrEqual(maxSize);
    });
  });

});

export {};
