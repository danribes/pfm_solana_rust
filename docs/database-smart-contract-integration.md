# Database-Smart Contract Integration Architecture

## Overview

This document explains how the database interacts with Solana smart contracts, backend services, and frontend applications in the community voting system. Understanding this integration is crucial for maintaining data consistency, handling blockchain events, and ensuring reliable system operation.

## **🏗️ Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Smart Contract│
│   (React/Vue)   │◄──►│   (Express.js)  │◄──►│   (Solana)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │  (PostgreSQL)   │
                       └─────────────────┘
```

## **🔗 Integration Patterns**

### 1. Event-Driven Architecture

The system uses an event-driven approach where smart contract events trigger database updates:

```javascript
// Smart Contract Event → Backend Handler → Database Update
Smart Contract Event → Event Listener → Backend Service → Database Transaction
```

### 2. Dual-Write Pattern

Critical operations write to both blockchain and database:

```javascript
// Example: Creating a community
async function createCommunity(communityData) {
  // 1. Create on blockchain
  const tx = await createCommunityOnChain(communityData);
  
  // 2. Store transaction in database
  await db.communities.create({
    ...communityData,
    on_chain_id: tx.communityId,
    transaction_signature: tx.signature,
    created_at: new Date()
  });
  
  // 3. Return combined result
  return { blockchain: tx, database: community };
}
```

### 3. Read-Through Caching

Database serves as a cache for blockchain data:

```javascript
// Example: Getting community data
async function getCommunity(communityId) {
  // 1. Check database first
  let community = await db.communities.findByPk(communityId);
  
  // 2. If not found or stale, fetch from blockchain
  if (!community || isStale(community.updated_at)) {
    const onChainData = await getCommunityFromChain(community.on_chain_id);
    community = await updateCommunityInDb(communityId, onChainData);
  }
  
  return community;
}
```

## **🛠️ Tools and Technologies**

### 1. Blockchain Integration Tools

#### **Solana Web3.js**
```javascript
// backend/services/blockchain.js
const { Connection, PublicKey, Transaction } = require('@solana/web3.js');

class SolanaService {
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL);
  }
  
  async getAccountInfo(publicKey) {
    return await this.connection.getAccountInfo(new PublicKey(publicKey));
  }
  
  async sendTransaction(transaction) {
    return await this.connection.sendTransaction(transaction);
  }
}
```

#### **Anchor Framework**
```javascript
// backend/services/anchor.js
const { Program, AnchorProvider } = require('@project-serum/anchor');
const { Connection, Keypair } = require('@solana/web3.js');

class AnchorService {
  constructor() {
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL, PROGRAM_ID, this.provider);
  }
  
  async createCommunity(data) {
    return await this.program.methods
      .createCommunity(data.name, data.description)
      .accounts({
        community: communityKeypair.publicKey,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}
```

### 2. Database Integration Tools

#### **Sequelize ORM**
```javascript
// backend/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// Model associations
Community.hasMany(VotingQuestion, { foreignKey: 'community_id' });
VotingQuestion.hasMany(Vote, { foreignKey: 'question_id' });
```

#### **Database Migrations**
```javascript
// backend/database/migrations/001_create_communities.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('communities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      on_chain_id: {
        type: Sequelize.STRING(44),
        unique: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // ... other fields
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('communities');
  }
};
```

### 3. Event Management Tools

#### **Event Listeners**
```javascript
// backend/services/eventListener.js
class EventListener {
  constructor(connection, programId) {
    this.connection = connection;
    this.programId = programId;
  }
  
  async listenToEvents() {
    this.connection.onProgramAccountChange(
      this.programId,
      async (accountInfo, context) => {
        await this.handleAccountChange(accountInfo, context);
      }
    );
  }
  
  async handleAccountChange(accountInfo, context) {
    // Parse event data and update database
    const eventData = this.parseEventData(accountInfo);
    await this.updateDatabase(eventData);
  }
}
```

#### **WebSocket Integration**
```javascript
// backend/services/websocket.js
const WebSocket = require('ws');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
  }
  
  broadcast(event, data) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}
```

## **🔄 Data Flow Patterns**

### 1. Community Creation Flow

```javascript
// 1. Frontend sends request
POST /api/communities
{
  "name": "My Community",
  "description": "A great community"
}

