const { Op } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote } = require('../models');
const blockchainService = require('../services/blockchain');
const auditService = require('../services/audit');
const redis = require('../redis');
require('dotenv').config();

/**
 * Event Processing System
 * Handles blockchain events and synchronizes them with backend database
 */
class EventProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
    this.eventHandlers = new Map();
    this.retryAttempts = new Map();
    this.maxRetryAttempts = parseInt(process.env.MAX_EVENT_RETRY_ATTEMPTS || '3', 10);
    this.retryDelay = parseInt(process.env.EVENT_RETRY_DELAY || '5000', 10);
    this.batchSize = parseInt(process.env.EVENT_BATCH_SIZE || '10', 10);
    
    this.initializeEventHandlers();
  }

  /**
   * Initialize event handlers for different blockchain events
   */
  initializeEventHandlers() {
    // Community events
    this.eventHandlers.set('CommunityCreated', this.handleCommunityCreated.bind(this));
    this.eventHandlers.set('CommunityUpdated', this.handleCommunityUpdated.bind(this));
    this.eventHandlers.set('CommunityDeleted', this.handleCommunityDeleted.bind(this));
    
    // Membership events
    this.eventHandlers.set('MemberJoined', this.handleMemberJoined.bind(this));
    this.eventHandlers.set('MemberLeft', this.handleMemberLeft.bind(this));
    this.eventHandlers.set('MemberApproved', this.handleMemberApproved.bind(this));
    this.eventHandlers.set('MemberRoleChanged', this.handleMemberRoleChanged.bind(this));
    
    // Voting events
    this.eventHandlers.set('VotingQuestionCreated', this.handleVotingQuestionCreated.bind(this));
    this.eventHandlers.set('VotingQuestionUpdated', this.handleVotingQuestionUpdated.bind(this));
    this.eventHandlers.set('VotingQuestionDeleted', this.handleVotingQuestionDeleted.bind(this));
    this.eventHandlers.set('VoteCast', this.handleVoteCast.bind(this));
    this.eventHandlers.set('VoteUpdated', this.handleVoteUpdated.bind(this));
    this.eventHandlers.set('VotingEnded', this.handleVotingEnded.bind(this));
    
    // User events
    this.eventHandlers.set('UserRegistered', this.handleUserRegistered.bind(this));
    this.eventHandlers.set('UserUpdated', this.handleUserUpdated.bind(this));
  }

  /**
   * Process blockchain event
   */
  async processEvent(eventData) {
    try {
      const { eventType, data, network, transactionId, blockNumber } = eventData;
      
      console.log(`Processing event: ${eventType}`, { transactionId, blockNumber });
      
      // Add to processing queue
      this.processingQueue.push({
        eventType,
        data,
        network,
        transactionId,
        blockNumber,
        timestamp: new Date(),
        retryCount: 0
      });
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
      
      // Log event received
      await auditService.logAuditEvent('blockchain_event_received', {
        level: 'INFO',
        category: 'SYNC',
        details: { eventType, transactionId, blockNumber, network }
      });
      
    } catch (error) {
      console.error('Failed to process event:', error.message);
      
      await auditService.logAuditEvent('event_processing_error', {
        level: 'ERROR',
        category: 'SYNC',
        details: { error: error.message, eventData }
      });
    }
  }

  /**
   * Process events in queue
   */
  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.splice(0, this.batchSize);
        
        // Process batch in parallel
        const promises = batch.map(event => this.processEventItem(event));
        await Promise.allSettled(promises);
        
        // Small delay between batches
        if (this.processingQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error processing event queue:', error.message);
    } finally {
      this.isProcessing = false;
      
      // Check if more events were added while processing
      if (this.processingQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Process individual event item
   */
  async processEventItem(eventItem) {
    try {
      const { eventType, data, network, transactionId, blockNumber, retryCount } = eventItem;
      
      const handler = this.eventHandlers.get(eventType);
      if (!handler) {
        console.warn(`No handler found for event type: ${eventType}`);
        return;
      }
      
      // Process the event
      await handler(data, network, transactionId, blockNumber);
      
      // Log successful processing
      await auditService.logAuditEvent('event_processed_successfully', {
        level: 'INFO',
        category: 'SYNC',
        details: { eventType, transactionId, blockNumber, network }
      });
      
    } catch (error) {
      console.error('Failed to process event item:', error.message);
      
      // Handle retry logic
      if (eventItem.retryCount < this.maxRetryAttempts) {
        eventItem.retryCount++;
        eventItem.timestamp = new Date();
        
        // Add back to queue with delay
        setTimeout(() => {
          this.processingQueue.unshift(eventItem);
          if (!this.isProcessing) {
            this.processQueue();
          }
        }, this.retryDelay * eventItem.retryCount);
        
        await auditService.logAuditEvent('event_retry_scheduled', {
          level: 'WARN',
          category: 'SYNC',
          details: { 
            eventType: eventItem.eventType, 
            transactionId: eventItem.transactionId, 
            retryCount: eventItem.retryCount 
          }
        });
      } else {
        // Max retries exceeded
        await auditService.logAuditEvent('event_processing_failed', {
          level: 'ERROR',
          category: 'SYNC',
          details: { 
            eventType: eventItem.eventType, 
            transactionId: eventItem.transactionId, 
            error: error.message 
          }
        });
      }
    }
  }

  /**
   * Handle community created event
   */
  async handleCommunityCreated(data, network, transactionId, blockNumber) {
    try {
      const { communityId, name, description, creator, config } = data;
      
      // Check if community already exists
      const existingCommunity = await Community.findOne({
        where: { on_chain_id: communityId }
      });
      
      if (existingCommunity) {
        console.log(`Community ${communityId} already exists, skipping creation`);
        return;
      }
      
      // Find or create user
      const user = await this.findOrCreateUser(creator);
      
      // Create community
      const community = await Community.create({
        on_chain_id: communityId,
        name,
        description,
        created_by: user.id,
        config: JSON.stringify(config),
        network,
        transaction_id: transactionId,
        block_number: blockNumber,
        status: 'active'
      });
      
      // Create membership for creator
      await Member.create({
        community_id: community.id,
        user_id: user.id,
        role: 'admin',
        status: 'active',
        joined_at: new Date(),
        network,
        transaction_id: transactionId
      });
      
      // Update cache
      await this.updateCommunityCache(community);
      
      console.log(`Community created: ${communityId}`);
      
    } catch (error) {
      console.error('Failed to handle community created event:', error.message);
      throw error;
    }
  }

  /**
   * Handle community updated event
   */
  async handleCommunityUpdated(data, network, transactionId, blockNumber) {
    try {
      const { communityId, name, description, config } = data;
      
      const community = await Community.findOne({
        where: { on_chain_id: communityId }
      });
      
      if (!community) {
        console.warn(`Community ${communityId} not found for update`);
        return;
      }
      
      // Update community
      await community.update({
        name: name || community.name,
        description: description || community.description,
        config: config ? JSON.stringify(config) : community.config,
        updated_at: new Date(),
        network,
        transaction_id: transactionId,
        block_number: blockNumber
      });
      
      // Update cache
      await this.updateCommunityCache(community);
      
      console.log(`Community updated: ${communityId}`);
      
    } catch (error) {
      console.error('Failed to handle community updated event:', error.message);
      throw error;
    }
  }

  /**
   * Handle member joined event
   */
  async handleMemberJoined(data, network, transactionId, blockNumber) {
    try {
      const { communityId, memberAddress, role } = data;
      
      const community = await Community.findOne({
        where: { on_chain_id: communityId }
      });
      
      if (!community) {
        console.warn(`Community ${communityId} not found for member join`);
        return;
      }
      
      const user = await this.findOrCreateUser(memberAddress);
      
      // Check if membership already exists
      const existingMembership = await Member.findOne({
        where: {
          community_id: community.id,
          user_id: user.id
        }
      });
      
      if (existingMembership) {
        // Update existing membership
        await existingMembership.update({
          role: role || existingMembership.role,
          status: 'active',
          updated_at: new Date(),
          network,
          transaction_id: transactionId
        });
      } else {
        // Create new membership
        await Member.create({
          community_id: community.id,
          user_id: user.id,
          role: role || 'member',
          status: 'active',
          joined_at: new Date(),
          network,
          transaction_id: transactionId
        });
      }
      
      console.log(`Member joined: ${memberAddress} -> ${communityId}`);
      
    } catch (error) {
      console.error('Failed to handle member joined event:', error.message);
      throw error;
    }
  }

  /**
   * Handle voting question created event
   */
  async handleVotingQuestionCreated(data, network, transactionId, blockNumber) {
    try {
      const { questionId, communityId, title, description, options, deadline, creator } = data;
      
      const community = await Community.findOne({
        where: { on_chain_id: communityId }
      });
      
      if (!community) {
        console.warn(`Community ${communityId} not found for question creation`);
        return;
      }
      
      const user = await this.findOrCreateUser(creator);
      
      // Create voting question
      const question = await VotingQuestion.create({
        on_chain_id: questionId,
        community_id: community.id,
        title,
        description,
        options: JSON.stringify(options),
        deadline: new Date(deadline),
        created_by: user.id,
        status: 'active',
        network,
        transaction_id: transactionId,
        block_number: blockNumber
      });
      
      console.log(`Voting question created: ${questionId}`);
      
    } catch (error) {
      console.error('Failed to handle voting question created event:', error.message);
      throw error;
    }
  }

  /**
   * Handle vote cast event
   */
  async handleVoteCast(data, network, transactionId, blockNumber) {
    try {
      const { questionId, voterAddress, voteData, signature } = data;
      
      const question = await VotingQuestion.findOne({
        where: { on_chain_id: questionId }
      });
      
      if (!question) {
        console.warn(`Question ${questionId} not found for vote`);
        return;
      }
      
      const user = await this.findOrCreateUser(voterAddress);
      
      // Check if vote already exists
      const existingVote = await Vote.findOne({
        where: {
          question_id: question.id,
          user_id: user.id
        }
      });
      
      if (existingVote) {
        // Update existing vote
        await existingVote.update({
          vote_data: JSON.stringify(voteData),
          signature,
          updated_at: new Date(),
          network,
          transaction_id: transactionId
        });
      } else {
        // Create new vote
        await Vote.create({
          question_id: question.id,
          user_id: user.id,
          vote_data: JSON.stringify(voteData),
          signature,
          network,
          transaction_id: transactionId
        });
      }
      
      console.log(`Vote cast: ${voterAddress} -> ${questionId}`);
      
    } catch (error) {
      console.error('Failed to handle vote cast event:', error.message);
      throw error;
    }
  }

  /**
   * Find or create user by wallet address
   */
  async findOrCreateUser(walletAddress) {
    try {
      let user = await User.findOne({
        where: { wallet_address: walletAddress }
      });
      
      if (!user) {
        user = await User.create({
          wallet_address: walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
          status: 'active'
        });
      }
      
      return user;
    } catch (error) {
      console.error('Failed to find or create user:', error.message);
      throw error;
    }
  }

  /**
   * Update community cache
   */
  async updateCommunityCache(community) {
    try {
      const redisClient = redis.getRedisClient();
      const cacheKey = `community:${community.on_chain_id}`;
      
      await redisClient.hset(cacheKey, 'data', JSON.stringify(community.toJSON()));
      await redisClient.expire(cacheKey, 3600); // 1 hour
      
    } catch (error) {
      console.error('Failed to update community cache:', error.message);
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStatistics() {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      retryAttempts: Object.fromEntries(this.retryAttempts)
    };
  }

  /**
   * Clear processing queue
   */
  clearQueue() {
    this.processingQueue = [];
    console.log('Event processing queue cleared');
  }
}

// Create singleton instance
const eventProcessor = new EventProcessor();

module.exports = eventProcessor; 