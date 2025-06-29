// WebSocket Service Implementation
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import {
  WebSocketConfig,
  WebSocketMessage,
  WebSocketEvent,
  EventSubscription,
  WebSocketStats,
  ReconnectionState,
  WebSocketError,
  HeartbeatState,
  MessageQueue,
  ConnectionStatus,
  WebSocketReadyState,
  RealtimeData,
} from "../types/websocket";
import { 
  DEFAULT_WEBSOCKET_CONFIG, 
  WEBSOCKET_EVENTS, 
  WEBSOCKET_CLOSE_CODES,
  CONNECTION_TIMEOUTS,
  QUEUE_LIMITS,
} from "../config/websocket";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private messageQueue: MessageQueue;
  private stats: WebSocketStats;
  private reconnectionState: ReconnectionState;
  private heartbeatState: HeartbeatState;
  private eventListeners: Map<string, Set<(event: any) => void>> = new Map();
  private connectionStatus: ConnectionStatus = "disconnected";
  private lastError: WebSocketError | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;
  private realtimeData: RealtimeData;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
    this.initializeState();
  }

  /**
   * Initialize service state
   */
  private initializeState(): void {
    this.messageQueue = {
      outgoing: [],
      incoming: [],
      failed: [],
      processed: [],
    };

    this.stats = {
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
    };

    this.reconnectionState = {
      attempt: 0,
      maxAttempts: this.config.reconnect.maxAttempts,
      nextDelay: this.config.reconnect.delay,
      backoffFactor: this.config.reconnect.backoffFactor,
      lastAttempt: 0,
      totalAttempts: 0,
    };

    this.heartbeatState = {
      lastPing: 0,
      lastPong: 0,
      latency: 0,
      missedPings: 0,
      isAlive: true,
    };

    this.realtimeData = {
      voting: {
        results: {} as any,
        newVotes: [],
        statusChanges: [],
      },
      community: {
        memberJoined: {} as any,
        memberLeft: {} as any,
        activityFeed: [],
        treasuryUpdates: [],
      },
      system: {
        status: {} as any,
        announcements: [],
        maintenance: [],
      },
      notifications: {
        personal: [],
        broadcast: [],
        urgent: [],
      },
    };
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionStatus = "connecting";
        this.isManualDisconnect = false;
        this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.OPEN, { status: "connecting" });

        this.ws = new WebSocket(this.config.url, this.config.protocols);
        this.ws.binaryType = this.config.binaryType;

        const connectTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, CONNECTION_TIMEOUTS.CONNECT);

        this.ws.onopen = (event) => {
          clearTimeout(connectTimeout);
          this.connectionStatus = "connected";
          this.stats.connectionCount++;
          this.stats.uptime = Date.now();
          this.reconnectionState.attempt = 0;
          this.reconnectionState.nextDelay = this.config.reconnect.delay;

          this.setupHeartbeat();
          this.processQueuedMessages();
          
          if (this.config.authentication.enabled) {
            this.authenticateConnection();
          }

          this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.OPEN, { 
            event, 
            status: "connected",
            protocol: this.ws?.protocol,
            extensions: this.ws?.extensions,
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          this.handleClose(event);
          
          if (this.connectionStatus === "connecting") {
            reject(new Error(`Connection failed: ${event.reason || "Unknown reason"}`));
          }
        };

        this.ws.onerror = (event) => {
          clearTimeout(connectTimeout);
          this.handleError(event);
          reject(new Error("WebSocket connection error"));
        };

      } catch (error) {
        this.connectionStatus = "failed";
        this.lastError = {
          code: -1,
          reason: error instanceof Error ? error.message : "Unknown error",
          wasClean: false,
          timestamp: Date.now(),
          context: "connect",
        };
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.isManualDisconnect = true;
    this.connectionStatus = "disconnected";
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(WEBSOCKET_CLOSE_CODES.NORMAL_CLOSURE, "Manual disconnect");
      this.ws = null;
    }

    this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.CLOSE, { 
      reason: "Manual disconnect",
      wasClean: true,
    });
  }

  /**
   * Reconnect to WebSocket server
   */
  public async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    return this.connect();
  }

  /**
   * Send message through WebSocket
   */
  public async send(message: Partial<WebSocketMessage>): Promise<boolean> {
    const fullMessage: WebSocketMessage = {
      id: message.id || this.generateMessageId(),
      type: message.type || "message",
      event: message.event || "data",
      data: message.data,
      timestamp: message.timestamp || Date.now(),
      source: message.source,
      target: message.target,
      priority: message.priority || "medium",
      persistent: message.persistent || false,
      ttl: message.ttl,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const serialized = JSON.stringify(fullMessage);
        this.ws.send(serialized);
        
        this.stats.messagesSent++;
        this.stats.bytesSent += serialized.length;
        this.stats.lastMessage = Date.now();

        this.emitEvent(WEBSOCKET_EVENTS.MESSAGE.SENT, fullMessage);
        return true;
      } catch (error) {
        this.addToQueue("failed", fullMessage);
        return false;
      }
    } else {
      this.addToQueue("outgoing", fullMessage);
      return false;
    }
  }

  /**
   * Send raw data through WebSocket
   */
  public async sendRaw(data: string | ArrayBuffer | Blob): Promise<boolean> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(data);
        this.stats.messagesSent++;
        
        if (typeof data === "string") {
          this.stats.bytesSent += data.length;
        } else if (data instanceof ArrayBuffer) {
          this.stats.bytesSent += data.byteLength;
        }
        
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /**
   * Subscribe to events
   */
  public subscribe(
    event: string, 
    handler: (data: any) => void, 
    options?: Partial<EventSubscription>
  ): string {
    const subscription: EventSubscription = {
      id: options?.id || this.generateSubscriptionId(),
      event,
      handler,
      filter: options?.filter,
      transform: options?.transform,
      once: options?.once || false,
      createdAt: Date.now(),
    };

    this.subscriptions.set(subscription.id, subscription);
    this.emitEvent(WEBSOCKET_EVENTS.SUBSCRIPTION.ADDED, { subscription });

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId);
    
    if (removed) {
      this.emitEvent(WEBSOCKET_EVENTS.SUBSCRIPTION.REMOVED, { subscriptionId });
    }
    
    return removed;
  }

  /**
   * Get connection statistics
   */
  public getStats(): WebSocketStats {
    const uptime = this.stats.uptime > 0 ? Date.now() - this.stats.uptime : 0;
    
    return {
      ...this.stats,
      uptime,
      averageLatency: this.heartbeatState.latency,
    };
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get WebSocket ready state
   */
  public getReadyState(): WebSocketReadyState {
    if (!this.ws) return "CLOSED";
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return "CONNECTING";
      case WebSocket.OPEN: return "OPEN";
      case WebSocket.CLOSING: return "CLOSING";
      case WebSocket.CLOSED: return "CLOSED";
      default: return "CLOSED";
    }
  }

  /**
   * Get real-time data
   */
  public getRealtimeData(): RealtimeData {
    return this.realtimeData;
  }

  /**
   * Clear message queues
   */
  public clearQueue(): void {
    this.messageQueue.outgoing = [];
    this.messageQueue.incoming = [];
    this.messageQueue.failed = [];
    this.messageQueue.processed = [];
  }

  /**
   * Add event listener
   */
  public addEventListener(type: string, handler: (event: any) => void): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    
    this.eventListeners.get(type)!.add(handler);
    
    return () => {
      const handlers = this.eventListeners.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventListeners.delete(type);
        }
      }
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      let message: WebSocketMessage;
      
      if (typeof event.data === "string") {
        message = JSON.parse(event.data);
      } else {
        // Handle binary data
        return;
      }

      this.stats.messagesReceived++;
      this.stats.bytesReceived += event.data.length;
      this.stats.lastMessage = Date.now();

      // Handle heartbeat responses
      if (message.type === "pong" || message.event === "pong") {
        this.handleHeartbeatResponse(message);
        return;
      }

      // Process subscriptions
      this.processSubscriptions(message);
      
      // Update real-time data
      this.updateRealtimeData(message);

      this.addToQueue("incoming", message);
      this.emitEvent(WEBSOCKET_EVENTS.MESSAGE.RECEIVED, message);

    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      this.stats.errorCount++;
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(event: CloseEvent): void {
    this.connectionStatus = "disconnected";
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.lastError = {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      timestamp: Date.now(),
      context: "close",
    };

    this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.CLOSE, {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });

    // Attempt reconnection if enabled and not manual disconnect
    if (
      this.config.reconnect.enabled && 
      !this.isManualDisconnect &&
      this.reconnectionState.attempt < this.reconnectionState.maxAttempts
    ) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection errors
   */
  private handleError(event: Event): void {
    this.stats.errorCount++;
    this.connectionStatus = "failed";
    
    this.lastError = {
      code: -1,
      reason: "WebSocket error occurred",
      wasClean: false,
      timestamp: Date.now(),
      context: "error",
    };

    this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.ERROR, { error: event });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.connectionStatus = "reconnecting";
    this.reconnectionState.attempt++;
    this.reconnectionState.totalAttempts++;
    this.reconnectionState.lastAttempt = Date.now();

    const delay = Math.min(
      this.reconnectionState.nextDelay,
      this.config.reconnect.maxDelay
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => {
        this.reconnectionState.nextDelay *= this.reconnectionState.backoffFactor;
        
        if (this.reconnectionState.attempt < this.reconnectionState.maxAttempts) {
          this.scheduleReconnect();
        } else {
          this.connectionStatus = "failed";
          this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.ERROR, {
            reason: "Max reconnection attempts reached",
          });
        }
      });
    }, delay);

    this.emitEvent(WEBSOCKET_EVENTS.CONNECTION.RECONNECT, {
      attempt: this.reconnectionState.attempt,
      maxAttempts: this.reconnectionState.maxAttempts,
      delay,
    });
  }

  /**
   * Setup heartbeat mechanism
   */
  private setupHeartbeat(): void {
    if (!this.config.heartbeat.enabled) return;

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.heartbeatState.lastPing = Date.now();
        this.heartbeatState.missedPings++;
        
        this.send({
          type: "ping",
          event: "ping",
          data: { timestamp: this.heartbeatState.lastPing },
        });

        // Check for missed pongs
        if (this.heartbeatState.missedPings > 3) {
          this.heartbeatState.isAlive = false;
          this.ws.close(WEBSOCKET_CLOSE_CODES.HEARTBEAT_TIMEOUT, "Heartbeat timeout");
        }
      }
    }, this.config.heartbeat.interval);
  }

  /**
   * Handle heartbeat response
   */
  private handleHeartbeatResponse(message: WebSocketMessage): void {
    this.heartbeatState.lastPong = Date.now();
    this.heartbeatState.latency = this.heartbeatState.lastPong - this.heartbeatState.lastPing;
    this.heartbeatState.missedPings = Math.max(0, this.heartbeatState.missedPings - 1);
    this.heartbeatState.isAlive = true;

    this.emitEvent(WEBSOCKET_EVENTS.HEARTBEAT.PONG, {
      latency: this.heartbeatState.latency,
      timestamp: this.heartbeatState.lastPong,
    });
  }

  /**
   * Authenticate connection
   */
  private authenticateConnection(): void {
    if (this.config.authentication.token) {
      this.send({
        type: "auth",
        event: "authenticate",
        data: {
          token: this.config.authentication.token,
          refreshToken: this.config.authentication.refreshToken,
        },
      });
    }
  }

  /**
   * Process queued messages
   */
  private processQueuedMessages(): void {
    const toProcess = [...this.messageQueue.outgoing];
    this.messageQueue.outgoing = [];

    toProcess.forEach(message => {
      this.send(message);
    });
  }

  /**
   * Process subscriptions for incoming message
   */
  private processSubscriptions(message: WebSocketMessage): void {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.event === message.event || subscription.event === "*") {
        let data = message.data;

        // Apply filter if present
        if (subscription.filter && !subscription.filter(data)) {
          continue;
        }

        // Apply transformation if present
        if (subscription.transform) {
          data = subscription.transform(data);
        }

        try {
          subscription.handler(data);

          // Remove one-time subscriptions
          if (subscription.once) {
            this.unsubscribe(subscription.id);
          }
        } catch (error) {
          console.error("Error in subscription handler:", error);
        }
      }
    }
  }

  /**
   * Update real-time data based on message
   */
  private updateRealtimeData(message: WebSocketMessage): void {
    switch (message.event) {
      case "voting.results.update":
        this.realtimeData.voting.results = message.data;
        break;
      case "voting.vote.new":
        this.realtimeData.voting.newVotes.push(message.data);
        break;
      case "community.member.joined":
        this.realtimeData.community.memberJoined = message.data;
        break;
      case "notifications.personal":
        this.realtimeData.notifications.personal.push(message.data);
        break;
      case "system.status.update":
        this.realtimeData.system.status = message.data;
        break;
    }
  }

  /**
   * Add message to queue
   */
  private addToQueue(queueType: keyof MessageQueue, message: WebSocketMessage): void {
    const queue = this.messageQueue[queueType];
    const limit = QUEUE_LIMITS[queueType.toUpperCase() as keyof typeof QUEUE_LIMITS];

    queue.push(message);

    // Enforce queue limits
    if (queue.length > limit) {
      queue.splice(0, queue.length - limit);
    }
  }

  /**
   * Emit internal events
   */
  private emitEvent(type: string, data: any): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type, data, timestamp: Date.now() });
        } catch (error) {
          console.error("Error in event handler:", error);
        }
      });
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.eventListeners.clear();
    this.clearQueue();
  }
}

export default WebSocketService;
