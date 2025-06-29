// WebSocket Service for Real-Time Data
// Task 4.5.1 - Centralized WebSocket management

interface WebSocketEventHandler {
  (data: any): void;
}

interface WebSocketConnection {
  url: string;
  socket: WebSocket | null;
  handlers: Map<string, Set<WebSocketEventHandler>>;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  isReconnecting: boolean;
}

class WebSocketManager {
  private connections: Map<string, WebSocketConnection> = new Map();
  private readonly baseUrl: string;

  constructor() {
    // Determine WebSocket base URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.baseUrl = `${protocol}//${host}`;
  }

  // Connect to a WebSocket endpoint
  connect(endpoint: string, options: {
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connections.has(endpoint)) {
        resolve();
        return;
      }

      const fullUrl = endpoint.startsWith('ws') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const connection: WebSocketConnection = {
        url: fullUrl,
        socket: null,
        handlers: new Map(),
        reconnectAttempts: 0,
        maxReconnectAttempts: options.maxReconnectAttempts || 5,
        reconnectDelay: options.reconnectDelay || 3000,
        isReconnecting: false
      };

      this.connections.set(endpoint, connection);

      this.establishConnection(endpoint)
        .then(() => resolve())
        .catch(reject);
    });
  }

  // Establish actual WebSocket connection
  private async establishConnection(endpoint: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const connection = this.connections.get(endpoint);
      if (!connection) {
        reject(new Error(`Connection ${endpoint} not found`));
        return;
      }

      try {
        connection.socket = new WebSocket(connection.url);

        connection.socket.onopen = () => {
          console.log(`WebSocket connected: ${endpoint}`);
          connection.reconnectAttempts = 0;
          connection.isReconnecting = false;
          this.emit(endpoint, 'connection', { status: 'connected' });
          resolve();
        };

        connection.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(endpoint, data);
          } catch (error) {
            console.error(`Failed to parse WebSocket message from ${endpoint}:`, error);
          }
        };

        connection.socket.onerror = (error) => {
          console.error(`WebSocket error on ${endpoint}:`, error);
          this.emit(endpoint, 'error', { error: 'Connection error' });
        };

        connection.socket.onclose = (event) => {
          console.log(`WebSocket closed: ${endpoint} (${event.code}: ${event.reason})`);
          connection.socket = null;
          
          this.emit(endpoint, 'connection', { status: 'disconnected' });

          // Attempt reconnection if not intentionally closed
          if (event.code !== 1000 && !connection.isReconnecting) {
            this.attemptReconnection(endpoint);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnection(endpoint: string): void {
    const connection = this.connections.get(endpoint);
    if (!connection || connection.isReconnecting) return;

    if (connection.reconnectAttempts >= connection.maxReconnectAttempts) {
      console.log(`Max reconnection attempts reached for ${endpoint}`);
      this.emit(endpoint, 'error', { error: 'Max reconnection attempts reached' });
      return;
    }

    connection.isReconnecting = true;
    connection.reconnectAttempts++;

    const delay = connection.reconnectDelay * Math.pow(2, connection.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect to ${endpoint} in ${delay}ms (attempt ${connection.reconnectAttempts})`);

    setTimeout(() => {
      this.establishConnection(endpoint)
        .catch(() => {
          // Reconnection failed, will try again on next close event
          connection.isReconnecting = false;
        });
    }, delay);
  }

  // Handle incoming messages
  private handleMessage(endpoint: string, data: any): void {
    const connection = this.connections.get(endpoint);
    if (!connection) return;

    // Route message based on type
    if (data.type) {
      this.emit(endpoint, data.type, data.payload || data);
    } else {
      this.emit(endpoint, 'message', data);
    }
  }

  // Subscribe to events on an endpoint
  on(endpoint: string, event: string, handler: WebSocketEventHandler): void {
    const connection = this.connections.get(endpoint);
    if (!connection) {
      console.warn(`Cannot subscribe to ${event} on ${endpoint}: connection not found`);
      return;
    }

    if (!connection.handlers.has(event)) {
      connection.handlers.set(event, new Set());
    }

    connection.handlers.get(event)!.add(handler);
  }

  // Unsubscribe from events
  off(endpoint: string, event: string, handler: WebSocketEventHandler): void {
    const connection = this.connections.get(endpoint);
    if (!connection) return;

    const handlers = connection.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        connection.handlers.delete(event);
      }
    }
  }

  // Emit events to handlers
  private emit(endpoint: string, event: string, data: any): void {
    const connection = this.connections.get(endpoint);
    if (!connection) return;

    const handlers = connection.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${endpoint}:${event}:`, error);
        }
      });
    }
  }

  // Send data through WebSocket
  send(endpoint: string, data: any): boolean {
    const connection = this.connections.get(endpoint);
    if (!connection || !connection.socket || connection.socket.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot send data to ${endpoint}: connection not ready`);
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      connection.socket.send(message);
      return true;
    } catch (error) {
      console.error(`Failed to send data to ${endpoint}:`, error);
      return false;
    }
  }

  // Disconnect from endpoint
  disconnect(endpoint: string): void {
    const connection = this.connections.get(endpoint);
    if (!connection) return;

    if (connection.socket) {
      connection.socket.close(1000, 'Manual disconnect');
    }

    this.connections.delete(endpoint);
  }

  // Get connection status
  isConnected(endpoint: string): boolean {
    const connection = this.connections.get(endpoint);
    return connection?.socket?.readyState === WebSocket.OPEN || false;
  }

  // Get all active connections
  getConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  // Disconnect all connections
  disconnectAll(): void {
    this.connections.forEach((_, endpoint) => {
      this.disconnect(endpoint);
    });
  }
}

// Create singleton instance
export const webSocketManager = new WebSocketManager();

// React hook for WebSocket connections
export function useWebSocket(endpoint: string, options: {
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
} = {}) {
  const { 
    autoConnect = true, 
    maxReconnectAttempts = 5, 
    reconnectDelay = 3000 
  } = options;

  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!autoConnect) return;

    const handleConnection = (data: any) => {
      setIsConnected(data.status === 'connected');
      if (data.status === 'connected') {
        setError(null);
      }
    };

    const handleError = (data: any) => {
      setError(data.error);
      setIsConnected(false);
    };

    webSocketManager.on(endpoint, 'connection', handleConnection);
    webSocketManager.on(endpoint, 'error', handleError);

    webSocketManager.connect(endpoint, { maxReconnectAttempts, reconnectDelay })
      .catch(err => setError(err.message));

    return () => {
      webSocketManager.off(endpoint, 'connection', handleConnection);
      webSocketManager.off(endpoint, 'error', handleError);
    };
  }, [endpoint, autoConnect, maxReconnectAttempts, reconnectDelay]);

  const subscribe = React.useCallback((event: string, handler: WebSocketEventHandler) => {
    webSocketManager.on(endpoint, event, handler);
    return () => webSocketManager.off(endpoint, event, handler);
  }, [endpoint]);

  const send = React.useCallback((data: any) => {
    return webSocketManager.send(endpoint, data);
  }, [endpoint]);

  const connect = React.useCallback(() => {
    return webSocketManager.connect(endpoint, { maxReconnectAttempts, reconnectDelay });
  }, [endpoint, maxReconnectAttempts, reconnectDelay]);

  const disconnect = React.useCallback(() => {
    webSocketManager.disconnect(endpoint);
  }, [endpoint]);

  return {
    isConnected,
    error,
    subscribe,
    send,
    connect,
    disconnect
  };
}

// Import React for the hook
import React from 'react'; 