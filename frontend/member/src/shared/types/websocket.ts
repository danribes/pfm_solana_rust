// WebSocket Infrastructure Types
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

export type WebSocketReadyState = 
  | "CONNECTING" 
  | "OPEN" 
  | "CLOSING" 
  | "CLOSED";

export type ConnectionStatus = 
  | "disconnected"
  | "connecting" 
  | "connected"
  | "reconnecting"
  | "failed"
  | "closed";

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoffFactor: number;
    maxDelay: number;
  };
  heartbeat: {
    enabled: boolean;
    interval: number;
    timeout: number;
    message: string;
  };
  authentication: {
    enabled: boolean;
    token?: string;
    refreshToken?: string;
  };
  compression: boolean;
  binaryType: "blob" | "arraybuffer";
}

export interface WebSocketMessage {
  id: string;
  type: string;
  event: string;
  data: any;
  timestamp: number;
  source?: string;
  target?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  persistent?: boolean;
  ttl?: number;
}

export interface WebSocketEvent {
  type: string;
  event: string;
  data: any;
  timestamp: number;
  source?: string;
}

export type WebSocketEventType = 
  | "connection.open"
  | "connection.close" 
  | "connection.error"
  | "connection.reconnect"
  | "message.received"
  | "message.sent"
  | "heartbeat.ping"
  | "heartbeat.pong"
  | "auth.success"
  | "auth.failure"
  | "subscription.added"
  | "subscription.removed"
  | "data.update"
  | "system.status";

export interface EventSubscription {
  id: string;
  event: string;
  handler: (data: any) => void;
  filter?: (data: any) => boolean;
  transform?: (data: any) => any;
  once?: boolean;
  createdAt: number;
}

export interface WebSocketStats {
  connectionCount: number;
  messagesReceived: number;
  messagesSent: number;
  lastMessage: number;
  uptime: number;
  reconnectCount: number;
  errorCount: number;
  averageLatency: number;
  bytesReceived: number;
  bytesSent: number;
}

export interface RealtimeData {
  // Voting Updates
  voting: {
    results: VotingResults;
    newVotes: VoteUpdate[];
    statusChanges: VotingStatusUpdate[];
  };
  
  // Community Updates  
  community: {
    memberJoined: MemberJoinedUpdate;
    memberLeft: MemberLeftUpdate;
    activityFeed: ActivityUpdate[];
    treasuryUpdates: TreasuryUpdate[];
  };
  
  // System Updates
  system: {
    status: SystemStatus;
    announcements: SystemAnnouncement[];
    maintenance: MaintenanceUpdate[];
  };
  
  // Notifications
  notifications: {
    personal: PersonalNotification[];
    broadcast: BroadcastNotification[];
    urgent: UrgentNotification[];
  };
}

export interface VotingResults {
  proposalId: string;
  totalVotes: number;
  totalWeight: number;
  options: {
    [optionId: string]: {
      votes: number;
      weight: number;
      percentage: number;
    };
  };
  isComplete: boolean;
  winner?: string;
  updatedAt: number;
}

export interface VoteUpdate {
  proposalId: string;
  voterId: string;
  option: string;
  weight: number;
  timestamp: number;
}

export interface VotingStatusUpdate {
  proposalId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: number;
  reason?: string;
}

export interface MemberJoinedUpdate {
  communityId: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  joinedAt: number;
}

export interface MemberLeftUpdate {
  communityId: string;
  memberId: string;
  memberName: string;
  leftAt: number;
  reason?: string;
}

export interface ActivityUpdate {
  id: string;
  communityId: string;
  type: "proposal" | "vote" | "discussion" | "announcement";
  actor: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  target?: {
    id: string;
    name: string;
    type: string;
  };
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TreasuryUpdate {
  communityId: string;
  type: "deposit" | "withdrawal" | "transfer" | "staking";
  amount: number;
  currency: string;
  balance: number;
  transaction: {
    hash: string;
    blockHeight: number;
    confirmations: number;
  };
  timestamp: number;
}

export interface SystemStatus {
  blockchain: {
    connected: boolean;
    blockHeight: number;
    validators: number;
    tps: number;
  };
  api: {
    status: "healthy" | "degraded" | "down";
    latency: number;
    errorRate: number;
  };
  database: {
    connected: boolean;
    connections: number;
    queries: number;
  };
  cache: {
    connected: boolean;
    hitRate: number;
    memoryUsage: number;
  };
}

export interface SystemAnnouncement {
  id: string;
  type: "info" | "warning" | "error" | "maintenance";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  targetAudience: "all" | "admin" | "members";
  expiresAt?: number;
  createdAt: number;
}

export interface MaintenanceUpdate {
  id: string;
  type: "scheduled" | "emergency" | "completed";
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  affectedServices: string[];
  status: "planned" | "in-progress" | "completed" | "delayed";
}

export interface PersonalNotification {
  id: string;
  userId: string;
  type: "mention" | "reply" | "vote" | "proposal" | "system";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export interface BroadcastNotification {
  id: string;
  communityId?: string;
  type: "announcement" | "update" | "event";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  targetRoles: string[];
  createdAt: number;
  expiresAt?: number;
}

export interface UrgentNotification {
  id: string;
  type: "security" | "system" | "emergency";
  title: string;
  message: string;
  severity: "high" | "critical";
  requiresAction: boolean;
  actionUrl?: string;
  createdAt: number;
}

export interface WebSocketConnectionInfo {
  id: string;
  url: string;
  readyState: WebSocketReadyState;
  protocol: string;
  extensions: string;
  bufferedAmount: number;
  binaryType: "blob" | "arraybuffer";
}

export interface ReconnectionState {
  attempt: number;
  maxAttempts: number;
  nextDelay: number;
  backoffFactor: number;
  lastAttempt: number;
  totalAttempts: number;
}

export interface WebSocketError {
  code: number;
  reason: string;
  wasClean: boolean;
  timestamp: number;
  context?: string;
}

export interface HeartbeatState {
  lastPing: number;
  lastPong: number;
  latency: number;
  missedPings: number;
  isAlive: boolean;
}

export interface MessageQueue {
  outgoing: WebSocketMessage[];
  incoming: WebSocketMessage[];
  failed: WebSocketMessage[];
  processed: string[];
}

export interface WebSocketHookResult {
  // Connection State
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  readyState: WebSocketReadyState;
  lastError: WebSocketError | null;
  
  // Connection Management
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Messaging
  send: (message: Partial<WebSocketMessage>) => Promise<boolean>;
  sendRaw: (data: string | ArrayBuffer | Blob) => Promise<boolean>;
  
  // Event Management
  subscribe: (event: string, handler: (data: any) => void, options?: Partial<EventSubscription>) => string;
  unsubscribe: (subscriptionId: string) => boolean;
  
  // Utilities
  getStats: () => WebSocketStats;
  getConnectionInfo: () => WebSocketConnectionInfo | null;
  clearQueue: () => void;
  
  // Real-time Data
  realtimeData: RealtimeData;
  lastUpdate: number;
}

export interface WebSocketContextValue {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  stats: WebSocketStats;
  realtimeData: RealtimeData;
  
  // Global Methods
  broadcast: (message: Partial<WebSocketMessage>) => Promise<boolean>;
  subscribeGlobal: (event: string, handler: (data: any) => void) => string;
  unsubscribeGlobal: (subscriptionId: string) => boolean;
  
  // Connection Management
  reconnectAll: () => Promise<void>;
  disconnectAll: () => void;
}

export default {};
