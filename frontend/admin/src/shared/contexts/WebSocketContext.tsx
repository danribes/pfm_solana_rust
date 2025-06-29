// WebSocket Context Provider
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  WebSocketContextValue,
  ConnectionStatus,
  WebSocketStats,
  RealtimeData,
  WebSocketMessage,
  WebSocketConfig,
} from "../types/websocket";
import { useWebSocket } from "../hooks/useWebSocket";
import { getWebSocketConfig } from "../config/websocket";

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  config?: Partial<WebSocketConfig>;
  autoConnect?: boolean;
  environment?: "development" | "production" | "test";
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
  config = {},
  autoConnect = true,
  environment = "development",
}) => {
  // Get environment-specific configuration
  const envConfig = getWebSocketConfig(environment);
  const finalConfig = { ...envConfig, ...config };
  
  // Use WebSocket hook
  const {
    isConnected,
    connectionStatus,
    realtimeData,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    reconnect,
    getStats,
  } = useWebSocket({
    url: url || finalConfig.url,
    config: finalConfig,
    autoConnect,
  });

  // Local state for global management
  const [globalSubscriptions] = useState<Map<string, string>>(new Map());
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

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 2000);

    return () => clearInterval(interval);
  }, [getStats]);

  // Broadcast message to all connections
  const broadcast = async (message: Partial<WebSocketMessage>): Promise<boolean> => {
    try {
      return await send({
        ...message,
        type: message.type || "broadcast",
        target: "all",
      });
    } catch (error) {
      console.error("Error broadcasting message:", error);
      return false;
    }
  };

  // Global subscription management
  const subscribeGlobal = (event: string, handler: (data: any) => void): string => {
    const subscriptionId = subscribe(event, handler);
    globalSubscriptions.set(subscriptionId, event);
    return subscriptionId;
  };

  // Global unsubscription
  const unsubscribeGlobal = (subscriptionId: string): boolean => {
    const result = unsubscribe(subscriptionId);
    if (result) {
      globalSubscriptions.delete(subscriptionId);
    }
    return result;
  };

  // Reconnect all connections
  const reconnectAll = async (): Promise<void> => {
    try {
      await reconnect();
    } catch (error) {
      console.error("Error reconnecting:", error);
      throw error;
    }
  };

  // Disconnect all connections
  const disconnectAll = (): void => {
    try {
      disconnect();
      globalSubscriptions.clear();
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  // Context value
  const contextValue: WebSocketContextValue = {
    isConnected,
    connectionStatus,
    stats,
    realtimeData,
    broadcast,
    subscribeGlobal,
    unsubscribeGlobal,
    reconnectAll,
    disconnectAll,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

// Higher-order component for WebSocket functionality
export const withWebSocket = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { wsConfig?: Partial<WebSocketConfig> }> => {
  return ({ wsConfig, ...props }) => (
    <WebSocketProvider config={wsConfig}>
      <Component {...(props as P)} />
    </WebSocketProvider>
  );
};

// Hook for real-time voting updates
export const useVotingUpdates = () => {
  const { realtimeData, subscribeGlobal, unsubscribeGlobal } = useWebSocketContext();
  
  useEffect(() => {
    const subscriptions: string[] = [];
    
    // Subscribe to voting events
    subscriptions.push(
      subscribeGlobal("voting.results.update", (data) => {
        console.log("Voting results updated:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("voting.vote.new", (data) => {
        console.log("New vote received:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("voting.status.change", (data) => {
        console.log("Voting status changed:", data);
      })
    );

    return () => {
      subscriptions.forEach(id => unsubscribeGlobal(id));
    };
  }, [subscribeGlobal, unsubscribeGlobal]);

  return {
    votingResults: realtimeData.voting.results,
    newVotes: realtimeData.voting.newVotes,
    statusChanges: realtimeData.voting.statusChanges,
  };
};

// Hook for real-time community updates
export const useCommunityUpdates = () => {
  const { realtimeData, subscribeGlobal, unsubscribeGlobal } = useWebSocketContext();
  
  useEffect(() => {
    const subscriptions: string[] = [];
    
    // Subscribe to community events
    subscriptions.push(
      subscribeGlobal("community.member.joined", (data) => {
        console.log("Member joined:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("community.member.left", (data) => {
        console.log("Member left:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("community.activity.update", (data) => {
        console.log("Community activity:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("community.treasury.update", (data) => {
        console.log("Treasury updated:", data);
      })
    );

    return () => {
      subscriptions.forEach(id => unsubscribeGlobal(id));
    };
  }, [subscribeGlobal, unsubscribeGlobal]);

  return {
    memberJoined: realtimeData.community.memberJoined,
    memberLeft: realtimeData.community.memberLeft,
    activityFeed: realtimeData.community.activityFeed,
    treasuryUpdates: realtimeData.community.treasuryUpdates,
  };
};

// Hook for real-time notifications
export const useNotifications = () => {
  const { realtimeData, subscribeGlobal, unsubscribeGlobal } = useWebSocketContext();
  
  useEffect(() => {
    const subscriptions: string[] = [];
    
    // Subscribe to notification events
    subscriptions.push(
      subscribeGlobal("notifications.personal", (data) => {
        console.log("Personal notification:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("notifications.broadcast", (data) => {
        console.log("Broadcast notification:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("notifications.urgent", (data) => {
        console.log("Urgent notification:", data);
      })
    );

    return () => {
      subscriptions.forEach(id => unsubscribeGlobal(id));
    };
  }, [subscribeGlobal, unsubscribeGlobal]);

  return {
    personal: realtimeData.notifications.personal,
    broadcast: realtimeData.notifications.broadcast,
    urgent: realtimeData.notifications.urgent,
  };
};

// Hook for system status updates
export const useSystemStatus = () => {
  const { realtimeData, subscribeGlobal, unsubscribeGlobal } = useWebSocketContext();
  
  useEffect(() => {
    const subscriptions: string[] = [];
    
    // Subscribe to system events
    subscriptions.push(
      subscribeGlobal("system.status.update", (data) => {
        console.log("System status updated:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("system.announcement", (data) => {
        console.log("System announcement:", data);
      })
    );
    
    subscriptions.push(
      subscribeGlobal("system.maintenance", (data) => {
        console.log("Maintenance update:", data);
      })
    );

    return () => {
      subscriptions.forEach(id => unsubscribeGlobal(id));
    };
  }, [subscribeGlobal, unsubscribeGlobal]);

  return {
    status: realtimeData.system.status,
    announcements: realtimeData.system.announcements,
    maintenance: realtimeData.system.maintenance,
  };
};

export default WebSocketProvider;
