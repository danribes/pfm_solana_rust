// Portal Synchronization Service
// Task 5.1.2: Cross-Portal Integration & Data Consistency

import { 
  PortalName, 
  CrossPortalMessage, 
  PortalEvent, 
  GlobalState, 
  DataConsistencyConfig,
  ConsistencyCheck,
  DataConflict,
  CommunityData,
  VotingData,
  MemberData
} from "../types/portal";

export class PortalSyncService {
  private portalName: PortalName;
  private config: DataConsistencyConfig;
  private messageHandlers: Map<string, (message: CrossPortalMessage) => void> = new Map();
  private eventBus: EventTarget = new EventTarget();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private connectionCheckInterval?: NodeJS.Timeout;
  private lastHeartbeat: Map<PortalName, number> = new Map();

  constructor(portalName: PortalName, config?: Partial<DataConsistencyConfig>) {
    this.portalName = portalName;
    this.config = {
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      conflictResolution: "last_write_wins",
      retryAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffDelay: 30000,
      ...config
    };

    this.initializeService();
  }

  /**
   * Initialize the portal synchronization service
   */
  private initializeService(): void {
    this.setupStorageListener();
    this.setupHeartbeat();
    this.setupConnectionMonitoring();
    
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    // Send initial presence message
    this.sendPresenceMessage("online");
  }

  /**
   * Setup storage event listener for cross-portal communication
   */
  private setupStorageListener(): void {
    const handleStorageEvent = (event: StorageEvent) => {
      if (!event.key?.startsWith("pfm-portal-")) return;

      try {
        const message: CrossPortalMessage = JSON.parse(event.newValue || "{}");
        if (this.shouldProcessMessage(message)) {
          this.processMessage(message);
        }
      } catch (error) {
        console.error("Error processing storage message:", error);
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    
    // Cleanup
    const cleanup = () => {
      window.removeEventListener("storage", handleStorageEvent);
    };

    // Store cleanup function for later use
    (this as any)._storageCleanup = cleanup;
  }

  /**
   * Setup heartbeat system for portal presence
   */
  private setupHeartbeat(): void {
    const sendHeartbeat = () => {
      this.sendMessage({
        type: "notification",
        source: this.portalName,
        target: "all",
        payload: {
          type: "heartbeat",
          portal: this.portalName,
          timestamp: Date.now()
        },
        priority: "low"
      });
    };

    // Send heartbeat every 10 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);
    
    // Store for cleanup
    (this as any)._heartbeatInterval = heartbeatInterval;
  }

  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    this.connectionCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeoutThreshold = 30000; // 30 seconds

      for (const [portal, lastSeen] of this.lastHeartbeat.entries()) {
        if (now - lastSeen > timeoutThreshold) {
          this.emitEvent({
            type: "portal.disconnect",
            payload: { portal },
            source: this.portalName,
            timestamp: now
          });
          
          this.lastHeartbeat.delete(portal);
        }
      }
    }, 15000); // Check every 15 seconds
  }

  /**
   * Check if a message should be processed by this portal
   */
  private shouldProcessMessage(message: CrossPortalMessage): boolean {
    if (message.source === this.portalName) {
      return false; // Dont
