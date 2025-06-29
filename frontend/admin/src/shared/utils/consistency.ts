// Data Consistency Utilities
// Task 5.1.2: Cross-Portal Integration & Data Consistency

import {
  DataConflict,
  ConsistencyCheck,
  DataConsistencyConfig,
  CommunityData,
  VotingData,
  MemberData,
  AnalyticsData,
  PortalName
} from "../types/portal";

export class DataConsistencyManager {
  private config: DataConsistencyConfig;
  private conflictResolvers: Map<string, (local: any, remote: any) => any> = new Map();
  private validators: Map<string, (data: any) => boolean> = new Map();
  private checksumCache: Map<string, string> = new Map();

  constructor(config?: Partial<DataConsistencyConfig>) {
    this.config = {
      autoSync: true,
      syncInterval: 30000,
      conflictResolution: "last_write_wins",
      retryAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffDelay: 30000,
      ...config
    };

    this.initializeDefaultResolvers();
    this.initializeDefaultValidators();
  }

  /**
   * Initialize default conflict resolvers
   */
  private initializeDefaultResolvers(): void {
    // Community data resolver
    this.registerConflictResolver("communities", (local: CommunityData, remote: CommunityData) => {
      if (local.updatedAt > remote.updatedAt) {
        return local;
      } else if (remote.updatedAt > local.updatedAt) {
        return remote;
      } else {
        // Same timestamp - merge with priority to remote
        return {
          ...local,
          ...remote,
          memberCount: Math.max(local.memberCount, remote.memberCount),
          treasuryBalance: remote.treasuryBalance, // Financial data from remote
          updatedAt: Math.max(local.updatedAt, remote.updatedAt)
        };
      }
    });

    // Voting data resolver
    this.registerConflictResolver("voting", (local: VotingData, remote: VotingData) => {
      // For voting, remote data takes precedence (blockchain is source of truth)
      if (local.status === "completed" && remote.status === "completed") {
        return remote; // Use blockchain results
      }
      
      if (local.status !== remote.status) {
        return remote; // Remote status is authoritative
      }

      return {
        ...local,
        ...remote,
        options: this.mergeVotingOptions(local.options, remote.options)
      };
    });

    // Member data resolver
    this.registerConflictResolver("members", (local: MemberData, remote: MemberData) => {
      return {
        ...local,
        ...remote,
        lastActive: Math.max(local.lastActive, remote.lastActive),
        reputation: {
          ...local.reputation,
          ...remote.reputation,
          score: Math.max(local.reputation.score, remote.reputation.score)
        }
      };
    });
  }

  /**
   * Initialize default data validators
   */
  private initializeDefaultValidators(): void {
    // Community data validator
    this.registerValidator("communities", (data: CommunityData) => {
      return !!(
        data.id &&
        data.name &&
        data.description &&
        typeof data.memberCount === "number" &&
        typeof data.treasuryBalance === "number" &&
        data.governance &&
        data.status &&
        data.createdAt &&
        data.updatedAt
      );
    });

    // Voting data validator
    this.registerValidator("voting", (data: VotingData) => {
      return !!(
        data.id &&
        data.communityId &&
        data.title &&
        data.description &&
        data.type &&
        data.status &&
        data.startTime &&
        data.endTime &&
        Array.isArray(data.options) &&
        data.options.length > 0
      );
    });
  }

