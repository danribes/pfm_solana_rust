// WebSocket Event Utilities
// Task 5.2.1: WebSocket Infrastructure for Real-Time Updates

import {
  WebSocketMessage,
  WebSocketEvent,
  EventSubscription,
  RealtimeData,
  VotingResults,
  ActivityUpdate,
  PersonalNotification,
  SystemStatus,
} from "../types/websocket";
import { WEBSOCKET_EVENTS } from "../config/websocket";

/**
 * Event utility functions for WebSocket infrastructure
 */

// Event Creators
export const createWebSocketMessage = (
  type: string,
  event: string,
  data: any,
  options?: Partial<WebSocketMessage>
): WebSocketMessage => ({
  id: options?.id || generateEventId(),
  type,
  event,
  data,
  timestamp: Date.now(),
  source: options?.source,
  target: options?.target,
  priority: options?.priority || "medium",
  persistent: options?.persistent || false,
  ttl: options?.ttl,
});

export const createWebSocketEvent = (
  type: string,
  event: string,
  data: any,
  source?: string
): WebSocketEvent => ({
  type,
  event,
  data,
  timestamp: Date.now(),
  source,
});

// Event Type Guards
export const isVotingEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("voting.");
};

export const isCommunityEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("community.");
};

export const isNotificationEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("notifications.");
};

export const isSystemEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("system.");
};

export const isConnectionEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("connection.");
};

export const isHeartbeatEvent = (event: WebSocketEvent): boolean => {
  return event.event.startsWith("heartbeat.");
};

// Event Filters
export const createEventFilter = (patterns: string[]): ((event: WebSocketEvent) => boolean) => {
  return (event: WebSocketEvent) => {
    return patterns.some(pattern => {
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        return regex.test(event.event);
      }
      return event.event === pattern;
    });
  };
};

export const createPriorityFilter = (minPriority: "low" | "medium" | "high" | "urgent") => {
  const priorities = { low: 0, medium: 1, high: 2, urgent: 3 };
  const minLevel = priorities[minPriority];
  
  return (event: WebSocketEvent) => {
    const message = event as any as WebSocketMessage;
    if (!message.priority) return true;
    return priorities[message.priority] >= minLevel;
  };
};

export const createSourceFilter = (allowedSources: string[]) => {
  return (event: WebSocketEvent) => {
    if (!event.source) return true;
    return allowedSources.includes(event.source);
  };
};

export const createTimeFilter = (maxAge: number) => {
  return (event: WebSocketEvent) => {
    return Date.now() - event.timestamp <= maxAge;
  };
};

// Event Transformers
export const createEventTransformer = (
  transformers: Record<string, (data: any) => any>
) => {
  return (event: WebSocketEvent) => {
    const transformer = transformers[event.event];
    if (transformer) {
      return {
        ...event,
        data: transformer(event.data),
      };
    }
    return event;
  };
};

export const createDataExtractor = (path: string) => {
  return (event: WebSocketEvent) => {
    const keys = path.split(".");
    let result = event.data;
    
    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return undefined;
      }
    }
    
    return result;
  };
};

// Event Aggregators
export class EventAggregator {
  private events: WebSocketEvent[] = [];
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  add(event: WebSocketEvent): void {
    this.events.push(event);
    
    // Maintain max size
    if (this.events.length > this.maxSize) {
      this.events = this.events.slice(-this.maxSize);
    }
  }
  
  getEvents(filter?: (event: WebSocketEvent) => boolean): WebSocketEvent[] {
    return filter ? this.events.filter(filter) : [...this.events];
  }
  
  getEventsByType(eventType: string): WebSocketEvent[] {
    return this.events.filter(event => event.event === eventType);
  }
  
  getEventsByPattern(pattern: string): WebSocketEvent[] {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return this.events.filter(event => regex.test(event.event));
  }
  
  getEventsInRange(startTime: number, endTime: number): WebSocketEvent[] {
    return this.events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );
  }
  
  clear(): void {
    this.events = [];
  }
  
  size(): number {
    return this.events.length;
  }
}

// Event Batching
export class EventBatcher {
  private batches: Map<string, WebSocketEvent[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, (events: WebSocketEvent[]) => void> = new Map();
  
  constructor(private defaultBatchSize = 10, private defaultTimeout = 1000) {}
  
  add(
    batchKey: string,
    event: WebSocketEvent,
    callback: (events: WebSocketEvent[]) => void,
    batchSize?: number,
    timeout?: number
  ): void {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
      this.callbacks.set(batchKey, callback);
    }
    
    const batch = this.batches.get(batchKey)!;
    batch.push(event);
    
    const maxSize = batchSize || this.defaultBatchSize;
    const maxTimeout = timeout || this.defaultTimeout;
    
    // Flush if batch is full
    if (batch.length >= maxSize) {
      this.flush(batchKey);
      return;
    }
    
    // Set timeout if not already set
    if (!this.timers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.flush(batchKey);
      }, maxTimeout);
      
      this.timers.set(batchKey, timer);
    }
  }
  
  flush(batchKey: string): void {
    const batch = this.batches.get(batchKey);
    const callback = this.callbacks.get(batchKey);
    const timer = this.timers.get(batchKey);
    
    if (batch && callback && batch.length > 0) {
      callback([...batch]);
      batch.length = 0; // Clear batch
    }
    
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(batchKey);
    }
  }
  
  flushAll(): void {
    for (const batchKey of this.batches.keys()) {
      this.flush(batchKey);
    }
  }
  
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.batches.clear();
    this.timers.clear();
    this.callbacks.clear();
  }
}

