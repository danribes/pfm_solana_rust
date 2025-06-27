const { Connection, PublicKey } = require('@solana/web3.js');
const solanaClient = require('./solana');
const contractManager = require('./contracts');
const auditService = require('../services/audit');
const redis = require('../redis');
require('dotenv').config();

/**
 * Blockchain Event Listening
 * Handles WebSocket connections, event filtering, processing, and persistence
 */
class EventListener {
  constructor() {
    this.connections = new Map();
    this.subscriptions = new Map();
    this.eventHandlers = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5', 10);
    this.reconnectDelay = parseInt(process.env.RECONNECT_DELAY || '5000', 10);
    this.eventCache = new Map();
    this.isRunning = false;
    
    this.initializeEventHandlers();
  }

  /**
   * Initialize event handlers for different event types
   */
  initializeEventHandlers() {
    // Community events
    this.eventHandlers.set('CommunityCreated', this.handleCommunityCreated.bind(this));
    this.eventHandlers.set('MemberJoined', this.handleMemberJoined.bind(this));
    this.eventHandlers.set('MemberLeft', this.handleMemberLeft.bind(this));
    
    // Voting events
    this.eventHandlers.set('VotingQuestionCreated', this.handleVotingQuestionCreated.bind(this));
    this.eventHandlers.set('VoteCast', this.handleVoteCast.bind(this));
    this.eventHandlers.set('VotingEnded', this.handleVotingEnded.bind(this));
    
    // General events
    this.eventHandlers.set('TransactionConfirmed', this.handleTransactionConfirmed.bind(this));
    this.eventHandlers.set('TransactionFailed', this.handleTransactionFailed.bind(this));
  }

  /**
   * Start event listening for all networks
   */
  async startEventListening() {
    try {
      console.log('Starting blockchain event listening...');
      
      this.isRunning = true;
      
      // Start listening for each network
      for (const network of solanaClient.getAvailableNetworks()) {
        await this.startNetworkEventListening(network);
      }
      
      console.log('Blockchain event listening started successfully');
    } catch (error) {
      console.error('Failed to start event listening:', error.message);
      throw error;
    }
  }

  /**
   * Start event listening for a specific network
   */
  async startNetworkEventListening(network) {
    try {
      const connection = solanaClient.getConnection(network);
      
      // Subscribe to program account changes
      const programId = new PublicKey(process.env.VOTING_PROGRAM_ID || '11111111111111111111111111111111');
      
      const subscriptionId = connection.onProgramAccountChange(
        programId,
        (accountInfo, context) => {
          this.handleAccountChange(network, accountInfo, context);
        },
        'confirmed'
      );
      
      this.subscriptions.set(network, subscriptionId);
      console.log(`Started event listening for network: ${network}`);
      
      // Log event listening start
      await auditService.logAuditEvent('blockchain_event_listening_started', {
        level: 'INFO',
        category: 'BLOCKCHAIN',
        details: { network, subscriptionId }
      });
      
    } catch (error) {
      console.error(`Failed to start event listening for ${network}:`, error.message);
      
      // Schedule reconnection
      this.scheduleReconnection(network);
    }
  }

  /**
   * Handle account changes
   */
  async handleAccountChange(network, accountInfo, context) {
    try {
      const eventData = {
        network,
        account: accountInfo.accountId.toString(),
        slot: context.slot,
        writeVersion: context.writeVersion,
        timestamp: new Date().toISOString()
      };
      
      // Cache the event
      this.cacheEvent(eventData);
      
      // Process the event based on account type
      await this.processAccountEvent(eventData);
      
      // Log the event
      await auditService.logAuditEvent('blockchain_account_change', {
        level: 'INFO',
        category: 'BLOCKCHAIN',
        details: eventData
      });
      
    } catch (error) {
      console.error('Failed to handle account change:', error.message);
      
      await auditService.logAuditEvent('blockchain_event_processing_error', {
        level: 'ERROR',
        category: 'BLOCKCHAIN',
        details: { error: error.message, network, account: accountInfo.accountId.toString() }
      });
    }
  }

  /**
   * Process account event based on account type
   */
  async processAccountEvent(eventData) {
    try {
      // Determine account type based on data size or other criteria
      const accountType = this.determineAccountType(eventData.account);
      
      switch (accountType) {
        case 'community':
          await this.handleCommunityEvent(eventData);
          break;
        case 'question':
          await this.handleQuestionEvent(eventData);
          break;
        case 'vote':
          await this.handleVoteEvent(eventData);
          break;
        case 'membership':
          await this.handleMembershipEvent(eventData);
          break;
        default:
          console.log(`Unknown account type for ${eventData.account}`);
      }
      
    } catch (error) {
      console.error('Failed to process account event:', error.message);
      throw error;
    }
  }

  /**
   * Determine account type based on account data
   */
  determineAccountType(accountAddress) {
    // This is a simplified implementation
    // In a real scenario, you would analyze the account data structure
    // For now, we'll use a basic heuristic based on account size
    
    // This would need to be implemented based on your actual account structures
    return 'unknown';
  }

  /**
   * Handle community events
   */
  async handleCommunityEvent(eventData) {
    try {
      const communityData = await contractManager.getCommunityData(eventData.account);
      
      // Store in Redis for real-time access
      const redisClient = redis.getRedisClient();
      await redisClient.hset(
        `community:${eventData.account}`,
        'data',
        JSON.stringify(communityData)
      );
      await redisClient.expire(`community:${eventData.account}`, 3600); // 1 hour
      
      // Publish to WebSocket if available
      this.publishToWebSocket('community_updated', {
        type: 'community_updated',
        data: communityData,
        timestamp: eventData.timestamp
      });
      
    } catch (error) {
      console.error('Failed to handle community event:', error.message);
    }
  }

