// Portal Integration Types
// Task 5.1.2: Cross-Portal Integration & Data Consistency

export interface PortalType {
  ADMIN: "admin";
  MEMBER: "member";
}

export type PortalName = "admin" | "member";

export interface PortalConfig {
  name: PortalName;
  url: string;
  title: string;
  description: string;
  features: string[];
  permissions: string[];
}

export interface CrossPortalMessage {
  id: string;
  type: "state_update" | "navigation" | "auth_change" | "data_sync" | "error" | "notification";
  source: PortalName;
  target: PortalName | "all";
  payload: any;
  timestamp: number;
  priority: "low" | "medium" | "high" | "urgent";
  requiresAck?: boolean;
}

export interface PortalState {
  currentPortal: PortalName;
  availablePortals: PortalConfig[];
  isTransitioning: boolean;
  lastTransition?: {
    from: PortalName;
    to: PortalName;
    timestamp: number;
    reason: string;
  };
  messageQueue: CrossPortalMessage[];
  connectionStatus: {
    [K in PortalName]: "connected" | "disconnected" | "connecting" | "error";
  };
}

export interface SharedAuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: "admin" | "member" | "guest";
    permissions: string[];
    walletAddress?: string;
    profile: {
      name: string;
      avatar?: string;
      preferences: Record<string, any>;
    };
  } | null;
  session: {
    token: string;
    refreshToken: string;
    expiresAt: number;
    lastActivity: number;
  } | null;
  portalAccess: {
    [K in PortalName]: boolean;
  };
}

export interface SharedDataState {
  communities: {
    [id: string]: CommunityData;
  };
  voting: {
    [id: string]: VotingData;
  };
  members: {
    [id: string]: MemberData;
  };
  analytics: {
    [key: string]: AnalyticsData;
  };
  notifications: NotificationData[];
  lastSync: {
    [dataType: string]: number;
  };
}

export interface CommunityData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  treasuryBalance: number;
  governance: "democratic" | "delegated" | "hybrid";
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
  settings: Record<string, any>;
  metadata: Record<string, any>;
}

export interface VotingData {
  id: string;
  communityId: string;
  title: string;
  description: string;
  type: "simple" | "weighted" | "quadratic";
  status: "draft" | "active" | "completed" | "cancelled";
  startTime: number;
  endTime: number;
  options: VotingOption[];
  results?: VotingResults;
  metadata: Record<string, any>;
}

export interface VotingOption {
  id: string;
  text: string;
  description?: string;
  voteCount: number;
  voteWeight: number;
}

export interface VotingResults {
  totalVotes: number;
  totalWeight: number;
  winner?: string;
  results: {
    [optionId: string]: {
      votes: number;
      weight: number;
      percentage: number;
    };
  };
  finalizedAt: number;
}

export interface MemberData {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  walletAddress?: string;
  communities: string[];
  joinedAt: number;
  lastActive: number;
  profile: {
    avatar?: string;
    bio?: string;
    preferences: Record<string, any>;
  };
  reputation: {
    score: number;
    level: string;
    achievements: string[];
  };
}

export interface AnalyticsData {
  id: string;
  type: "community" | "voting" | "member" | "financial";
  timeframe: "hour" | "day" | "week" | "month" | "year";
  data: Record<string, number | string>;
  generatedAt: number;
}

export interface NotificationData {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  source: PortalName;
  target?: PortalName | "all";
  priority: "low" | "medium" | "high";
  read: boolean;
  createdAt: number;
  expiresAt?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: "navigate" | "api_call" | "dismiss" | "external";
  params: Record<string, any>;
}

export interface DataConsistencyConfig {
  autoSync: boolean;
  syncInterval: number;
  conflictResolution: "last_write_wins" | "merge" | "manual" | "custom";
  retryAttempts: number;
  backoffMultiplier: number;
  maxBackoffDelay: number;
}

export interface ConsistencyCheck {
  dataType: string;
  checksum: string;
  lastModified: number;
  source: PortalName;
  conflicts?: DataConflict[];
}

export interface DataConflict {
  field: string;
  localValue: any;
  remoteValue: any;
  timestamp: number;
  resolution?: "local" | "remote" | "merge" | "pending";
}

export interface PortalSyncEvent {
  id: string;
  type: "connect" | "disconnect" | "state_change" | "data_update" | "error";
  portal: PortalName;
  timestamp: number;
  data?: any;
  error?: string;
}

export interface GlobalState {
  portal: PortalState;
  auth: SharedAuthState;
  data: SharedDataState;
  ui: {
    theme: "light" | "dark" | "auto";
    language: string;
    notifications: NotificationData[];
    loading: boolean;
    error: string | null;
  };
  sync: {
    isActive: boolean;
    lastSync: number;
    pendingOperations: string[];
    conflicts: DataConflict[];
  };
}

// Event Types for Cross-Portal Communication
export type PortalEventType = 
  | "portal.switch"
  | "portal.connect"
  | "portal.disconnect"
  | "auth.login"
  | "auth.logout" 
  | "auth.refresh"
  | "data.update"
  | "data.sync"
  | "data.conflict"
  | "notification.new"
  | "notification.read"
  | "error.occurred"
  | "ui.theme_change"
  | "ui.language_change";

export interface PortalEvent {
  type: PortalEventType;
  payload: any;
  source: PortalName;
  timestamp: number;
}

// Hook and Context Types
export interface PortalSyncHookResult {
  // State
  currentPortal: PortalName;
  isConnected: boolean;
  connectionStatus: PortalState["connectionStatus"];
  
  // Actions
  switchPortal: (portal: PortalName, reason?: string) => Promise<void>;
  sendMessage: (message: Omit<CrossPortalMessage, "id" | "timestamp">) => void;
  syncData: (dataType?: string) => Promise<void>;
  
  // Event Management
  addEventListener: (type: PortalEventType, handler: (event: PortalEvent) => void) => () => void;
  removeEventListener: (type: PortalEventType, handler: (event: PortalEvent) => void) => void;
  
  // Utilities
  isPortalAvailable: (portal: PortalName) => boolean;
  getPortalUrl: (portal: PortalName) => string;
  getLastMessage: (type?: CrossPortalMessage["type"]) => CrossPortalMessage | null;
}

export interface ConsistencyHookResult {
  // State
  conflicts: DataConflict[];
  syncStatus: "idle" | "syncing" | "error";
  lastSync: number;
  
  // Actions
  checkConsistency: (dataType?: string) => Promise<ConsistencyCheck[]>;
  resolveConflict: (conflict: DataConflict, resolution: DataConflict["resolution"]) => Promise<void>;
  forcSync: (dataType: string) => Promise<void>;
  
  // Configuration
  updateSyncConfig: (config: Partial<DataConsistencyConfig>) => void;
  getSyncConfig: () => DataConsistencyConfig;
}

export default {};