// Event Debouncing
export const createEventDebouncer = (delay: number) => {
  const timeouts = new Map<string, NodeJS.Timeout>();
  
  return (key: string, callback: () => void) => {
    const existingTimeout = timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(() => {
      callback();
      timeouts.delete(key);
    }, delay);
    
    timeouts.set(key, timeout);
  };
};

// Event Throttling
export const createEventThrottler = (interval: number) => {
  const lastExecution = new Map<string, number>();
  
  return (key: string, callback: () => void) => {
    const now = Date.now();
    const last = lastExecution.get(key) || 0;
    
    if (now - last >= interval) {
      callback();
      lastExecution.set(key, now);
    }
  };
};

// Subscription Management
export class SubscriptionManager {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventCounts: Map<string, number> = new Map();
  
  add(subscription: EventSubscription): string {
    this.subscriptions.set(subscription.id, subscription);
    
    // Track event counts
    const count = this.eventCounts.get(subscription.event) || 0;
    this.eventCounts.set(subscription.event, count + 1);
    
    return subscription.id;
  }
  
  remove(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;
    
    this.subscriptions.delete(subscriptionId);
    
    // Update event counts
    const count = this.eventCounts.get(subscription.event) || 0;
    if (count > 1) {
      this.eventCounts.set(subscription.event, count - 1);
    } else {
      this.eventCounts.delete(subscription.event);
    }
    
    return true;
  }
  
  get(subscriptionId: string): EventSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }
  
  getByEvent(event: string): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.event === event || sub.event === "*"
    );
  }
  
  getAll(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }
  
  getEventCounts(): Record<string, number> {
    return Object.fromEntries(this.eventCounts);
  }
  
  clear(): void {
    this.subscriptions.clear();
    this.eventCounts.clear();
  }
  
  size(): number {
    return this.subscriptions.size;
  }
}

// Event Validation
export const validateWebSocketMessage = (message: any): string[] => {
  const errors: string[] = [];
  
  if (!message) {
    errors.push("Message is required");
    return errors;
  }
  
  if (typeof message !== "object") {
    errors.push("Message must be an object");
    return errors;
  }
  
  if (!message.id || typeof message.id !== "string") {
    errors.push("Message ID is required and must be a string");
  }
  
  if (!message.type || typeof message.type !== "string") {
    errors.push("Message type is required and must be a string");
  }
  
  if (!message.event || typeof message.event !== "string") {
    errors.push("Message event is required and must be a string");
  }
  
  if (message.timestamp && (typeof message.timestamp !== "number" || message.timestamp <= 0)) {
    errors.push("Message timestamp must be a positive number");
  }
  
  if (message.priority && !["low", "medium", "high", "urgent"].includes(message.priority)) {
    errors.push("Message priority must be one of: low, medium, high, urgent");
  }
  
  if (message.ttl && (typeof message.ttl !== "number" || message.ttl <= 0)) {
    errors.push("Message TTL must be a positive number");
  }
  
  return errors;
};

// Utility Functions
export const generateEventId = (): string => {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isEventExpired = (event: WebSocketEvent, ttl?: number): boolean => {
  if (!ttl) return false;
  return Date.now() - event.timestamp > ttl;
};

export const getEventAge = (event: WebSocketEvent): number => {
  return Date.now() - event.timestamp;
};

export const sortEventsByTimestamp = (events: WebSocketEvent[], ascending = true): WebSocketEvent[] => {
  return [...events].sort((a, b) => {
    const diff = a.timestamp - b.timestamp;
    return ascending ? diff : -diff;
  });
};

export const groupEventsByType = (events: WebSocketEvent[]): Record<string, WebSocketEvent[]> => {
  return events.reduce((groups, event) => {
    const type = event.event;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(event);
    return groups;
  }, {} as Record<string, WebSocketEvent[]>);
};

export const getUniqueEventTypes = (events: WebSocketEvent[]): string[] => {
  return [...new Set(events.map(event => event.event))];
};

export const createEventSummary = (events: WebSocketEvent[]) => {
  const typeGroups = groupEventsByType(events);
  const summary = {
    totalEvents: events.length,
    eventTypes: Object.keys(typeGroups).length,
    eventCounts: Object.fromEntries(
      Object.entries(typeGroups).map(([type, events]) => [type, events.length])
    ),
    timeRange: events.length > 0 ? {
      earliest: Math.min(...events.map(e => e.timestamp)),
      latest: Math.max(...events.map(e => e.timestamp)),
    } : null,
  };
  
  return summary;
};

// Export all utilities
export default {
  createWebSocketMessage,
  createWebSocketEvent,
  isVotingEvent,
  isCommunityEvent,
  isNotificationEvent,
  isSystemEvent,
  isConnectionEvent,
  isHeartbeatEvent,
  createEventFilter,
  createPriorityFilter,
  createSourceFilter,
  createTimeFilter,
  createEventTransformer,
  createDataExtractor,
  EventAggregator,
  EventBatcher,
  createEventDebouncer,
  createEventThrottler,
  SubscriptionManager,
  validateWebSocketMessage,
  generateEventId,
  isEventExpired,
  getEventAge,
  sortEventsByTimestamp,
  groupEventsByType,
  getUniqueEventTypes,
  createEventSummary,
};
