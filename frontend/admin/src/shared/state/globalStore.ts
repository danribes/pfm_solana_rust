// Global State Management Store
// Task 5.1.2: Cross-Portal Integration & Data Consistency

import { createContext, useContext } from "react";
import { 
  GlobalState, 
  PortalName, 
  CrossPortalMessage, 
  PortalEvent, 
  DataConflict,
  CommunityData,
  VotingData,
  MemberData,
  NotificationData 
} from "../types/portal";

// Initial State
export const initialGlobalState: GlobalState = {
  portal: {
    currentPortal: "member", // Default for member portal
    availablePortals: [
      {
        name: "admin",
        url: "http://localhost:3001",
        title: "Admin Dashboard",
        description: "Administrative interface for community management",
        features: ["community_management", "member_approval", "analytics", "settings"],
        permissions: ["admin", "moderator"]
      },
      {
        name: "member",
        url: "http://localhost:3002", 
        title: "Member Portal",
        description: "Member interface for community participation",
        features: ["community_join", "voting", "proposals", "profile"],
        permissions: ["member", "admin", "moderator"]
      }
    ],
    isTransitioning: false,
    messageQueue: [],
    connectionStatus: {
      admin: "disconnected",
      member: "connected"
    }
  },
  auth: {
    isAuthenticated: false,
    user: null,
    session: null,
    portalAccess: {
      admin: false,
      member: true
    }
  },
  data: {
    communities: {},
    voting: {},
    members: {},
    analytics: {},
    notifications: [],
    lastSync: {}
  },
  ui: {
    theme: "light",
    language: "en",
    notifications: [],
    loading: false,
    error: null
  },
  sync: {
    isActive: false,
    lastSync: 0,
    pendingOperations: [],
    conflicts: []
  }
};

// State Update Actions
export type StateAction = 
  | { type: "SET_CURRENT_PORTAL"; payload: PortalName }
  | { type: "SET_TRANSITIONING"; payload: boolean }
  | { type: "ADD_MESSAGE"; payload: CrossPortalMessage }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "UPDATE_CONNECTION_STATUS"; payload: { portal: PortalName; status: string } }
  | { type: "SET_AUTH_STATE"; payload: Partial<GlobalState["auth"]> }
  | { type: "UPDATE_USER"; payload: Partial<GlobalState["auth"]["user"]> }
  | { type: "SET_SESSION"; payload: GlobalState["auth"]["session"] }
  | { type: "UPDATE_PORTAL_ACCESS"; payload: { portal: PortalName; access: boolean } }
  | { type: "UPDATE_COMMUNITIES"; payload: { [id: string]: CommunityData } }
  | { type: "ADD_COMMUNITY"; payload: CommunityData }
  | { type: "UPDATE_COMMUNITY"; payload: { id: string; data: Partial<CommunityData> } }
  | { type: "REMOVE_COMMUNITY"; payload: string }
  | { type: "UPDATE_VOTING"; payload: { [id: string]: VotingData } }
  | { type: "ADD_VOTING"; payload: VotingData }
  | { type: "UPDATE_VOTING_ITEM"; payload: { id: string; data: Partial<VotingData> } }
  | { type: "UPDATE_MEMBERS"; payload: { [id: string]: MemberData } }
  | { type: "ADD_MEMBER"; payload: MemberData }
  | { type: "UPDATE_MEMBER"; payload: { id: string; data: Partial<MemberData> } }
  | { type: "ADD_NOTIFICATION"; payload: NotificationData }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "UPDATE_SYNC_STATUS"; payload: Partial<GlobalState["sync"]> }
  | { type: "ADD_CONFLICT"; payload: DataConflict }
  | { type: "RESOLVE_CONFLICT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_THEME"; payload: "light" | "dark" | "auto" }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "RESET_STATE" };