  /**
   * Handle question events
   */
  async handleQuestionEvent(eventData) {
    try {
      const questionData = await contractManager.getQuestionData(eventData.account);
      
      // Store in Redis for real-time access
      const redisClient = redis.getRedisClient();
      await redisClient.hset(
        `question:${eventData.account}`,
        'data',
        JSON.stringify(questionData)
      );
      await redisClient.expire(`question:${eventData.account}`, 3600); // 1 hour
      
      // Publish to WebSocket if available
      this.publishToWebSocket('question_updated', {
        type: 'question_updated',
        data: questionData,
        timestamp: eventData.timestamp
      });
      
    } catch (error) {
      console.error('Failed to handle question event:', error.message);
    }
  }

  /**
   * Handle vote events
   */
  async handleVoteEvent(eventData) {
    try {
      const voteData = await contractManager.getVoteData(eventData.account);
      
      // Store in Redis for real-time access
      const redisClient = redis.getRedisClient();
      await redisClient.hset(
        `vote:${eventData.account}`,
        'data',
        JSON.stringify(voteData)
      );
      await redisClient.expire(`vote:${eventData.account}`, 3600); // 1 hour
      
      // Publish to WebSocket if available
      this.publishToWebSocket('vote_cast', {
        type: 'vote_cast',
        data: voteData,
        timestamp: eventData.timestamp
      });
      
    } catch (error) {
      console.error('Failed to handle vote event:', error.message);
    }
  }

  /**
   * Handle membership events
   */
  async handleMembershipEvent(eventData) {
    try {
      // Handle membership changes
      this.publishToWebSocket('membership_updated', {
        type: 'membership_updated',
        account: eventData.account,
        timestamp: eventData.timestamp
      });
      
    } catch (error) {
      console.error('Failed to handle membership event:', error.message);
    }
  }

  /**
   * Cache event data
   */
  cacheEvent(eventData) {
    const cacheKey = `event:${eventData.network}:${eventData.account}:${eventData.slot}`;
    this.eventCache.set(cacheKey, {
      ...eventData,
      cachedAt: new Date().toISOString()
    });
    
    // Limit cache size
    if (this.eventCache.size > 1000) {
      const firstKey = this.eventCache.keys().next().value;
      this.eventCache.delete(firstKey);
    }
  }

  /**
   * Publish event to WebSocket
   */
  publishToWebSocket(eventType, data) {
    try {
      // This would integrate with your WebSocket server
      // For now, we'll just log the event
      console.log(`WebSocket event: ${eventType}`, data);
      
      // Store in Redis for WebSocket clients to pick up
      const redisClient = redis.getRedisClient();
      redisClient.publish('blockchain_events', JSON.stringify({
        type: eventType,
        data,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Failed to publish to WebSocket:', error.message);
    }
  }

  /**
   * Schedule reconnection for a network
   */
  scheduleReconnection(network) {
    const attempts = this.reconnectAttempts.get(network) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(network, attempts + 1);
      
      setTimeout(async () => {
        console.log(`Attempting to reconnect to ${network} (attempt ${attempts + 1})`);
        await this.startNetworkEventListening(network);
      }, this.reconnectDelay * (attempts + 1));
      
    } else {
      console.error(`Max reconnection attempts reached for ${network}`);
      
      auditService.logAuditEvent('blockchain_reconnection_failed', {
        level: 'ERROR',
        category: 'BLOCKCHAIN',
        details: { network, attempts }
      });
    }
  }

  /**
   * Stop event listening
   */
  async stopEventListening() {
    try {
      console.log('Stopping blockchain event listening...');
      
      this.isRunning = false;
      
      // Remove all subscriptions
      for (const [network, subscriptionId] of this.subscriptions) {
        try {
          const connection = solanaClient.getConnection(network);
          await connection.removeAccountChangeListener(subscriptionId);
          console.log(`Stopped event listening for ${network}`);
        } catch (error) {
          console.error(`Failed to stop event listening for ${network}:`, error.message);
        }
      }
      
      this.subscriptions.clear();
      this.reconnectAttempts.clear();
      
      console.log('Blockchain event listening stopped successfully');
      
    } catch (error) {
      console.error('Failed to stop event listening:', error.message);
      throw error;
    }
  }

  /**
   * Get event listening status
   */
  getEventListeningStatus() {
    const status = {
      isRunning: this.isRunning,
      networks: [],
      subscriptions: this.subscriptions.size,
      cacheSize: this.eventCache.size,
      timestamp: new Date().toISOString()
    };
    
    for (const network of solanaClient.getAvailableNetworks()) {
      status.networks.push({
        network,
        hasSubscription: this.subscriptions.has(network),
        reconnectAttempts: this.reconnectAttempts.get(network) || 0
      });
    }
    
    return status;
  }

  /**
   * Get cached events
   */
  getCachedEvents(limit = 100) {
    const events = Array.from(this.eventCache.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return events;
  }

  /**
   * Clear event cache
   */
  clearEventCache() {
    this.eventCache.clear();
    console.log('Event cache cleared');
  }

  /**
   * Get event statistics
   */
  getEventStatistics() {
    const stats = {
      totalEvents: this.eventCache.size,
      networks: {},
      eventTypes: {},
      timestamp: new Date().toISOString()
    };
    
    // Count events by network and type
    for (const event of this.eventCache.values()) {
      // Count by network
      stats.networks[event.network] = (stats.networks[event.network] || 0) + 1;
      
      // Count by event type (if available)
      const eventType = event.type || 'unknown';
      stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + 1;
    }
    
    return stats;
  }
}

// Create singleton instance
const eventListener = new EventListener();

module.exports = eventListener; 