// WebSocket Configuration
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import { WebSocketConfig } from "../types/websocket";

export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws",
  protocols: ["pfm-protocol-v1"],
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    delay: 1000, // 1 second initial delay
    backoffFactor: 1.5,
    maxDelay: 30000, // 30 seconds max delay
  },
  heartbeat: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
    message: "ping",
  },
  authentication: {
    enabled: true,
    token: undefined,
    refreshToken: undefined,
  },
  compression: true,
  binaryType: "arraybuffer",
};

export const WEBSOCKET_EVENTS = {
  // Connection Events
  CONNECTION: {
    OPEN: "connection.open",
    CLOSE: "connection.close", 
    ERROR: "connection.error",
    RECONNECT: "connection.reconnect",
  },
  
  // Message Events
  MESSAGE: {
    RECEIVED: "message.received",
    SENT: "message.sent",
    ERROR: "message.error",
  },
  
  // Heartbeat Events
  HEARTBEAT: {
    PING: "heartbeat.ping",
    PONG: "heartbeat.pong",
    TIMEOUT: "heartbeat.timeout",
  },
  
  // Authentication Events
  AUTH: {
    SUCCESS: "auth.success",
    FAILURE: "auth.failure", 
    REQUIRED: "auth.required",
    REFRESH: "auth.refresh",
  },
  
  // Subscription Events
  SUBSCRIPTION: {
    ADDED: "subscription.added",
    REMOVED: "subscription.removed",
    ERROR: "subscription.error",
  },
  
  // Real-time Data Events
  VOTING: {
    RESULTS_UPDATE: "voting.results.update",
    NEW_VOTE: "voting.vote.new", 
    STATUS_CHANGE: "voting.status.change",
    PROPOSAL_CREATED: "voting.proposal.created",
    PROPOSAL_ENDED: "voting.proposal.ended",
  },
  
  COMMUNITY: {
    MEMBER_JOINED: "community.member.joined",
    MEMBER_LEFT: "community.member.left",
    ACTIVITY_UPDATE: "community.activity.update",
    TREASURY_UPDATE: "community.treasury.update",
    SETTINGS_CHANGED: "community.settings.changed",
  },
  
  NOTIFICATIONS: {
    PERSONAL: "notifications.personal",
    BROADCAST: "notifications.broadcast", 
    URGENT: "notifications.urgent",
    SYSTEM: "notifications.system",
  },
  
  SYSTEM: {
    STATUS_UPDATE: "system.status.update",
    ANNOUNCEMENT: "system.announcement",
    MAINTENANCE: "system.maintenance",
    ERROR: "system.error",
  },
} as const;

export const WEBSOCKET_CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MANDATORY_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015,
  
  // Custom codes (3000-3999)
  AUTHENTICATION_FAILED: 3001,
  AUTHORIZATION_FAILED: 3002,
  RATE_LIMITED: 3003,
  INVALID_MESSAGE_FORMAT: 3004,
  SUBSCRIPTION_LIMIT_EXCEEDED: 3005,
  HEARTBEAT_TIMEOUT: 3006,
} as const;

export const MESSAGE_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const CONNECTION_TIMEOUTS = {
  CONNECT: 10000, // 10 seconds
  DISCONNECT: 5000, // 5 seconds
  SEND: 5000, // 5 seconds
  HEARTBEAT: 5000, // 5 seconds
  AUTH: 10000, // 10 seconds
} as const;

export const QUEUE_LIMITS = {
  OUTGOING: 100,
  INCOMING: 200,
  FAILED: 50,
  PROCESSED: 1000,
} as const;

export const RETRY_STRATEGIES = {
  EXPONENTIAL_BACKOFF: "exponential_backoff",
  LINEAR_BACKOFF: "linear_backoff",
  FIXED_DELAY: "fixed_delay",
  IMMEDIATE: "immediate",
} as const;

// Environment-specific configurations
export const getWebSocketConfig = (environment: "development" | "production" | "test" = "development"): WebSocketConfig => {
  const baseConfig = { ...DEFAULT_WEBSOCKET_CONFIG };
  
  switch (environment) {
    case "development":
      return {
        ...baseConfig,
        url: "ws://localhost:3000/ws",
        reconnect: {
          ...baseConfig.reconnect,
          maxAttempts: 10, // More attempts in development
        },
        heartbeat: {
          ...baseConfig.heartbeat,
          interval: 15000, // More frequent heartbeats
        },
      };
      
    case "production":
      return {
        ...baseConfig,
        url: process.env.NEXT_PUBLIC_WS_URL || "wss://api.pfm.app/ws",
        reconnect: {
          ...baseConfig.reconnect,
          maxAttempts: 3, // Fewer attempts in production
          delay: 2000,
        },
        heartbeat: {
          ...baseConfig.heartbeat,
          interval: 60000, // Less frequent heartbeats
        },
        compression: true,
      };
      
    case "test":
      return {
        ...baseConfig,
        url: "ws://localhost:9999/ws", // Mock server
        reconnect: {
          ...baseConfig.reconnect,
          enabled: false, // No reconnection in tests
        },
        heartbeat: {
          ...baseConfig.heartbeat,
          enabled: false, // No heartbeat in tests
        },
        authentication: {
          ...baseConfig.authentication,
          enabled: false, // No auth in tests
        },
      };
      
    default:
      return baseConfig;
  }
};

// Utility functions for configuration
export const createWebSocketUrl = (baseUrl: string, params?: Record<string, string>): string => {
  const url = new URL(baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

export const validateWebSocketConfig = (config: Partial<WebSocketConfig>): string[] => {
  const errors: string[] = [];
  
  if (!config.url) {
    errors.push("WebSocket URL is required");
  }
  
  if (config.url && !config.url.startsWith("ws://") && !config.url.startsWith("wss://")) {
    errors.push("WebSocket URL must start with ws:// or wss://");
  }
  
  if (config.reconnect?.maxAttempts && config.reconnect.maxAttempts < 0) {
    errors.push("Reconnect max attempts must be non-negative");
  }
  
  if (config.reconnect?.delay && config.reconnect.delay < 0) {
    errors.push("Reconnect delay must be non-negative");
  }
  
  if (config.heartbeat?.interval && config.heartbeat.interval < 1000) {
    errors.push("Heartbeat interval must be at least 1000ms");
  }
  
  return errors;
};

export default {
  DEFAULT_WEBSOCKET_CONFIG,
  WEBSOCKET_EVENTS,
  WEBSOCKET_CLOSE_CODES,
  MESSAGE_PRIORITIES,
  CONNECTION_TIMEOUTS,
  QUEUE_LIMITS,
  RETRY_STRATEGIES,
  getWebSocketConfig,
  createWebSocketUrl,
  validateWebSocketConfig,
};
