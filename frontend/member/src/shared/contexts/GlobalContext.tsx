// Global Context Provider for Cross-Portal Integration
// Task 5.1.2: Cross-Portal Integration & Data Consistency

import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from "react";
import { 
  GlobalState, 
  StateAction, 
  PortalName, 
  PortalEvent,
  CrossPortalMessage,
  globalStateReducer,
  initialGlobalState,
  GlobalStateManager 
} from "../state/globalStore";

interface GlobalContextValue {
  state: GlobalState;
  dispatch: React.Dispatch<StateAction>;
  stateManager: GlobalStateManager;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

interface GlobalProviderProps {
  children: ReactNode;
  portalName: PortalName;
  initialState?: Partial<GlobalState>;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  portalName,
  initialState = {} 
}) => {
  // Initialize state with portal-specific configuration
  const portalSpecificInitialState: GlobalState = {
    ...initialGlobalState,
    portal: {
      ...initialGlobalState.portal,
      currentPortal: portalName,
      connectionStatus: {
        ...initialGlobalState.portal.connectionStatus,
        [portalName]: "connected"
      }
    },
    ...initialState
  };

  const [state, dispatch] = useReducer(globalStateReducer, portalSpecificInitialState);
  const stateManagerRef = useRef<GlobalStateManager | null>(null);

  // Initialize state manager
  useEffect(() => {
    if (!stateManagerRef.current) {
      stateManagerRef.current = new GlobalStateManager(portalSpecificInitialState);
      
      // Sync React state with state manager
      stateManagerRef.current.subscribe((newState) => {
        if (JSON.stringify(newState) !== JSON.stringify(state)) {
          // Update React state to match state manager
          Object.keys(newState).forEach(key => {
            if (JSON.stringify(newState[key as keyof GlobalState]) !== 
                JSON.stringify(state[key as keyof GlobalState])) {
              // This is a simplified sync - in production, you would use more specific actions
              dispatch({ type: "RESET_STATE" });
            }
          });
        }
      });
    }
  }, []);

  // Sync React state changes to state manager
  useEffect(() => {
    if (stateManagerRef.current) {
      const currentManagerState = stateManagerRef.current.getState();
      if (JSON.stringify(currentManagerState) !== JSON.stringify(state)) {
        // Update state manager to match React state
        stateManagerRef.current = new GlobalStateManager(state);
      }
    }
  }, [state]);

  // Setup cross-portal communication
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("pfm-portal-")) {
        try {
          const message: CrossPortalMessage = JSON.parse(e.newValue || "{}");
          if (message.target === portalName || message.target === "all") {
            handleCrossPortalMessage(message);
          }
        } catch (error) {
          console.error("Error parsing cross-portal message:", error);
        }
      }
    };

    const handleVisibilityChange = () => {
      const connectionStatus = document.hidden ? "disconnected" : "connected";
      dispatch({
        type: "UPDATE_CONNECTION_STATUS",
        payload: { portal: portalName, status: connectionStatus }
      });
    };

    const handleBeforeUnload = () => {
      // Send disconnect message to other portals
      sendCrossPortalMessage({
        type: "notification",
        source: portalName,
        target: "all",
        payload: {
          type: "portal_disconnect",
          portal: portalName,
          timestamp: Date.now()
        },
        priority: "medium"
      });
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Send initial connection message
    sendCrossPortalMessage({
      type: "notification",
      source: portalName,
      target: "all",
      payload: {
        type: "portal_connect",
        portal: portalName,
        timestamp: Date.now()
      },
      priority: "medium"
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Send disconnect message
      sendCrossPortalMessage({
        type: "notification",
        source: portalName,
        target: "all",
        payload: {
          type: "portal_disconnect",
          portal: portalName,
          timestamp: Date.now()
        },
        priority: "medium"
      });
    };
  }, [portalName]);

  const handleCrossPortalMessage = (message: CrossPortalMessage) => {
    console.log(`Portal ${portalName} received message:`, message);

    switch (message.type) {
      case "state_update":
        if (message.payload.dataType) {
          switch (message.payload.dataType) {
            case "communities":
              dispatch({ type: "UPDATE_COMMUNITIES", payload: message.payload.data });
              break;
            case "voting":
              dispatch({ type: "UPDATE_VOTING", payload: message.payload.data });
              break;
            case "members":
              dispatch({ type: "UPDATE_MEMBERS", payload: message.payload.data });
              break;
            case "auth":
              dispatch({ type: "SET_AUTH_STATE", payload: message.payload.data });
              break;
          }
        }
        break;

      case "auth_change":
        dispatch({ type: "SET_AUTH_STATE", payload: message.payload });
        break;

      case "data_sync":
        dispatch({ type: "UPDATE_SYNC_STATUS", payload: { lastSync: Date.now() } });
        break;

      case "notification":
        if (message.payload.type === "portal_connect") {
          dispatch({
            type: "UPDATE_CONNECTION_STATUS",
            payload: { portal: message.payload.portal, status: "connected" }
          });
        } else if (message.payload.type === "portal_disconnect") {
          dispatch({
            type: "UPDATE_CONNECTION_STATUS",
            payload: { portal: message.payload.portal, status: "disconnected" }
          });
        } else {
          dispatch({ type: "ADD_NOTIFICATION", payload: message.payload });
        }
        break;

      case "error":
        dispatch({ type: "SET_ERROR", payload: message.payload.message });
        break;

      case "navigation":
        // Handle navigation events if needed
        if (stateManagerRef.current) {
          stateManagerRef.current.emitEvent({
            type: "portal.switch",
            payload: message.payload,
            source: message.source,
            timestamp: Date.now()
          });
        }
        break;
    }

    // Add message to queue for processing
    dispatch({ type: "ADD_MESSAGE", payload: message });

    // Remove message after processing (optional cleanup)
    setTimeout(() => {
      dispatch({ type: "REMOVE_MESSAGE", payload: message.id });
    }, 5000);
  };

  const sendCrossPortalMessage = (message: Omit<CrossPortalMessage, "id" | "timestamp">) => {
    const fullMessage: CrossPortalMessage = {
      ...message,
      id: `${portalName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    try {
      // Use localStorage for cross-tab communication
      const storageKey = `pfm-portal-${fullMessage.target}-${fullMessage.id}`;
      localStorage.setItem(storageKey, JSON.stringify(fullMessage));

      // Clean up storage after a delay
      setTimeout(() => {
        localStorage.removeItem(storageKey);
      }, 10000);

      console.log(`Portal ${portalName} sent message:`, fullMessage);
    } catch (error) {
      console.error("Error sending cross-portal message:", error);
    }
  };

  const contextValue: GlobalContextValue = {
    state,
    dispatch,
    stateManager: stateManagerRef.current!
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global context
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

// Specialized hooks for specific parts of the global state
export const usePortalState = () => {
  const { state } = useGlobalContext();
  return state.portal;
};

export const useAuthState = () => {
  const { state } = useGlobalContext();
  return state.auth;
};

export const useDataState = () => {
  const { state } = useGlobalContext();
  return state.data;
};

export const useUIState = () => {
  const { state } = useGlobalContext();
  return state.ui;
};

export const useSyncState = () => {
  const { state } = useGlobalContext();
  return state.sync;
};

// Action dispatchers
export const usePortalActions = () => {
  const { dispatch } = useGlobalContext();

  return {
    setCurrentPortal: (portal: PortalName) => 
      dispatch({ type: "SET_CURRENT_PORTAL", payload: portal }),
    
    setTransitioning: (transitioning: boolean) => 
      dispatch({ type: "SET_TRANSITIONING", payload: transitioning }),
    
    updateConnectionStatus: (portal: PortalName, status: string) => 
      dispatch({ type: "UPDATE_CONNECTION_STATUS", payload: { portal, status } }),
  };
};

export const useAuthActions = () => {
  const { dispatch } = useGlobalContext();

  return {
    setAuthState: (authState: Partial<GlobalState["auth"]>) => 
      dispatch({ type: "SET_AUTH_STATE", payload: authState }),
    
    updateUser: (userData: Partial<GlobalState["auth"]["user"]>) => 
      dispatch({ type: "UPDATE_USER", payload: userData }),
    
    setSession: (session: GlobalState["auth"]["session"]) => 
      dispatch({ type: "SET_SESSION", payload: session }),
    
    updatePortalAccess: (portal: PortalName, access: boolean) => 
      dispatch({ type: "UPDATE_PORTAL_ACCESS", payload: { portal, access } }),
  };
};

export const useDataActions = () => {
  const { dispatch } = useGlobalContext();

  return {
    updateCommunities: (communities: Parameters<typeof dispatch>[0] extends { type: "UPDATE_COMMUNITIES"; payload: infer P } ? P : never) => 
      dispatch({ type: "UPDATE_COMMUNITIES", payload: communities }),
    
    addCommunity: (community: Parameters<typeof dispatch>[0] extends { type: "ADD_COMMUNITY"; payload: infer P } ? P : never) => 
      dispatch({ type: "ADD_COMMUNITY", payload: community }),
    
    updateCommunity: (id: string, data: Parameters<typeof dispatch>[0] extends { type: "UPDATE_COMMUNITY"; payload: { data: infer P } } ? P : never) => 
      dispatch({ type: "UPDATE_COMMUNITY", payload: { id, data } }),
    
    removeCommunity: (id: string) => 
      dispatch({ type: "REMOVE_COMMUNITY", payload: id }),
    
    addNotification: (notification: Parameters<typeof dispatch>[0] extends { type: "ADD_NOTIFICATION"; payload: infer P } ? P : never) => 
      dispatch({ type: "ADD_NOTIFICATION", payload: notification }),
    
    removeNotification: (id: string) => 
      dispatch({ type: "REMOVE_NOTIFICATION", payload: id }),
    
    markNotificationRead: (id: string) => 
      dispatch({ type: "MARK_NOTIFICATION_READ", payload: id }),
  };
};

export const useUIActions = () => {
  const { dispatch } = useGlobalContext();

  return {
    setLoading: (loading: boolean) => 
      dispatch({ type: "SET_LOADING", payload: loading }),
    
    setError: (error: string | null) => 
      dispatch({ type: "SET_ERROR", payload: error }),
    
    setTheme: (theme: "light" | "dark" | "auto") => 
      dispatch({ type: "SET_THEME", payload: theme }),
    
    setLanguage: (language: string) => 
      dispatch({ type: "SET_LANGUAGE", payload: language }),
  };
};

export default GlobalProvider;