// State Reducer
export function globalStateReducer(state: GlobalState, action: StateAction): GlobalState {
  switch (action.type) {
    case "SET_CURRENT_PORTAL":
      return {
        ...state,
        portal: {
          ...state.portal,
          currentPortal: action.payload,
          lastTransition: {
            from: state.portal.currentPortal,
            to: action.payload,
            timestamp: Date.now(),
            reason: "user_switch"
          }
        }
      };

    case "SET_TRANSITIONING":
      return {
        ...state,
        portal: {
          ...state.portal,
          isTransitioning: action.payload
        }
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        portal: {
          ...state.portal,
          messageQueue: [...state.portal.messageQueue, action.payload]
        }
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        portal: {
          ...state.portal,
          messageQueue: state.portal.messageQueue.filter(msg => msg.id !== action.payload)
        }
      };

    case "UPDATE_CONNECTION_STATUS":
      return {
        ...state,
        portal: {
          ...state.portal,
          connectionStatus: {
            ...state.portal.connectionStatus,
            [action.payload.portal]: action.payload.status as any
          }
        }
      };

    case "SET_AUTH_STATE":
      return {
        ...state,
        auth: {
          ...state.auth,
          ...action.payload
        }
      };

    case "UPDATE_USER":
      return {
        ...state,
        auth: {
          ...state.auth,
          user: state.auth.user ? {
            ...state.auth.user,
            ...action.payload
          } : null
        }
      };

    case "SET_SESSION":
      return {
        ...state,
        auth: {
          ...state.auth,
          session: action.payload
        }
      };

    case "UPDATE_PORTAL_ACCESS":
      return {
        ...state,
        auth: {
          ...state.auth,
          portalAccess: {
            ...state.auth.portalAccess,
            [action.payload.portal]: action.payload.access
          }
        }
      };

    case "UPDATE_COMMUNITIES":
      return {
        ...state,
        data: {
          ...state.data,
          communities: {
            ...state.data.communities,
            ...action.payload
          },
          lastSync: {
            ...state.data.lastSync,
            communities: Date.now()
          }
        }
      };

    case "ADD_COMMUNITY":
      return {
        ...state,
        data: {
          ...state.data,
          communities: {
            ...state.data.communities,
            [action.payload.id]: action.payload
          }
        }
      };

    case "UPDATE_COMMUNITY":
      return {
        ...state,
        data: {
          ...state.data,
          communities: {
            ...state.data.communities,
            [action.payload.id]: {
              ...state.data.communities[action.payload.id],
              ...action.payload.data,
              updatedAt: Date.now()
            }
          }
        }
      };

    case "REMOVE_COMMUNITY":
      const { [action.payload]: removed, ...remainingCommunities } = state.data.communities;
      return {
        ...state,
        data: {
          ...state.data,
          communities: remainingCommunities
        }
      };

    case "UPDATE_VOTING":
      return {
        ...state,
        data: {
          ...state.data,
          voting: {
            ...state.data.voting,
            ...action.payload
          },
          lastSync: {
            ...state.data.lastSync,
            voting: Date.now()
          }
        }
      };

    case "ADD_VOTING":
      return {
        ...state,
        data: {
          ...state.data,
          voting: {
            ...state.data.voting,
            [action.payload.id]: action.payload
          }
        }
      };

    case "UPDATE_VOTING_ITEM":
      return {
        ...state,
        data: {
          ...state.data,
          voting: {
            ...state.data.voting,
            [action.payload.id]: {
              ...state.data.voting[action.payload.id],
              ...action.payload.data
            }
          }
        }
      };

    case "UPDATE_MEMBERS":
      return {
        ...state,
        data: {
          ...state.data,
          members: {
            ...state.data.members,
            ...action.payload
          },
          lastSync: {
            ...state.data.lastSync,
            members: Date.now()
          }
        }
      };

    case "ADD_MEMBER":
      return {
        ...state,
        data: {
          ...state.data,
          members: {
            ...state.data.members,
            [action.payload.id]: action.payload
          }
        }
      };

    case "UPDATE_MEMBER":
      return {
        ...state,
        data: {
          ...state.data,
          members: {
            ...state.data.members,
            [action.payload.id]: {
              ...state.data.members[action.payload.id],
              ...action.payload.data
            }
          }
        }
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        data: {
          ...state.data,
          notifications: [action.payload, ...state.data.notifications]
        },
        ui: {
          ...state.ui,
          notifications: [action.payload, ...state.ui.notifications]
        }
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        data: {
          ...state.data,
          notifications: state.data.notifications.filter(n => n.id !== action.payload)
        },
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        data: {
          ...state.data,
          notifications: state.data.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          )
        },
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          )
        }
      };

    case "UPDATE_SYNC_STATUS":
      return {
        ...state,
        sync: {
          ...state.sync,
          ...action.payload
        }
      };

    case "ADD_CONFLICT":
      return {
        ...state,
        sync: {
          ...state.sync,
          conflicts: [...state.sync.conflicts, action.payload]
        }
      };

    case "RESOLVE_CONFLICT":
      return {
        ...state,
        sync: {
          ...state.sync,
          conflicts: state.sync.conflicts.filter(c => c.field !== action.payload)
        }
      };

    case "SET_LOADING":
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };

    case "SET_ERROR":
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload
        }
      };

    case "SET_THEME":
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };

    case "SET_LANGUAGE":
      return {
        ...state,
        ui: {
          ...state.ui,
          language: action.payload
        }
      };

    case "RESET_STATE":
      return initialGlobalState;

    default:
      return state;
  }
}

// State Management Class
export class GlobalStateManager {
  private state: GlobalState;
  private listeners: Set<(state: GlobalState) => void> = new Set();
  private eventListeners: Map<string, Set<(event: PortalEvent) => void>> = new Map();

  constructor(initialState?: Partial<GlobalState>) {
    this.state = {
      ...initialGlobalState,
      ...initialState
    };
  }

  getState(): GlobalState {
    return this.state;
  }

  dispatch(action: StateAction): void {
    const previousState = this.state;
    this.state = globalStateReducer(this.state, action);
    
    // Notify listeners if state changed
    if (previousState !== this.state) {
      this.listeners.forEach(listener => listener(this.state));
    }
  }

  subscribe(listener: (state: GlobalState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  addEventListener(type: string, handler: (event: PortalEvent) => void): () => void {
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

  emitEvent(event: PortalEvent): void {
    const handlers = this.eventListeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  // Utility methods for common operations
  getCurrentPortal(): PortalName {
    return this.state.portal.currentPortal;
  }

  isAuthenticated(): boolean {
    return this.state.auth.isAuthenticated;
  }

  getUser() {
    return this.state.auth.user;
  }

  hasPortalAccess(portal: PortalName): boolean {
    return this.state.auth.portalAccess[portal];
  }

  getConnectionStatus(portal: PortalName) {
    return this.state.portal.connectionStatus[portal];
  }

  getCommunities() {
    return Object.values(this.state.data.communities);
  }

  getVotingItems() {
    return Object.values(this.state.data.voting);
  }

  getNotifications() {
    return this.state.data.notifications;
  }

  getUnreadNotifications() {
    return this.state.data.notifications.filter(n => !n.read);
  }

  getConflicts() {
    return this.state.sync.conflicts;
  }

  isSyncing(): boolean {
    return this.state.sync.isActive;
  }
}

// Create singleton instance
export const globalStateManager = new GlobalStateManager();

export default globalStateManager;