// 2. Backend validates and creates on blockchain
async function createCommunity(req, res) {
  try {
    // Validate input
    const validation = validateCommunityCreation(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Create on blockchain
    const tx = await solanaService.createCommunity(req.body);
    
    // Store in database
    const community = await db.communities.create({
      ...req.body,
      on_chain_id: tx.communityId,
      transaction_signature: tx.signature,
      created_by: req.session.userId
    });
    
    // Broadcast event
    websocketService.broadcast('community:created', community);
    
    res.status(201).json({ success: true, data: community });
  } catch (error) {
    // Handle rollback if needed
    await handleCreationError(error);
    res.status(500).json({ error: 'Failed to create community' });
  }
}
```

### 2. Voting Flow

```javascript
// 1. User casts vote
POST /api/communities/:id/questions/:questionId/votes
{
  "selected_options": ["Option 1"],
  "is_anonymous": false
}

// 2. Backend processes vote
async function castVote(req, res) {
  try {
    // Validate vote eligibility
    const eligibility = await votesService.checkEligibility(
      req.params.communityId, 
      req.params.questionId, 
      req.session.userId
    );
    
    if (!eligibility.canVote) {
      return res.status(403).json({ error: eligibility.reason });
    }
    
    // Cast vote on blockchain
    const tx = await solanaService.castVote({
      questionId: req.params.questionId,
      selectedOptions: req.body.selected_options,
      voter: req.session.walletAddress
    });
    
    // Store vote in database
    const vote = await db.votes.create({
      question_id: req.params.questionId,
      user_id: req.session.userId,
      selected_options: req.body.selected_options,
      transaction_signature: tx.signature,
      is_anonymous: req.body.is_anonymous
    });
    
    // Update question vote count
    await db.votingQuestions.increment('total_votes', {
      where: { id: req.params.questionId }
    });
    
    // Broadcast real-time update
    websocketService.broadcast('vote:cast', {
      questionId: req.params.questionId,
      voteCount: question.total_votes + 1
    });
    
    res.status(201).json({ success: true, data: vote });
  } catch (error) {
    await handleVoteError(error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
}
```

### 3. Data Synchronization Flow

```javascript
// Periodic sync job
class DataSyncService {
  async syncBlockchainData() {
    try {
      // Get all communities from database
      const communities = await db.communities.findAll();
      
      for (const community of communities) {
        // Fetch latest data from blockchain
        const onChainData = await solanaService.getCommunity(community.on_chain_id);
        
        // Compare and update if different
        if (this.hasChanges(community, onChainData)) {
          await db.communities.update(onChainData, {
            where: { id: community.id }
          });
          
          // Broadcast update
          websocketService.broadcast('community:updated', {
            id: community.id,
            changes: this.getChanges(community, onChainData)
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      // Retry logic
      await this.retrySync();
    }
  }
}
```

## **🔧 Management Tools**

### 1. Development Tools

#### **Anchor CLI**
```bash
# Deploy smart contract
anchor deploy

# Run tests
anchor test

# Generate client
anchor build
```

#### **Database Management**
```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed data
npx sequelize-cli db:seed:all

# Reset database
npx sequelize-cli db:drop && npx sequelize-cli db:create
```

#### **Development Scripts**
```json
// package.json
{
  "scripts": {
    "dev": "nodemon backend/app.js",
    "test": "jest",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all",
    "contract:deploy": "anchor deploy",
    "contract:test": "anchor test"
  }
}
```

### 2. Monitoring Tools

#### **Health Checks**
```javascript
// backend/health/blockchain.js
async function checkBlockchainHealth() {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const slot = await connection.getSlot();
    return { status: 'healthy', slot };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

// backend/health/database.js
async function checkDatabaseHealth() {
  try {
    await sequelize.authenticate();
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

#### **Logging and Monitoring**
```javascript
// backend/services/monitoring.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

class MonitoringService {
  logBlockchainEvent(event, data) {
    logger.info('Blockchain Event', { event, data, timestamp: new Date() });
  }
  
  logDatabaseOperation(operation, table, data) {
    logger.info('Database Operation', { operation, table, data, timestamp: new Date() });
  }
}
```

### 3. Testing Tools

#### **Integration Tests**
```javascript
// backend/tests/integration/blockchain-db.test.js
describe('Blockchain-Database Integration', () => {
  it('should create community on both blockchain and database', async () => {
    // Test community creation flow
    const communityData = {
      name: 'Test Community',
      description: 'Test Description'
    };
    
    const response = await request(app)
      .post('/api/communities')
      .send(communityData)
      .expect(201);
    
    // Verify blockchain transaction
    const tx = await solanaService.getTransaction(response.body.data.transaction_signature);
    expect(tx).toBeDefined();
    
    // Verify database record
    const community = await db.communities.findByPk(response.body.data.id);
    expect(community.name).toBe(communityData.name);
  });
});
```

#### **End-to-End Tests**
```javascript
// backend/tests/e2e/voting-flow.test.js
describe('Voting Flow E2E', () => {
  it('should handle complete voting flow', async () => {
    // 1. Create community
    const community = await createTestCommunity();
    
    // 2. Create question
    const question = await createTestQuestion(community.id);
    
    // 3. Cast vote
    const vote = await castTestVote(question.id);
    
    // 4. Verify blockchain state
    const onChainVote = await solanaService.getVote(vote.transaction_signature);
    expect(onChainVote).toBeDefined();
    
    // 5. Verify database state
    const dbVote = await db.votes.findByPk(vote.id);
    expect(dbVote.selected_options).toEqual(vote.selected_options);
  });
});
```

## **🚨 Error Handling and Recovery**

### 1. Transaction Rollback
```javascript
// backend/services/transactionManager.js
class TransactionManager {
  async executeWithRollback(operations) {
    const transaction = await sequelize.transaction();
    
    try {
      // Execute operations
      for (const operation of operations) {
        await operation(transaction);
      }
      
      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      
      // Attempt blockchain rollback if needed
      await this.rollbackBlockchain(operations);
      
      throw error;
    }
  }
}
```

### 2. Data Consistency Checks
```javascript
// backend/services/consistencyChecker.js
class ConsistencyChecker {
  async checkDataConsistency() {
    const inconsistencies = [];
    
    // Check communities
    const communities = await db.communities.findAll();
    for (const community of communities) {
      const onChainData = await solanaService.getCommunity(community.on_chain_id);
      if (!this.isConsistent(community, onChainData)) {
        inconsistencies.push({
          type: 'community',
          id: community.id,
          onChainId: community.on_chain_id,
          differences: this.getDifferences(community, onChainData)
        });
      }
    }
    
    return inconsistencies;
  }
}
```

### 3. Recovery Procedures
```javascript
// backend/services/recovery.js
class RecoveryService {
  async recoverFromInconsistency(inconsistency) {
    switch (inconsistency.type) {
      case 'community':
        await this.recoverCommunity(inconsistency);
        break;
      case 'vote':
        await this.recoverVote(inconsistency);
        break;
      default:
        throw new Error(`Unknown inconsistency type: ${inconsistency.type}`);
    }
  }
  
  async recoverCommunity(inconsistency) {
    // Fetch latest data from blockchain
    const onChainData = await solanaService.getCommunity(inconsistency.onChainId);
    
    // Update database
    await db.communities.update(onChainData, {
      where: { id: inconsistency.id }
    });
    
    // Log recovery
    logger.info('Community recovered', { inconsistency, recoveredAt: new Date() });
  }
}
```

## **📊 Performance Optimization**

### 1. Caching Strategies
```javascript
// backend/services/cache.js
class CacheService {
  async getCommunityWithCache(communityId) {
    const cacheKey = `community:${communityId}`;
    
    // Check cache first
    let community = await this.get(cacheKey);
    if (community) {
      return community;
    }
    
    // Fetch from database
    community = await db.communities.findByPk(communityId);
    if (community) {
      // Cache for 5 minutes
      await this.set(cacheKey, community, 300);
    }
    
    return community;
  }
}
```

### 2. Batch Operations
```javascript
// backend/services/batchProcessor.js
class BatchProcessor {
  async processVotesBatch(votes) {
    // Group votes by question
    const votesByQuestion = this.groupVotesByQuestion(votes);
    
    // Process each question's votes in batch
    for (const [questionId, questionVotes] of Object.entries(votesByQuestion)) {
      await this.processQuestionVotes(questionId, questionVotes);
    }
  }
}
```

### 3. Connection Pooling
```javascript
// backend/config/database.js
const config = {
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
};
```

This architecture ensures reliable integration between the database, smart contracts, backend, and frontend while providing tools for development, monitoring, testing, and recovery. 