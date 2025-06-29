// Portal Synchronization React Hook
// Task 5.1.2: Cross-Portal Integration & Data Consistency

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  PortalName, 
  CrossPortalMessage, 
  PortalEvent, 
  PortalSyncHookResult,
  DataConsistencyConfig 
} from "../types/portal";
import PortalSyncService from "../services/portalSync";
import { useGlobalContext } from "../contexts/GlobalContext";

interface UsePortalSyncOptions {
  portalName: PortalName;
  autoConnect?: boolean;
  syncConfig?: Partial<DataConsistencyConfig>;
  onPortalConnect?: (portal: PortalName) => void;
  onPortalDisconnect?: (portal: PortalName) => void;
  onMessage?: (message: CrossPortalMessage) => void;
  onError?: (error: Error) => void;
}

export const usePortalSync = (options: UsePortalSyncOptions): PortalSyncHookResult => {
  const {
    portalName,
    autoConnect = true,
    syncConfig,
    onPortalConnect,
    onPortalDisconnect,
    onMessage,
    onError
  } = options;

  const { state, dispatch } = useGlobalContext();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(state.portal.connectionStatus);
  const [lastMessage, setLastMessage] = useState<CrossPortalMessage | null>(null);

  const syncServiceRef = useRef<PortalSyncService | null>(null);
  const eventListenersRef = useRef<Map<string, Set<(event: PortalEvent) => void>>>(new Map());

  // Initialize portal sync service
  useEffect(() => {
    if (!syncServiceRef.current && autoConnect) {
      try {
        syncServiceRef.current = new PortalSyncService(portalName, syncConfig);
        setIsConnected(true);
        setupEventListeners();
        console.log(`Portal sync initialized for ${portalName}`);
      } catch (error) {
        console.error("Error initializing portal sync:", error);
        if (onError) {
          onError(error as Error);
        }
      }
    }

    return () => {
      if (syncServiceRef.current) {
        syncServiceRef.current.cleanup();
        syncServiceRef.current = null;
      }
    };
  }, [portalName, autoConnect, syncConfig]);

  // Setup event listeners for portal events
  const setupEventListeners = () => {
    if (!syncServiceRef.current) return;

    const service = syncServiceRef.current;

    // Portal connection events
    service.addEventListener("portal.connect", (event) => {
      const portal = event.detail.payload.portal;
      dispatch({
        type: "UPDATE_CONNECTION_STATUS",
        payload: { portal, status: "connected" }
      });

      if (onPortalConnect) {
        onPortalConnect(portal);
      }
    });

    service.addEventListener("portal.disconnect", (event) => {
      const portal = event.detail.payload.portal;
      dispatch({
        type: "UPDATE_CONNECTION_STATUS",
        payload: { portal, status: "disconnected" }
      });

      if (onPortalDisconnect) {
        onPortalDisconnect(portal);
      }
    });

    // Data update events
    service.addEventListener("data.update", (event) => {
      const { dataType, data } = event.detail.payload;
      
      switch (dataType) {
        case "communities":
          dispatch({ type: "UPDATE_COMMUNITIES", payload: data });
          break;
        case "voting":
          dispatch({ type: "UPDATE_VOTING", payload: data });
          break;
        case "members":
          dispatch({ type: "UPDATE_MEMBERS", payload: data });
          break;
      }
    });

    // Authentication events
    service.addEventListener("auth.refresh", (event) => {
      dispatch({ type: "SET_AUTH_STATE", payload: event.detail.payload });
    });

    // Portal switch events
    service.addEventListener("portal.switch", (event) => {
      const { url, params } = event.detail.payload;
      if (url) {
        window.location.href = url;
      }
    });

    // Error events
    service.addEventListener("error.occurred", (event) => {
      const error = new Error(event.detail.payload.message);
      dispatch({ type: "SET_ERROR", payload: error.message });
      
      if (onError) {
        onError(error);
      }
    });

    // Sync events
    service.addEventListener("data.sync", (event) => {
      dispatch({
        type: "UPDATE_SYNC_STATUS",
        payload: { lastSync: Date.now(), isActive: false }
      });
    });

    service.addEventListener("data.conflict", (event) => {
      dispatch({ type: "ADD_CONFLICT", payload: event.detail.payload });
    });
  };

  // Update connection status when global state changes
  useEffect(() => {
    setConnectionStatus(state.portal.connectionStatus);
  }, [state.portal.connectionStatus]);

  // Switch portal function
  const switchPortal = useCallback(async (portal: PortalName, reason?: string): Promise<void> => {
    if (!syncServiceRef.current) {
      throw new Error("Portal sync service not initialized");
    }

    try {
      dispatch({ type: "SET_TRANSITIONING", payload: true });

      // Get portal URL from state
      const portalConfig = state.portal.availablePortals.find(p => p.name === portal);
      if (!portalConfig) {
        throw new Error(`Portal ${portal} not found`);
      }

      // Send switch request
      syncServiceRef.current.requestPortalSwitch(portal, portalConfig.url);

      // Update current portal in state
      dispatch({ type: "SET_CURRENT_PORTAL", payload: portal });

      // Perform the actual navigation
      setTimeout(() => {
        window.location.href = portalConfig.url;
      }, 500);

    } catch (error) {
      dispatch({ type: "SET_TRANSITIONING", payload: false });
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  }, [state.portal.availablePortals, dispatch]);

  // Send message function
  const sendMessage = useCallback((message: Omit<CrossPortalMessage, "id" | "timestamp">): void => {
    if (!syncServiceRef.current) {
      console.warn("Portal sync service not initialized");
      return;
    }

    try {
      syncServiceRef.current.sendMessage(message);
      setLastMessage(message as CrossPortalMessage);

      if (onMessage) {
        onMessage(message as CrossPortalMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [onMessage, onError]);

  // Sync data function
  const syncData = useCallback(async (dataType?: string): Promise<void> => {
    if (!syncServiceRef.current) {
      throw new Error("Portal sync service not initialized");
    }

    try {
      dispatch({ type: "UPDATE_SYNC_STATUS", payload: { isActive: true } });

      if (dataType) {
        syncServiceRef.current.requestSync(dataType);
      } else {
        // Sync all data types
        const dataTypes = ["communities", "voting", "members", "analytics"];
        dataTypes.forEach(type => {
          syncServiceRef.current?.requestSync(type);
        });
      }

      // Update last sync time
      setTimeout(() => {
        dispatch({
          type: "UPDATE_SYNC_STATUS",
          payload: { isActive: false, lastSync: Date.now() }
        });
      }, 2000);

    } catch (error) {
      dispatch({
        type: "UPDATE_SYNC_STATUS",
        payload: { isActive: false }
      });
      throw error;
    }
  }, [dispatch]);

  // Add event listener function
  const addEventListener = useCallback((type: string, handler: (event: PortalEvent) => void): (() => void) => {
    if (!eventListenersRef.current.has(type)) {
      eventListenersRef.current.set(type, new Set());
    }

    eventListenersRef.current.get(type)!.add(handler);

    // Setup actual event listener if service is available
    let cleanup: (() => void) | null = null;
    if (syncServiceRef.current) {
      cleanup = syncServiceRef.current.addEventListener(type, (event) => {
        handler(event.detail);
      });
    }

    // Return cleanup function
    return () => {
      const handlers = eventListenersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventListenersRef.current.delete(type);
        }
      }

      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Remove event listener function
  const removeEventListener = useCallback((type: string, handler: (event: PortalEvent) => void): void => {
    const handlers = eventListenersRef.current.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventListenersRef.current.delete(type);
      }
    }
  }, []);

  // Check if portal is available
  const isPortalAvailable = useCallback((portal: PortalName): boolean => {
    return state.portal.availablePortals.some(p => p.name === portal);
  }, [state.portal.availablePortals]);

  // Get portal URL
  const getPortalUrl = useCallback((portal: PortalName): string => {
    const portalConfig = state.portal.availablePortals.find(p => p.name === portal);
    return portalConfig?.url || "";
  }, [state.portal.availablePortals]);

  // Get last message of specific type
  const getLastMessage = useCallback((type?: CrossPortalMessage["type"]): CrossPortalMessage | null => {
    if (!type) return lastMessage;

    // Find last message of specific type from message queue
    const messages = state.portal.messageQueue.filter(m => m.type === type);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [lastMessage, state.portal.messageQueue]);

  return {
    // State
    currentPortal: state.portal.currentPortal,
    isConnected,
    connectionStatus,

    // Actions
    switchPortal,
    sendMessage,
    syncData,

    // Event Management
    addEventListener,
    removeEventListener,

    // Utilities
    isPortalAvailable,
    getPortalUrl,
    getLastMessage,
  };
};

export default usePortalSync; 