  /**
   * Check data consistency between two datasets
   */
  public checkConsistency<T>(
    dataType: string,
    localData: { [id: string]: T },
    remoteData: { [id: string]: T },
    source: PortalName
  ): ConsistencyCheck {
    const conflicts: DataConflict[] = [];
    const localChecksum = this.generateChecksum(localData);
    const remoteChecksum = this.generateChecksum(remoteData);

    if (localChecksum !== remoteChecksum) {
      // Find specific conflicts
      conflicts.push(...this.findConflicts(dataType, localData, remoteData));
    }

    return {
      dataType,
      checksum: remoteChecksum,
      lastModified: Date.now(),
      source,
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
  }

  /**
   * Find conflicts between local and remote data
   */
  private findConflicts<T>(
    dataType: string,
    localData: { [id: string]: T },
    remoteData: { [id: string]: T }
  ): DataConflict[] {
    const conflicts: DataConflict[] = [];
    const allIds = new Set([...Object.keys(localData), ...Object.keys(remoteData)]);

    for (const id of allIds) {
      const local = localData[id];
      const remote = remoteData[id];

      if (!local && remote) {
        // Item exists only in remote
        conflicts.push({
          field: \`\${dataType}.\${id}\`,
          localValue: null,
          remoteValue: remote,
          timestamp: Date.now(),
          resolution: "pending"
        });
      } else if (local && !remote) {
        // Item exists only in local
        conflicts.push({
          field: \`\${dataType}.\${id}\`,
          localValue: local,
          remoteValue: null,
          timestamp: Date.now(),
          resolution: "pending"
        });
      } else if (local && remote) {
        // Item exists in both - check for differences
        const itemConflicts = this.compareObjects(local, remote, \`\${dataType}.\${id}\`);
        conflicts.push(...itemConflicts);
      }
    }

    return conflicts;
  }

  /**
   * Resolve a data conflict
   */
  public resolveConflict<T>(
    dataType: string,
    conflict: DataConflict,
    resolution?: DataConflict["resolution"]
  ): T | null {
    const resolverKey = dataType.split(".")[0]; // Get base type
    const resolver = this.conflictResolvers.get(resolverKey);

    if (resolution) {
      switch (resolution) {
        case "local":
          return conflict.localValue;
        case "remote":
          return conflict.remoteValue;
        case "merge":
          if (resolver) {
            return resolver(conflict.localValue, conflict.remoteValue);
          }
          return conflict.remoteValue; // Default to remote
        default:
          return null;
      }
    }

    // Use configured resolution strategy
    switch (this.config.conflictResolution) {
      case "last_write_wins":
        return this.resolveLastWriteWins(conflict);
      case "merge":
        if (resolver) {
          return resolver(conflict.localValue, conflict.remoteValue);
        }
        return conflict.remoteValue;
      default:
        return conflict.remoteValue;
    }
  }

  /**
   * Resolve conflict using last write wins strategy
   */
  private resolveLastWriteWins(conflict: DataConflict): any {
    const localTimestamp = this.extractTimestamp(conflict.localValue);
    const remoteTimestamp = this.extractTimestamp(conflict.remoteValue);

    if (localTimestamp && remoteTimestamp) {
      return localTimestamp > remoteTimestamp ? conflict.localValue : conflict.remoteValue;
    }

    // Fallback to remote if timestamps unavailable
    return conflict.remoteValue;
  }

  /**
   * Extract timestamp from data object
   */
  private extractTimestamp(data: any): number | null {
    if (!data || typeof data !== "object") return null;
    return data.updatedAt || data.lastModified || data.timestamp || data.createdAt || null;
  }

  /**
   * Merge voting options during conflict resolution
   */
  private mergeVotingOptions(localOptions: any[], remoteOptions: any[]): any[] {
    const merged = new Map();

    // Add all local options
    localOptions.forEach(option => merged.set(option.id, option));

    // Update with remote options (remote takes precedence for vote counts)
    remoteOptions.forEach(option => {
      if (merged.has(option.id)) {
        const local = merged.get(option.id);
        merged.set(option.id, {
          ...local,
          ...option,
          voteCount: Math.max(local.voteCount || 0, option.voteCount || 0),
          voteWeight: Math.max(local.voteWeight || 0, option.voteWeight || 0)
        });
      } else {
        merged.set(option.id, option);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Compare two objects and find differences
   */
  private compareObjects(local: any, remote: any, fieldPrefix: string): DataConflict[] {
    const conflicts: DataConflict[] = [];

    if (typeof local !== typeof remote) {
      conflicts.push({
        field: fieldPrefix,
        localValue: local,
        remoteValue: remote,
        timestamp: Date.now(),
        resolution: "pending"
      });
      return conflicts;
    }

    if (typeof local === "object" && local !== null && remote !== null) {
      const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

      for (const key of allKeys) {
        const localValue = local[key];
        const remoteValue = remote[key];

        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          conflicts.push({
            field: \`\${fieldPrefix}.\${key}\`,
            localValue,
            remoteValue,
            timestamp: Date.now(),
            resolution: "pending"
          });
        }
      }
    } else if (local !== remote) {
      conflicts.push({
        field: fieldPrefix,
        localValue: local,
        remoteValue: remote,
        timestamp: Date.now(),
        resolution: "pending"
      });
    }

    return conflicts;
  }

  /**
   * Validate data using registered validators
   */
  public validateData(dataType: string, data: any): boolean {
    const validator = this.validators.get(dataType);
    if (!validator) {
      console.warn(\`No validator found for data type: \${dataType}\`);
      return true; // Assume valid if no validator
    }

    try {
      return validator(data);
    } catch (error) {
      console.error(\`Validation error for \${dataType}:\`, error);
      return false;
    }
  }

  /**
   * Generate checksum for data
   */
  public generateChecksum(data: any): string {
    try {
      const serialized = JSON.stringify(data, Object.keys(data).sort());
      return this.simpleHash(serialized);
    } catch (error) {
      console.error("Error generating checksum:", error);
      return "";
    }
  }

  /**
   * Simple hash function for checksums
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Register custom conflict resolver
   */
  public registerConflictResolver(
    dataType: string,
    resolver: (local: any, remote: any) => any
  ): void {
    this.conflictResolvers.set(dataType, resolver);
  }

  /**
   * Register custom data validator
   */
  public registerValidator(dataType: string, validator: (data: any) => boolean): void {
    this.validators.set(dataType, validator);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<DataConsistencyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): DataConsistencyConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.conflictResolvers.clear();
    this.validators.clear();
    this.checksumCache.clear();
  }
}

// Create default instance
export const dataConsistencyManager = new DataConsistencyManager();

export default DataConsistencyManager;
