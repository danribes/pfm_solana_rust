// WebSocket React Hook
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WebSocketConfig,
  WebSocketHookResult,
  ConnectionStatus,
  WebSocketReadyState,
  WebSocketError,
  WebSocketStats,
  WebSocketConnectionInfo,
  RealtimeData,
  WebSocketMessage,
  EventSubscription,
} from "../types/websocket";
import WebSocketService from "../services/websocket";
import { DEFAULT_WEBSOCKET_CONFIG, WEBSOCKET_EVENTS } from "../config/websocket";

interface UseWebSocketOptions {
  url?: string;
  config?: Partial<WebSocketConfig>;
  autoConnect?: boolean;
  dependencies?: any[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: WebSocketError) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): WebSocketHookResult => {
  const {
    url,
    config = {},
    autoConnect = true,
    dependencies = [],
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [readyState, setReadyState] = useState<WebSocketReadyState>("CLOSED");
  const [lastError, setLastError] = useState<WebSocketError | null>(null);
  const [stats, setStats] = useState<WebSocketStats>({
    connectionCount: 0,
    messagesReceived: 0,
    messagesSent: 0,
    lastMessage: 0,
    uptime: 0,
    reconnectCount: 0,
    errorCount: 0,
    averageLatency: 0,
    bytesReceived: 0,
    bytesSent: 0,
  });
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    voting: { results: {} as any, newVotes: [], statusChanges: [] },
    community: { memberJoined: {} as any, memberLeft: {} as any, activityFeed: [], treasuryUpdates: [] },
    system: { status: {} as any, announcements: [], maintenance: [] },
    notifications: { personal: [], broadcast: [], urgent: [] },
  });
  const [lastUpdate, setLastUpdate] = useState(0);

  // Refs
  const serviceRef = useRef<WebSocketService | null>(null);
  const eventListenersRef = useRef<Map<string, () => void>>(new Map());
  const subscriptionsRef = useRef<Map<string, string>>(new Map());

  // Create WebSocket configuration
  const createConfig = useCallback((): WebSocketConfig => {
    const baseConfig = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
    if (url) {
      baseConfig.url = url;
    }
    return baseConfig;
  }, [url, config]);

  // Initialize WebSocket service
  const initializeService = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.cleanup();
    }

    const wsConfig = createConfig();
    serviceRef.current = new WebSocketService(wsConfig);

    // Setup event listeners
    setupEventListeners();

    if (autoConnect) {
      connect();
    }
  }, [autoConnect, createConfig]);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    if (!serviceRef.current) return;

    const service = serviceRef.current;

    // Connection events
    const connectionOpenListener = service.addEventListener(
      WEBSOCKET_EVENTS.CONNECTION.OPEN,
      (event) => {
        setIsConnected(true);
        setConnectionStatus("connected");
        setReadyState("OPEN");
        updateStats();
        
        if (onConnect) {
          onConnect();
        }
      }
    );

    const connectionCloseListener = service.addEventListener(
      WEBSOCKET_EVENTS.CONNECTION.CLOSE,
      (event) => {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setReadyState("CLOSED");
        updateStats();
        
        if (onDisconnect) {
          onDisconnect();
        }
      }
    );

    const connectionErrorListener = service.addEventListener(
      WEBSOCKET_EVENTS.CONNECTION.ERROR,
      (event) => {
        setConnectionStatus("failed");
        setReadyState("CLOSED");
        
        const error: WebSocketError = {
          code: -1,
          reason: event.data?.reason || "Connection error",
          wasClean: false,
          timestamp: Date.now(),
          context: "connection",
        };
        
        setLastError(error);
        updateStats();
        
        if (onError) {
          onError(error);
        }
      }
    );

    const reconnectListener = service.addEventListener(
      WEBSOCKET_EVENTS.CONNECTION.RECONNECT,
      (event) => {
        setConnectionStatus("reconnecting");
        setReadyState("CONNECTING");
        updateStats();
      }
    );

    // Message events
    const messageReceivedListener = service.addEventListener(
      WEBSOCKET_EVENTS.MESSAGE.RECEIVED,
      (event) => {
        updateStats();
        updateRealtimeDataFromMessage(event.data);
        setLastUpdate(Date.now());
        
        if (onMessage) {
          onMessage(event.data);
        }
      }
    );

    const messageSentListener = service.addEventListener(
      WEBSOCKET_EVENTS.MESSAGE.SENT,
      (event) => {
        updateStats();
      }
    );

    // Store cleanup functions
    eventListenersRef.current.set("connection.open", connectionOpenListener);
    eventListenersRef.current.set("connection.close", connectionCloseListener);
    eventListenersRef.current.set("connection.error", connectionErrorListener);
    eventListenersRef.current.set("connection.reconnect", reconnectListener);
    eventListenersRef.current.set("message.received", messageReceivedListener);
    eventListenersRef.current.set("message.sent", messageSentListener);
  }, [onConnect, onDisconnect, onError, onMessage]);

  // Update stats from service
  const updateStats = useCallback(() => {
    if (serviceRef.current) {
      setStats(serviceRef.current.getStats());
      setConnectionStatus(serviceRef.current.getConnectionStatus());
      setReadyState(serviceRef.current.getReadyState());
    }
  }, []);

  // Update real-time data from message
  const updateRealtimeDataFromMessage = useCallback((message: WebSocketMessage) => {
    setRealtimeData(prevData => {
      const newData = { ...prevData };

      switch (message.event) {
        case "voting.results.update":
          newData.voting.results = message.data;
          break;
        case "voting.vote.new":
          newData.voting.newVotes = [...newData.voting.newVotes, message.data].slice(-50);
          break;
        case "voting.status.change":
          newData.voting.statusChanges = [...newData.voting.statusChanges, message.data].slice(-20);
          break;
        case "community.member.joined":
          newData.community.memberJoined = message.data;
          break;
        case "community.member.left":
          newData.community.memberLeft = message.data;
          break;
        case "community.activity.update":
          newData.community.activityFeed = [...newData.community.activityFeed, message.data].slice(-100);
          break;
        case "community.treasury.update":
          newData.community.treasuryUpdates = [...newData.community.treasuryUpdates, message.data].slice(-50);
          break;
        case "system.status.update":
          newData.system.status = message.data;
          break;
        case "system.announcement":
          newData.system.announcements = [...newData.system.announcements, message.data].slice(-20);
          break;
        case "system.maintenance":
          newData.system.maintenance = [...newData.system.maintenance, message.data].slice(-10);
          break;
        case "notifications.personal":
          newData.notifications.personal = [...newData.notifications.personal, message.data].slice(-100);
          break;
        case "notifications.broadcast":
          newData.notifications.broadcast = [...newData.notifications.broadcast, message.data].slice(-50);
          break;
        case "notifications.urgent":
          newData.notifications.urgent = [...newData.notifications.urgent, message.data].slice(-20);
          break;
      }

      return newData;
    });
  }, []);

  // Connect function
  const connect = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) {
      initializeService();
      return;
    }

    try {
      setConnectionStatus("connecting");
      setReadyState("CONNECTING");
      await serviceRef.current.connect();
    } catch (error) {
      const wsError: WebSocketError = {
        code: -1,
        reason: error instanceof Error ? error.message : "Connection failed",
        wasClean: false,
        timestamp: Date.now(),
        context: "connect",
      };
      setLastError(wsError);
      setConnectionStatus("failed");
      setReadyState("CLOSED");
      throw error;
    }
  }, [initializeService]);

  // Disconnect function
  const disconnect = useCallback((): void => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setReadyState("CLOSED");
  }, []);

  // Reconnect function
  const reconnect = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) {
      return connect();
    }

    try {
      setConnectionStatus("reconnecting");
      await serviceRef.current.reconnect();
    } catch (error) {
      const wsError: WebSocketError = {
        code: -1,
        reason: error instanceof Error ? error.message : "Reconnection failed",
        wasClean: false,
        timestamp: Date.now(),
        context: "reconnect",
      };
      setLastError(wsError);
      throw error;
    }
  }, [connect]);

  // Send message function
  const send = useCallback(async (message: Partial<WebSocketMessage>): Promise<boolean> => {
    if (!serviceRef.current) {
      return false;
    }

    try {
      const result = await serviceRef.current.send(message);
      updateStats();
      return result;
    } catch (error) {
      return false;
    }
  }, [updateStats]);

  // Send raw data function
  const sendRaw = useCallback(async (data: string | ArrayBuffer | Blob): Promise<boolean> => {
    if (!serviceRef.current) {
      return false;
    }

    try {
      const result = await serviceRef.current.sendRaw(data);
      updateStats();
      return result;
    } catch (error) {
      return false;
    }
  }, [updateStats]);

  // Subscribe function
  const subscribe = useCallback((
    event: string,
    handler: (data: any) => void,
    options?: Partial<EventSubscription>
  ): string => {
    if (!serviceRef.current) {
      return "";
    }

    const subscriptionId = serviceRef.current.subscribe(event, handler, options);
    subscriptionsRef.current.set(subscriptionId, event);
    return subscriptionId;
  }, []);

  // Unsubscribe function
  const unsubscribe = useCallback((subscriptionId: string): boolean => {
    if (!serviceRef.current) {
      return false;
    }

    const result = serviceRef.current.unsubscribe(subscriptionId);
    if (result) {
      subscriptionsRef.current.delete(subscriptionId);
    }
    return result;
  }, []);

  // Get stats function
  const getStats = useCallback((): WebSocketStats => {
    if (!serviceRef.current) {
      return stats;
    }
    return serviceRef.current.getStats();
  }, [stats]);

  // Get connection info function
  const getConnectionInfo = useCallback((): WebSocketConnectionInfo | null => {
    if (!serviceRef.current) {
      return null;
    }

    const service = serviceRef.current;
    return {
      id: "ws-connection",
      url: createConfig().url,
      readyState: service.getReadyState(),
      protocol: "",
      extensions: "",
      bufferedAmount: 0,
      binaryType: createConfig().binaryType,
    };
  }, [createConfig]);

  // Clear queue function
  const clearQueue = useCallback((): void => {
    if (serviceRef.current) {
      serviceRef.current.clearQueue();
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeService();

    return () => {
      // Cleanup on unmount
      if (serviceRef.current) {
        serviceRef.current.cleanup();
      }

      // Clean up event listeners
      eventListenersRef.current.forEach(cleanup => cleanup());
      eventListenersRef.current.clear();

      // Clear subscriptions
      subscriptionsRef.current.clear();
    };
  }, [initializeService]);

  // Re-initialize when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      initializeService();
    }
  }, dependencies);

  // Periodic stats update
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    // Connection State
    isConnected,
    connectionStatus,
    readyState,
    lastError,

    // Connection Management
    connect,
    disconnect,
    reconnect,

    // Messaging
    send,
    sendRaw,

    // Event Management
    subscribe,
    unsubscribe,

    // Utilities
    getStats,
    getConnectionInfo,
    clearQueue,

    // Real-time Data
    realtimeData,
    lastUpdate,
  };
};

export default useWebSocket;
